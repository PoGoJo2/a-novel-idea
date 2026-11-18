const ReadingGroup = require('../models/ReadingGroup');
const LeaderRequest = require('../models/LeaderRequest');
const Membership = require('../models/Membership');
const AppError = require('../utils/AppError');
const { completePlans } = require('./goalService');

const BOOK_FIELDS = 'title author retired genre coverUrl accentColors';
const DAY = 24 * 60 * 60 * 1000;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatGroup = (g, extra = {}) => ({
  id: g._id,
  book: { id: g.book?._id, title: g.book?.title, author: g.book?.author, genre: g.book?.genre, coverUrl: g.book?.coverUrl, accentColors: g.book?.accentColors },
  leader: g.leader ? { id: g.leader._id, name: g.leader.name } : null,
  startDate: g.startDate,
  totalWeeks: g.totalWeeks,
  currentWeek: g.currentWeek,
  status: g.status,
  timeSlots: g.timeSlots.map((s) => ({ id: s._id, dayOfWeek: s.dayOfWeek, startTime: s.startTime, timezone: s.timezone })),
  ...extra,
});

const byTitleThenWeek = (a, b) => (a.book.title || '').localeCompare(b.book.title || '') || a.currentWeek - b.currentWeek;

// Two classes clash when their dates overlap and they meet at the same day and time
const endOf = (g) => new Date(new Date(g.startDate).getTime() + g.totalWeeks * 7 * DAY);
const clashWith = (candidate, mine) => {
  const hit = mine.find((m) => {
    if (String(m._id) === String(candidate._id)) return false;
    const overlap = new Date(candidate.startDate) < endOf(m) && new Date(m.startDate) < endOf(candidate);
    return overlap && candidate.timeSlots.some((a) => m.timeSlots.some((b) => a.dayOfWeek === b.dayOfWeek && a.startTime === b.startTime));
  });
  if (!hit) return '';
  const when = candidate.timeSlots.find((a) => hit.timeSlots.some((b) => a.dayOfWeek === b.dayOfWeek && a.startTime === b.startTime));
  return `Clashes with ${hit.book?.title || 'another class'} (${DAY_NAMES[when.dayOfWeek]} ${when.startTime})`;
};

const activeGroupsOf = (userId) => ReadingGroup.find({ leader: userId, status: { $ne: 'finished' } }).populate('book', BOOK_FIELDS);

// My classes: every class I lead that is not finished
const myClasses = async (user) => {
  const groups = await activeGroupsOf(user._id);
  const planned = await completePlans(groups);
  return groups.map((g) => formatGroup(g, { planned: planned.has(String(g._id)) })).sort(byTitleThenWeek);
};

// Classes that have not started yet, so a leader can volunteer
const openClasses = async (user) => {
  const [groups, mine, requests] = await Promise.all([
    ReadingGroup.find({ status: 'open', currentWeek: 0 }).populate('book', BOOK_FIELDS).populate('leader', 'name'),
    activeGroupsOf(user._id),
    LeaderRequest.find({ leader: user._id }),
  ]);
  const requestOf = new Map(requests.map((r) => [String(r.group), r]));
  return groups
    .filter((g) => g.book && !g.book.retired)
    .map((g) => {
      const isMine = String(g.leader?._id) === String(user._id);
      const req = requestOf.get(String(g._id));
      return formatGroup(g, {
        mine: isMine,
        request: req ? { status: req.status, note: req.note } : null,
        clash: isMine ? '' : clashWith(g, mine),
      });
    })
    .sort(byTitleThenWeek);
};

const mustFindOpenGroup = async (groupId) => {
  const group = await ReadingGroup.findById(groupId).populate('book', BOOK_FIELDS);
  if (!group) throw new AppError('Reading group not found', 404);
  if (group.status !== 'open' || group.currentWeek > 0) throw new AppError('That class has already started, so its leader can no longer change.', 400);
  if (group.book?.retired) throw new AppError('That book has been retired.', 400);
  return group;
};

const requestToLead = async (user, groupId, note = '') => {
  const group = await mustFindOpenGroup(groupId);
  if (String(group.leader) === String(user._id)) throw new AppError('You already lead this class.', 400);
  const clash = clashWith(group, await activeGroupsOf(user._id));
  if (clash) throw new AppError(`${clash}. Choose a class that meets at a different time.`, 400);

  const existing = await LeaderRequest.findOne({ group: group._id, leader: user._id });
  if (existing?.status === 'pending') throw new AppError('You already sent a request for this class.', 400);
  const text = String(note || '').trim().slice(0, 300);
  if (existing) {
    existing.status = 'pending';
    existing.note = text;
    existing.decidedAt = undefined;
    await existing.save();
    return { request: { status: 'pending', note: text } };
  }
  await LeaderRequest.create({ group: group._id, leader: user._id, note: text });
  return { request: { status: 'pending', note: text } };
};

const withdrawRequest = async (user, groupId) => {
  const result = await LeaderRequest.deleteOne({ group: groupId, leader: user._id, status: 'pending' });
  if (!result.deletedCount) throw new AppError('There is no waiting request to withdraw.', 404);
  return { withdrawn: true };
};

// Mark a class finished once its last week has been held
const finishClass = async (user, groupId) => {
  const group = await ReadingGroup.findById(groupId);
  if (!group) throw new AppError('Reading group not found', 404);
  if (String(group.leader) !== String(user._id) && user.role !== 'admin') throw new AppError('Only the leader of this class can finish it.', 403);
  if (group.status === 'finished') throw new AppError('This class is already finished.', 400);
  if (group.currentWeek < group.totalWeeks) throw new AppError(`This class can be finished after week ${group.totalWeeks} has been held.`, 400);
  group.status = 'finished';
  await group.save();
  return { finished: true };
};

// The leader's record: classes finished, readers guided, weeks led
const record = async (user) => {
  const groups = await ReadingGroup.find({ leader: user._id, status: 'finished' }).populate('book', BOOK_FIELDS).sort({ updatedAt: -1 });
  const counts = await Membership.aggregate([
    { $match: { group: { $in: groups.map((g) => g._id) }, status: 'active' } },
    { $group: { _id: '$group', readers: { $sum: 1 } } },
  ]);
  const readersOf = new Map(counts.map((c) => [String(c._id), c.readers]));
  const classes = groups.map((g) => formatGroup(g, { readers: readersOf.get(String(g._id)) || 0, finishedAt: g.updatedAt }));
  return {
    totals: {
      classes: classes.length,
      readers: classes.reduce((sum, c) => sum + c.readers, 0),
      weeks: classes.reduce((sum, c) => sum + c.totalWeeks, 0),
    },
    classes,
  };
};

module.exports = { myClasses, openClasses, requestToLead, withdrawRequest, finishClass, record, clashWith, activeGroupsOf, formatGroup };
