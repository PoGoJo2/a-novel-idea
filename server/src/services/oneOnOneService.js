const OneOnOneSlot = require('../models/OneOnOneSlot');
const ReadingGroup = require('../models/ReadingGroup');
const AppError = require('../utils/AppError');
const { formatBook } = require('./groupService');
const { getGroupAccess, requireLeader } = require('./groupAccess');

const COUNTED = ['booked', 'completed']; // these use up one of the member's one-on-ones

const usedCount = (groupId, userId) => OneOnOneSlot.countDocuments({ group: groupId, bookedBy: userId, status: { $in: COUNTED } });

// LIST: members see open future times plus their own bookings; the leader sees every time and who booked it.
const listSlots = async (groupId, user) => {
  const { group, isLeader } = await getGroupAccess(groupId, user);

  if (isLeader) {
    const slots = await OneOnOneSlot.find({ group: group._id, status: { $ne: 'cancelled' } })
      .populate('bookedBy', 'name email')
      .sort({ startsAtUtc: 1 });
    return {
      role: 'leader',
      slots: slots.map((s) => ({
        id: s._id, startsAtUtc: s.startsAtUtc, durationMinutes: s.durationMinutes, status: s.status,
        meetingLink: s.meetingLink, bookedBy: s.bookedBy ? { name: s.bookedBy.name, email: s.bookedBy.email } : null,
      })),
    };
  }

  const used = await usedCount(group._id, user._id);
  const slots = await OneOnOneSlot.find({
    group: group._id,
    $or: [
      { status: 'open', startsAtUtc: { $gt: new Date() } },
      { bookedBy: user._id, status: { $in: COUNTED } },
    ],
  }).sort({ startsAtUtc: 1 });

  return {
    role: 'member',
    allowance: group.oneOnOneAllowance,
    used,
    remaining: Math.max(group.oneOnOneAllowance - used, 0),
    slots: slots.map((s) => {
      const mine = String(s.bookedBy) === String(user._id);
      return {
        id: s._id, startsAtUtc: s.startsAtUtc, durationMinutes: s.durationMinutes, status: s.status, mine,
        meetingLink: mine ? s.meetingLink : undefined, // the video link is only for the person who booked
      };
    }),
  };
};

// BOOK: a member takes an open time, as long as they have one-on-ones left
const bookSlot = async (slotId, user) => {
  const slot = await OneOnOneSlot.findById(slotId);
  if (!slot) throw new AppError('That one-on-one time was not found', 404);

  const { group, isLeader } = await getGroupAccess(slot.group, user);
  if (isLeader) throw new AppError('Leaders cannot book their own one-on-ones', 400);

  if ((await usedCount(group._id, user._id)) >= group.oneOnOneAllowance) {
    throw new AppError(`You have used all ${group.oneOnOneAllowance} of your one-on-ones for this book`, 409);
  }

  // One atomic step: only succeeds if the time is still open, so two members cannot get the same time
  const booked = await OneOnOneSlot.findOneAndUpdate(
    { _id: slotId, status: 'open', startsAtUtc: { $gt: new Date() } },
    { $set: { status: 'booked', bookedBy: user._id } },
    { new: true }
  );
  if (!booked) throw new AppError('That time was just taken or has passed', 409);
  return { id: booked._id, startsAtUtc: booked.startsAtUtc, status: booked.status };
};

// CANCEL MY BOOKING: puts the time back so someone else can take it (and gives the member their one-on-one back)
const cancelMyBooking = async (slotId, user) => {
  const slot = await OneOnOneSlot.findOneAndUpdate(
    { _id: slotId, bookedBy: user._id, status: 'booked', startsAtUtc: { $gt: new Date() } },
    { $set: { status: 'open', bookedBy: null } },
    { new: true }
  );
  if (!slot) throw new AppError('Booking not found, or it has already started', 404);
};

// LEADER: offer a new time
const createSlot = async (groupId, user, { startsAtUtc, durationMinutes, meetingLink }) => {
  const group = await requireLeader(groupId, user);
  const startsAt = new Date(startsAtUtc);
  if (startsAt <= new Date()) throw new AppError('Choose a time in the future', 400);

  const slot = await OneOnOneSlot.create({
    group: group._id,
    leader: group.leader,
    startsAtUtc: startsAt,
    durationMinutes: durationMinutes || 20,
    meetingLink: meetingLink || group.timeSlots[0]?.meetingLink || '',
  });
  return { id: slot._id, startsAtUtc: slot.startsAtUtc, durationMinutes: slot.durationMinutes, status: slot.status };
};

// LEADER: withdraw a time (a booked member's one-on-one is freed because cancelled times are not counted)
const cancelSlot = async (slotId, user) => {
  const slot = await OneOnOneSlot.findById(slotId);
  if (!slot) throw new AppError('That one-on-one time was not found', 404);
  await requireLeader(slot.group, user);
  slot.status = 'cancelled';
  await slot.save();
};

// The groups a leader runs, for the leader tools page
const ledGroups = async (user) => {
  const filter = user.role === 'admin' ? {} : { leader: user._id };
  const groups = await ReadingGroup.find(filter).populate('book');
  return groups.map((g) => ({ id: g._id, book: formatBook(g.book), currentWeek: g.currentWeek, totalWeeks: g.totalWeeks, status: g.status }));
};

module.exports = { listSlots, bookSlot, cancelMyBooking, createSlot, cancelSlot, ledGroups };
