const Meeting = require('../models/Meeting');
const ReadingGroup = require('../models/ReadingGroup');
const AppError = require('../utils/AppError');
const { requireLeader } = require('./groupAccess');

// READING GOALS: the chapters (or pages) the group reads each week, for example "1-5" then "6-11".
// They are stored on the weekly meetings (the "chapters" field), the same text for both time options.

// Every week of one group: [{ weekNumber, chapters }]
const listGoals = async (groupId) => {
  const meetings = await Meeting.find({ group: groupId }).select('weekNumber chapters');
  const byWeek = new Map();
  meetings.forEach((m) => {
    if (!byWeek.has(m.weekNumber) || (!byWeek.get(m.weekNumber) && m.chapters)) byWeek.set(m.weekNumber, m.chapters || '');
  });
  return [...byWeek.entries()].map(([weekNumber, chapters]) => ({ weekNumber, chapters })).sort((a, b) => a.weekNumber - b.weekNumber);
};

// This week's goal for every open group, as { groupId: { weekNumber, chapters } }.
// A group that has not started yet shows its week 1 goal.
const currentGoals = async () => {
  const groups = await ReadingGroup.find({ status: { $ne: 'finished' } }).select('currentWeek');
  const weekOf = new Map(groups.map((g) => [String(g._id), Math.max(g.currentWeek || 0, 1)]));
  const meetings = await Meeting.find({ group: { $in: groups.map((g) => g._id) }, chapters: { $ne: '' } }).select('group weekNumber chapters');

  const result = {};
  meetings.forEach((m) => {
    const key = String(m.group);
    if (m.weekNumber === weekOf.get(key)) result[key] = { weekNumber: m.weekNumber, chapters: m.chapters };
  });
  return result;
};

// The leader sets (or clears) the goal for one week; it is saved for both of that week's meetings.
const saveGoal = async (groupId, user, { weekNumber, chapters }) => {
  const group = await requireLeader(groupId, user);
  if (weekNumber > group.totalWeeks) throw new AppError(`This group only runs for ${group.totalWeeks} weeks`, 400);

  const result = await Meeting.updateMany({ group: group._id, weekNumber }, { $set: { chapters } });
  if (result.matchedCount === 0) throw new AppError('There are no meetings for that week', 404);
  return { weekNumber, chapters };
};

module.exports = { listGoals, currentGoals, saveGoal };
