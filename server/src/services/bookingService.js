const ReadingGroup = require('../models/ReadingGroup');
const Membership = require('../models/Membership');
const Meeting = require('../models/Meeting');
const AppError = require('../utils/AppError');
const { formatBook } = require('./groupService');

const countActive = (groupId, slotId) =>
  Membership.countDocuments({ group: groupId, slotId, status: 'active' });

const formatMembership = (membership, slot) => ({
  id: membership._id,
  groupId: membership.group,
  slotId: membership.slotId,
  status: membership.status,
  joinedAt: membership.joinedAt,
  slot: slot && { id: slot._id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, timezone: slot.timezone },
});

// Loads a membership and makes sure it belongs to the person asking.
// A different message than "not yours" is used so nobody can discover other people's bookings.
const getOwnedMembership = async (membershipId, userId) => {
  const membership = await Membership.findById(membershipId);
  if (!membership || String(membership.user) !== String(userId)) {
    throw new AppError('Booking not found', 404);
  }
  return membership;
};

// JOIN: choose one of the group's two time options
const joinGroup = async (userId, groupId, slotId) => {
  const group = await ReadingGroup.findById(groupId);
  if (!group) throw new AppError('Reading group not found', 404);
  if (group.status === 'finished') throw new AppError('This group has already finished', 400);

  const slot = group.timeSlots.id(slotId);
  if (!slot) throw new AppError('That meeting time does not belong to this group', 400);

  const existing = await Membership.findOne({ user: userId, group: group._id, status: 'active' });
  if (existing) {
    throw new AppError('You are already in this group. Use "switch time" to change your meeting time.', 409);
  }

  if ((await countActive(group._id, slot._id)) >= slot.capacity) {
    throw new AppError('That meeting time is full', 409);
  }

  let membership;
  try {
    membership = await Membership.create({ user: userId, group: group._id, slotId: slot._id });
  } catch (err) {
    // The database's unique rule also catches two clicks at the same moment
    if (err.code === 11000) throw new AppError('You are already in this group', 409);
    throw err;
  }

  // Double-check after saving: if two people took the last seat at once, the later one backs out
  if ((await countActive(group._id, slot._id)) > slot.capacity) {
    await Membership.deleteOne({ _id: membership._id });
    throw new AppError('That meeting time just filled up', 409);
  }

  return formatMembership(membership, slot);
};

// SWITCH: move to the group's other time option
const switchSlot = async (userId, membershipId, newSlotId) => {
  const membership = await getOwnedMembership(membershipId, userId);
  if (membership.status !== 'active') throw new AppError('This booking was cancelled. Join the group again instead.', 400);

  const group = await ReadingGroup.findById(membership.group);
  if (!group) throw new AppError('Reading group not found', 404);

  const slot = group.timeSlots.id(newSlotId);
  if (!slot) throw new AppError('That meeting time does not belong to this group', 400);
  if (String(slot._id) === String(membership.slotId)) throw new AppError('You are already in that meeting time', 400);

  if ((await countActive(group._id, slot._id)) >= slot.capacity) {
    throw new AppError('That meeting time is full', 409);
  }

  const oldSlotId = membership.slotId;
  membership.slotId = slot._id;
  await membership.save();

  // Same double-check as joining: undo the move if the seat was taken at the same moment
  if ((await countActive(group._id, slot._id)) > slot.capacity) {
    membership.slotId = oldSlotId;
    await membership.save();
    throw new AppError('That meeting time just filled up', 409);
  }

  return formatMembership(membership, slot);
};

// LEAVE: the record is kept (status "cancelled") so there is a history, and the seat is freed
const leaveGroup = async (userId, membershipId) => {
  const membership = await getOwnedMembership(membershipId, userId);
  if (membership.status !== 'active') throw new AppError('This booking is already cancelled', 400);

  membership.status = 'cancelled';
  membership.cancelledAt = new Date();
  await membership.save();
};

// MY BOOKINGS: everything the dashboard needs, including the video link (members only)
const getMyMemberships = async (userId) => {
  const memberships = await Membership.find({ user: userId, status: 'active' })
    .populate({ path: 'group', populate: [{ path: 'book' }, { path: 'leader', select: 'name' }] })
    .sort({ joinedAt: -1 });

  const active = memberships.filter((m) => m.group); // skip bookings whose group was deleted

  const upcoming = await Meeting.find({
    group: { $in: active.map((m) => m.group._id) },
    startsAtUtc: { $gte: new Date() },
  }).sort({ startsAtUtc: 1 });

  const nextByKey = new Map();
  upcoming.forEach((meeting) => {
    const key = `${meeting.group}-${meeting.slotId}`;
    if (!nextByKey.has(key)) nextByKey.set(key, meeting.startsAtUtc);
  });

  return active.map((m) => {
    const slot = m.group.timeSlots.id(m.slotId);
    return {
      id: m._id,
      joinedAt: m.joinedAt,
      group: {
        id: m.group._id,
        book: formatBook(m.group.book),
        leader: { id: m.group.leader._id, name: m.group.leader.name },
        sessionMinutes: m.group.sessionMinutes,
        totalWeeks: m.group.totalWeeks,
        currentWeek: m.group.currentWeek,
        status: m.group.status,
      },
      slot: slot && {
        id: slot._id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        timezone: slot.timezone,
        meetingLink: slot.meetingLink,
      },
      nextMeetingUtc: nextByKey.get(`${m.group._id}-${m.slotId}`) || null,
    };
  });
};

module.exports = { joinGroup, switchSlot, leaveGroup, getMyMemberships };
