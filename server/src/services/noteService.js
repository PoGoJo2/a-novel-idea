const Meeting = require('../models/Meeting');
const MeetingNote = require('../models/MeetingNote');
const AppError = require('../utils/AppError');
const { getGroupAccess, requireLeader } = require('./groupAccess');

// WEEKLY NOTES for a group, newest week first. Members only see weeks up to the group's current week,
// so notes the leader wrote ahead of time stay hidden until that week arrives.
const listNotes = async (groupId, user) => {
  const { group, isLeader } = await getGroupAccess(groupId, user);

  const meetings = await Meeting.find({ group: group._id }).select('weekNumber');
  const weekOf = new Map(meetings.map((m) => [String(m._id), m.weekNumber]));

  const notes = await MeetingNote.find({ meeting: { $in: meetings.map((m) => m._id) } })
    .populate('author', 'name')
    .sort({ publishedAt: -1 });

  // Both time options of a week share the same notes, so keep one per week
  const byWeek = new Map();
  notes.forEach((note) => {
    const week = weekOf.get(String(note.meeting));
    if (!isLeader && week > group.currentWeek) return;
    if (!byWeek.has(week)) {
      byWeek.set(week, { weekNumber: week, content: note.content, author: note.author?.name, publishedAt: note.publishedAt });
    }
  });

  return [...byWeek.values()].sort((a, b) => b.weekNumber - a.weekNumber);
};

// The leader writes (or edits) the notes for one week; they are saved for both of that week's meetings.
const saveWeekNotes = async (groupId, user, { weekNumber, content }) => {
  const group = await requireLeader(groupId, user);
  if (weekNumber > group.totalWeeks) throw new AppError(`This group only runs for ${group.totalWeeks} weeks`, 400);

  const meetings = await Meeting.find({ group: group._id, weekNumber });
  if (meetings.length === 0) throw new AppError('There are no meetings for that week', 404);

  await Promise.all(
    meetings.map((meeting) =>
      MeetingNote.updateOne(
        { meeting: meeting._id },
        { $set: { author: user._id, content, publishedAt: new Date() } },
        { upsert: true, runValidators: true }
      )
    )
  );
  return { weekNumber, content };
};

module.exports = { listNotes, saveWeekNotes };
