const Book = require('../models/Book');
const ReadingGroup = require('../models/ReadingGroup');
const Membership = require('../models/Membership');
const Meeting = require('../models/Meeting');
const AppError = require('../utils/AppError');

// Turns text typed by a user into something safe to use inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatBook = (book) => ({
  id: book._id,
  title: book.title,
  author: book.author,
  genre: book.genre,
  description: book.description,
  coverUrl: book.coverUrl,
  accentColors: book.accentColors,
  pageCount: book.pageCount,
});

// Counts active members for each time option of the given groups: Map of "groupId-slotId" -> count
const seatCounts = async (groupIds) => {
  const rows = await Membership.aggregate([
    { $match: { group: { $in: groupIds }, status: 'active' } },
    { $group: { _id: { group: '$group', slotId: '$slotId' }, count: { $sum: 1 } } },
  ]);
  const map = new Map();
  rows.forEach((r) => map.set(`${r._id.group}-${r._id.slotId}`, r.count));
  return map;
};

// The public shape of a group. Note: video links are NOT included here, because only
// members of the group should see them (they appear later on the member's dashboard).
const formatGroup = (group, counts, nextMeetings = new Map()) => ({
  id: group._id,
  book: formatBook(group.book),
  leader: { id: group.leader._id, name: group.leader.name },
  sessionMinutes: group.sessionMinutes,
  startDate: group.startDate,
  totalWeeks: group.totalWeeks,
  currentWeek: group.currentWeek,
  status: group.status,
  timeSlots: group.timeSlots.map((slot) => {
    const seatsTaken = counts.get(`${group._id}-${slot._id}`) || 0;
    return {
      id: slot._id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      timezone: slot.timezone,
      capacity: slot.capacity,
      seatsTaken,
      seatsLeft: Math.max(slot.capacity - seatsTaken, 0),
      nextMeetingUtc: nextMeetings.get(String(slot._id)) || null,
    };
  }),
});

// Browse groups: filter by genre, meeting day, search text, or one book; paginated.
const listGroups = async (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);

  const groupFilter = { status: { $ne: 'finished' } };

  // Retired books are hidden from Browse
  const retiredIds = await Book.distinct('_id', { retired: true });
  if (retiredIds.length) groupFilter.book = { $nin: retiredIds };

  // Genre and search live on the book, so find the matching books first
  const bookFilter = {};
  if (query.genre) bookFilter.genre = query.genre;
  if (query.q && query.q.trim()) {
    const rx = new RegExp(escapeRegex(query.q.trim()), 'i');
    bookFilter.$or = [{ title: rx }, { author: rx }];
  }
  if (Object.keys(bookFilter).length) {
    const found = await Book.distinct('_id', bookFilter);
    groupFilter.book = { $in: found.filter((id) => !retiredIds.some((r) => String(r) === String(id))) };
  }
  if (query.book) groupFilter.book = query.book;

  if (query.day !== undefined && query.day !== '') {
    groupFilter['timeSlots.dayOfWeek'] = Number(query.day); // matches if EITHER time option is on that day
  }

  const [total, groups] = await Promise.all([
    ReadingGroup.countDocuments(groupFilter),
    ReadingGroup.find(groupFilter)
      .populate('book')
      .populate('leader', 'name')
      .sort({ startDate: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  const counts = await seatCounts(groups.map((g) => g._id));

  return {
    groups: groups.map((g) => formatGroup(g, counts)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

// One group with seats left and the next meeting time for each of its two time options
const getGroupById = async (id) => {
  const group = await ReadingGroup.findById(id).populate('book').populate('leader', 'name');
  if (!group) throw new AppError('Reading group not found', 404);

  const counts = await seatCounts([group._id]);

  const upcoming = await Meeting.find({ group: group._id, startsAtUtc: { $gte: new Date() } }).sort({ startsAtUtc: 1 });
  const nextMeetings = new Map();
  upcoming.forEach((m) => {
    if (!nextMeetings.has(String(m.slotId))) nextMeetings.set(String(m.slotId), m.startsAtUtc);
  });

  return formatGroup(group, counts, nextMeetings);
};

module.exports = { listGroups, getGroupById, formatBook };
