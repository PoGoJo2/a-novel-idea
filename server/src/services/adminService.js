const User = require('../models/User');
const Book = require('../models/Book');
const ReadingGroup = require('../models/ReadingGroup');
const Membership = require('../models/Membership');
const Meeting = require('../models/Meeting');
const Feedback = require('../models/Feedback');
const LeaderRequest = require('../models/LeaderRequest');
const OneOnOneSlot = require('../models/OneOnOneSlot');
const AppError = require('../utils/AppError');
const { generateMeetings } = require('./meetingService');
const { browseStatus, completePlans } = require('./goalService');
const { clashWith, activeGroupsOf } = require('./leaderService');

// Numbers for the Administrator page
const getStats = async () => {
  const [usersByRole, booksByGenre, groups, activeMemberships, browse] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Book.aggregate([{ $group: { _id: '$genre', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ReadingGroup.countDocuments({}),
    Membership.countDocuments({ status: 'active' }),
    browseStatus(),
  ]);

  const roles = { member: 0, leader: 0, admin: 0 };
  usersByRole.forEach((r) => { roles[r._id] = r.count; });

  return {
    users: { total: Object.values(roles).reduce((a, b) => a + b, 0), ...roles },
    books: { total: booksByGenre.reduce((a, g) => a + g.count, 0), byGenre: booksByGenre.map((g) => ({ genre: g._id, count: g.count })) },
    groups: { total: groups, open: browse.open.length, comingSoon: browse.comingSoon.length, started: browse.started.length },
    activeMemberships,
  };
};



// ---------- shared helpers ----------
const ROLES = ['member', 'leader', 'admin'];
const MEETING_PLACEHOLDER = (week) => `Week ${week}`;

const toDateOnly = (value) => {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) throw new AppError('Please give a valid start date', 400);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); // a calendar date at UTC midnight
};

const cleanSlot = (slot) => ({
  ...(slot.id ? { _id: slot.id } : {}),
  dayOfWeek: Number(slot.dayOfWeek),
  startTime: String(slot.startTime || ''),
  timezone: slot.timezone || 'America/New_York',
  capacity: Number(slot.capacity) || 12,
  meetingLink: slot.meetingLink || '',
});

const mustFindLeader = async (id) => {
  const leader = await User.findById(id);
  if (!leader) throw new AppError('That person was not found', 404);
  if (!['leader', 'admin'].includes(leader.role)) throw new AppError('Make that person a leader first (People tab), then assign them', 400);
  if (leader.suspended) throw new AppError('That person is suspended', 400);
  return leader;
};

// Rebuilds the weekly meetings after the schedule changed, keeping each week's reading goal
// (and anything attached to a meeting that still exists).
const syncMeetings = async (group) => {
  const wanted = generateMeetings(group);
  const existing = await Meeting.find({ group: group._id });
  const goalByWeek = new Map();
  existing.forEach((m) => {
    if (m.chapters && !/^week\s*\d+$/i.test(m.chapters.trim())) goalByWeek.set(m.weekNumber, m.chapters);
  });

  const keep = new Set(wanted.map((m) => `${m.slotId}-${m.weekNumber}`));
  const ops = wanted.map((m) => ({
    updateOne: {
      filter: { group: group._id, slotId: m.slotId, weekNumber: m.weekNumber },
      update: {
        $set: { startsAtUtc: m.startsAtUtc, durationMinutes: m.durationMinutes, meetingLink: m.meetingLink },
        $setOnInsert: { chapters: goalByWeek.get(m.weekNumber) || MEETING_PLACEHOLDER(m.weekNumber), status: 'scheduled' },
      },
      upsert: true,
    },
  }));
  if (ops.length) await Meeting.bulkWrite(ops);
  const stale = existing.filter((m) => !keep.has(`${m.slotId}-${m.weekNumber}`)).map((m) => m._id);
  if (stale.length) await Meeting.deleteMany({ _id: { $in: stale } });
};

