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

// Scheduling rules for leaders:
//   1) no two classes whose meetings overlap in time (same day, and one starts before the other ends),
//      while their weeks overlap on the calendar
//   2) at most MAX_PER_DAY class meetings on any one day of the week
const MAX_PER_DAY = 3;
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const endOf = (g) => new Date(new Date(g.startDate).getTime() + g.totalWeeks * 7 * DAY);
const overlaps = (a, b) => new Date(a.startDate) < endOf(b) && new Date(b.startDate) < endOf(a);
const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};
const clock = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
// Do two meeting times collide? (same day and the time ranges overlap)
const collide = (a, aLen, b, bLen) => {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const a0 = toMinutes(a.startTime);
  const b0 = toMinutes(b.startTime);
  return a0 < b0 + bLen && b0 < a0 + aLen;
};

// Returns '' when the leader may take this class, or a plain sentence saying why not.
// who: 'You' (leader asking) or the leader's name (administrator screens).
const scheduleProblem = (candidate, mine, who = 'You') => {
  const len = (g) => Number(g.sessionMinutes) || 60;
  const others = mine.filter((m) => String(m._id) !== String(candidate._id) && overlaps(candidate, m));
  for (const a of candidate.timeSlots) {
    for (const m of others) {
      const b = m.timeSlots.find((t) => collide(a, len(candidate), t, len(m)));
      if (b) {
        const same = a.startTime === b.startTime;
        return `${who} already lead${who === 'You' ? '' : 's'} ${m.book?.title || 'another class'} on ${DAY_FULL[b.dayOfWeek]} at ${clock(b.startTime)}${same ? '' : `, which runs into the ${clock(a.startTime)} meeting`}`;
      }
    }
  }
  for (let day = 0; day < 7; day += 1) {
    const adding = candidate.timeSlots.filter((t) => t.dayOfWeek === day).length;
    if (!adding) continue;
    const already = others.reduce((n, m) => n + m.timeSlots.filter((t) => t.dayOfWeek === day).length, 0);
    if (already + adding > MAX_PER_DAY) {
      return `${who} already ${who === 'You' ? 'have' : 'has'} ${already} class${already === 1 ? '' : 'es'} on ${DAY_FULL[day]}, and the limit is ${MAX_PER_DAY} a day`;
    }
  }
  return '';
};
const clashWith = scheduleProblem; // older name, same rules

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
  if (clash) throw new AppError(`${clash}. Choose a class that meets at a different time or day.`, 400);

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

module.exports = { scheduleProblem, MAX_PER_DAY, myClasses, openClasses, requestToLead, withdrawRequest, finishClass, record, clashWith, activeGroupsOf, formatGroup };