// ---------- GROUPS ----------
const formatAdminGroup = (g, seats, planned = false) => ({
  id: g._id,
  planned,
  book: {
    id: g.book?._id, title: g.book?.title, author: g.book?.author, genre: g.book?.genre, coverUrl: g.book?.coverUrl,
    accentColors: g.book?.accentColors, retired: Boolean(g.book?.retired),
  },
  leader: g.leader ? { id: g.leader._id, name: g.leader.name } : null,
  startDate: g.startDate,
  totalWeeks: g.totalWeeks,
  currentWeek: g.currentWeek,
  sessionMinutes: g.sessionMinutes,
  status: g.status,
  timeSlots: g.timeSlots.map((s) => ({
    id: s._id, dayOfWeek: s.dayOfWeek, startTime: s.startTime, timezone: s.timezone, capacity: s.capacity,
    meetingLink: s.meetingLink, seatsTaken: seats.get(`${g._id}-${s._id}`) || 0,
  })),
});

const seatMap = async (groupIds) => {
  const rows = await Membership.aggregate([
    { $match: { group: { $in: groupIds }, status: 'active' } },
    { $group: { _id: { group: '$group', slotId: '$slotId' }, count: { $sum: 1 } } },
  ]);
  const map = new Map();
  rows.forEach((r) => map.set(`${r._id.group}-${r._id.slotId}`, r.count));
  return map;
};

const listGroups = async () => {
  const groups = await ReadingGroup.find({}).populate('book', 'title author retired genre coverUrl accentColors').populate('leader', 'name').sort({ startDate: 1 });
  const seats = await seatMap(groups.map((g) => g._id));
  const planned = await completePlans(groups); // every week has a reading goal
  const sorted = groups.map((g) => formatAdminGroup(g, seats, planned.has(String(g._id)))).sort((a, b) => (a.book.title || '').localeCompare(b.book.title || '') || a.currentWeek - b.currentWeek);
  return sorted;
};

// Change a group: leader, start date, weeks, class length, meeting times, class sizes, how many meetings a week.
// The times, start date and number of weeks can only change before the group starts (week 0).
const updateGroup = async (id, body) => {
  const group = await ReadingGroup.findById(id);
  if (!group) throw new AppError('Reading group not found', 404);
  const started = group.currentWeek > 0;
  const changesSchedule = ['startDate', 'totalWeeks', 'timeSlots'].some((k) => body[k] !== undefined);
  if (started && changesSchedule) throw new AppError('This group has already started, so its start date, number of weeks and meeting times are locked. You can still change the leader, class sizes and class length.', 400);

  if (body.leaderId) group.leader = (await mustFindLeader(body.leaderId))._id;
  if (body.startDate !== undefined) group.startDate = toDateOnly(body.startDate);
  if (body.totalWeeks !== undefined) group.totalWeeks = Number(body.totalWeeks);
  if (body.sessionMinutes !== undefined) group.sessionMinutes = Number(body.sessionMinutes);
  if (body.status && ['open', 'in-progress', 'finished'].includes(body.status)) group.status = body.status;

  if (body.timeSlots !== undefined) {
    if (!Array.isArray(body.timeSlots)) throw new AppError('timeSlots must be a list', 400);
    const seats = await seatMap([group._id]);
    const keptIds = new Set(body.timeSlots.filter((s) => s.id).map((s) => String(s.id)));
    group.timeSlots.forEach((old) => {
      if (!keptIds.has(String(old._id)) && (seats.get(`${group._id}-${old._id}`) || 0) > 0) {
        throw new AppError('A meeting time that already has members cannot be removed. Lower the class size or ask those members to switch first.', 400);
      }
    });
    body.timeSlots.forEach((s) => {
      if (s.id && (seats.get(`${group._id}-${s.id}`) || 0) > Number(s.capacity)) {
        throw new AppError(`That time already has ${seats.get(`${group._id}-${s.id}`)} members, so the class size cannot go below that.`, 400);
      }
    });
    group.timeSlots = body.timeSlots.map(cleanSlot);
  }

  try {
    await group.save(); // the model's own rules (1-4 times, distinct, HH:MM) run here
  } catch (err) {
    if (err.name === 'ValidationError') throw new AppError(Object.values(err.errors).map((e) => e.message).join('. '), 400);
    throw err;
  }
  if (changesSchedule || body.sessionMinutes !== undefined) await syncMeetings(group);

  const seats = await seatMap([group._id]);
  await group.populate([{ path: 'book', select: 'title author retired genre coverUrl accentColors' }, { path: 'leader', select: 'name' }]);
  return formatAdminGroup(group, seats);
};

// Open a new reading group for a book
const createGroup = async (body) => {
  const book = await Book.findById(body.bookId);
  if (!book) throw new AppError('Choose a book for this group', 400);
  if (book.retired) throw new AppError('That book is retired. Bring it back first.', 400);
  const leader = await mustFindLeader(body.leaderId);
  const slots = Array.isArray(body.timeSlots) ? body.timeSlots.map(cleanSlot) : [];

  let group;
  try {
    group = await ReadingGroup.create({
      book: book._id,
      leader: leader._id,
      startDate: toDateOnly(body.startDate),
      totalWeeks: Number(body.totalWeeks) || 8,
      sessionMinutes: Number(body.sessionMinutes) || 60,
      timeSlots: slots,
    });
  } catch (err) {
    if (err.name === 'ValidationError') throw new AppError(Object.values(err.errors).map((e) => e.message).join('. '), 400);
    throw err;
  }
  await syncMeetings(group); // the weeks start as "Week N", so the book shows "Coming soon" until the leader sets goals
  const seats = await seatMap([group._id]);
  await group.populate([{ path: 'book', select: 'title author retired genre coverUrl accentColors' }, { path: 'leader', select: 'name' }]);
  return formatAdminGroup(group, seats);
};

// ---------- BOOKS ----------
const listBooks = async () => {
  const [books, counts] = await Promise.all([
    Book.find({}).sort({ title: 1 }).select('title author genre pageCount retired'),
    ReadingGroup.aggregate([{ $match: { status: { $ne: 'finished' } } }, { $group: { _id: '$book', count: { $sum: 1 } } }]),
  ]);
  const live = new Map(counts.map((c) => [String(c._id), c.count]));
  return books.map((b) => ({ id: b._id, title: b.title, author: b.author, genre: b.genre, pageCount: b.pageCount, retired: Boolean(b.retired), activeGroups: live.get(String(b._id)) || 0 }));
};

const createBook = async (body) => {
  try {
    const book = await Book.create({
      title: body.title, author: body.author, genre: body.genre, description: body.description,
      coverUrl: body.coverUrl || '', pageCount: body.pageCount ? Number(body.pageCount) : undefined,
    });
    return { id: book._id, title: book.title };
  } catch (err) {
    if (err.name === 'ValidationError') throw new AppError(Object.values(err.errors).map((e) => e.message).join('. '), 400);
    throw err;
  }
};

// Discard (retire) an old book, or bring it back. Retired books disappear from Browse and cannot be joined;
// groups that are already running keep going so nobody loses their class.
const setBookRetired = async (id, retired) => {
  const book = await Book.findByIdAndUpdate(id, { retired: Boolean(retired) }, { new: true });
  if (!book) throw new AppError('Book not found', 404);
  return { id: book._id, retired: book.retired };
};

// ---------- PEOPLE ----------
const listUsers = async (query) => {
  const filter = {};
  if (query.q && query.q.trim()) {
    const rx = new RegExp(query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (ROLES.includes(query.role)) filter.role = query.role;
  const users = await User.find(filter).sort({ name: 1 }).limit(200).select('name email role suspended suspendedReason createdAt');
  return users.map((u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, suspended: Boolean(u.suspended), suspendedReason: u.suspendedReason || '', joined: u.createdAt }));
};

const ledGroupCount = (userId) => ReadingGroup.countDocuments({ leader: userId, status: { $ne: 'finished' } });

const setUserRole = async (actor, id, role) => {
  if (!ROLES.includes(role)) throw new AppError(`Role must be one of: ${ROLES.join(', ')}`, 400);
  if (String(actor._id) === String(id)) throw new AppError('You cannot change your own role', 400);
  const user = await User.findById(id);
  if (!user) throw new AppError('That person was not found', 404);
  if (role === 'member' && (await ledGroupCount(user._id)) > 0) {
    throw new AppError('This person still leads a reading group. Assign that group to another leader first (Groups tab).', 400);
  }
  user.role = role;
  await user.save({ validateBeforeSave: false });
  return { id: user._id, role: user.role };
};

// Remove a disruptive client: they cannot log in or use the site, and their seats are given up.
const setUserSuspended = async (actor, id, suspended, reason = '') => {
  if (String(actor._id) === String(id)) throw new AppError('You cannot suspend yourself', 400);
  const user = await User.findById(id);
  if (!user) throw new AppError('That person was not found', 404);
  if (user.role === 'admin') throw new AppError('Administrators cannot be suspended. Change their role first.', 400);
  if (suspended && (await ledGroupCount(user._id)) > 0) {
    throw new AppError('This person leads a reading group. Assign that group to another leader first (Groups tab).', 400);
  }
  user.suspended = Boolean(suspended);
  user.suspendedReason = suspended ? String(reason || '').slice(0, 300) : '';
  await user.save({ validateBeforeSave: false });
  if (suspended) await Membership.updateMany({ user: user._id, status: 'active' }, { $set: { status: 'cancelled', cancelledAt: new Date() } });
  return { id: user._id, suspended: user.suspended };
};

// ---------- FEEDBACK ----------
const listFeedback = async (query) => {
  const filter = {};
  if (['new', 'resolved'].includes(query.status)) filter.status = query.status;
  if (['complaint', 'review', 'other'].includes(query.kind)) filter.kind = query.kind;
  const items = await Feedback.find(filter).sort({ createdAt: -1 }).limit(200)
    .populate('user', 'name email').populate('book', 'title').populate('group', 'startDate');
  return items.map((f) => ({
    id: f._id, kind: f.kind, rating: f.rating || null, message: f.message, status: f.status, createdAt: f.createdAt,
    user: f.user ? { id: f.user._id, name: f.user.name, email: f.user.email } : null,
    book: f.book ? { id: f.book._id, title: f.book.title } : null,
  }));
};

const setFeedbackStatus = async (id, status) => {
  if (!['new', 'resolved'].includes(status)) throw new AppError('Status must be new or resolved', 400);
  const item = await Feedback.findByIdAndUpdate(id, { status }, { new: true });
  if (!item) throw new AppError('Feedback not found', 404);
  return { id: item._id, status: item.status };
};

// ---------- leader requests ----------
// Leaders who volunteered to lead a class that has not started yet
const listLeaderRequests = async () => {
  const requests = await LeaderRequest.find({ status: 'pending' }).sort({ createdAt: 1 })
    .populate('leader', 'name email')
    .populate({ path: 'group', populate: [{ path: 'book', select: 'title author genre coverUrl accentColors' }, { path: 'leader', select: 'name' }] });
  return requests.filter((r) => r.group && r.leader).map((r) => ({
    id: r._id,
    note: r.note,
    createdAt: r.createdAt,
    requester: { id: r.leader._id, name: r.leader.name, email: r.leader.email },
    group: {
      id: r.group._id,
      book: { title: r.group.book?.title, author: r.group.book?.author, genre: r.group.book?.genre, coverUrl: r.group.book?.coverUrl, accentColors: r.group.book?.accentColors },
      currentLeader: r.group.leader?.name || '',
      startDate: r.group.startDate,
      timeSlots: r.group.timeSlots.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime })),
    },
  }));
};

// Approve (the class moves to that leader) or decline
const decideLeaderRequest = async (id, decision) => {
  if (!['approved', 'declined'].includes(decision)) throw new AppError('Choose approve or decline', 400);
  const request = await LeaderRequest.findById(id);
  if (!request || request.status !== 'pending') throw new AppError('That request is no longer waiting', 404);

  if (decision === 'declined') {
    request.status = 'declined';
    request.decidedAt = new Date();
    await request.save();
    return { status: 'declined' };
  }

  const group = await ReadingGroup.findById(request.group).populate('book', 'title');
  if (!group || group.status !== 'open' || group.currentWeek > 0) throw new AppError('That class has already started, so its leader can no longer change.', 400);
  const leader = await mustFindLeader(request.leader);
  const clash = clashWith(group, await activeGroupsOf(leader._id));
  if (clash) throw new AppError(`${clash}. Decline this request or change the meeting time first.`, 400);

  const previous = group.leader;
  group.leader = leader._id;
  await group.save();
  await OneOnOneSlot.updateMany({ group: group._id, leader: previous }, { leader: leader._id }); // one-on-one times move with the class
  request.status = 'approved';
  request.decidedAt = new Date();
  await request.save();
  // Anyone else who asked for this class is told no
  await LeaderRequest.updateMany({ group: group._id, status: 'pending' }, { status: 'declined', decidedAt: new Date() });
  return { status: 'approved' };
};

module.exports = {
  getStats, listGroups, updateGroup, createGroup, listBooks, createBook, setBookRetired,
  listUsers, setUserRole, setUserSuspended, listFeedback, setFeedbackStatus,
  listLeaderRequests, decideLeaderRequest,
};
