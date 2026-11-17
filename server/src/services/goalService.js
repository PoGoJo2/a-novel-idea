const Meeting = require('../models/Meeting');
const ReadingGroup = require('../models/ReadingGroup');
const AppError = require('../utils/AppError');
const { requireLeader } = require('./groupAccess');

// READING GOALS: the chapters (or pages) the group reads each week, for example "1-5" then "6-11".
// They are stored on the weekly meetings (the "chapters" field), the same text for both time options.

// Older meetings were created with placeholder text such as "Week 1" in the chapters field. That is not a real goal.
const realGoal = (text) => (text && !/^week\s*\d+$/i.test(text.trim()) ? text.trim() : '');

// Every week of one group: [{ weekNumber, chapters }]
const listGoals = async (groupId) => {
  const meetings = await Meeting.find({ group: groupId }).select('weekNumber chapters');
  const byWeek = new Map();
  meetings.forEach((m) => {
    const goal = realGoal(m.chapters);
    if (!byWeek.has(m.weekNumber) || (!byWeek.get(m.weekNumber) && goal)) byWeek.set(m.weekNumber, goal);
  });
  return [...byWeek.entries()].map(([weekNumber, chapters]) => ({ weekNumber, chapters })).sort((a, b) => a.weekNumber - b.weekNumber);
};

// This week's goal for every open group, as { groupId: { weekNumber, chapters } }.
// A group that has not started yet shows its week 1 goal.
const currentGoals = async () => {
  const groups = await ReadingGroup.find({ status: { $ne: 'finished' } }).select('currentWeek');
  const weekOf = new Map(groups.map((g) => [String(g._id), Math.max(g.currentWeek || 0, 1)]));
  const meetings = await Meeting.find({ group: { $in: groups.map((g) => g._id) } }).select('group weekNumber chapters');

  const result = {};
  meetings.forEach((m) => {
    const key = String(m.group);
    if (m.weekNumber === weekOf.get(key) && realGoal(m.chapters)) result[key] = { weekNumber: m.weekNumber, chapters: realGoal(m.chapters) };
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

// JOINING RULES
// 1. Joining closes when week 3 begins (people who already joined keep their seat).
// 2. A group only opens for sign-ups once its leader has filled in the chapters or pages for EVERY week,
//    so new members know the whole timeline before they join.
const JOIN_CLOSES_WEEK = 3;

// Which of these groups have a real goal for every one of their weeks? Returns a Set of group ids.
const completePlans = async (groups) => {
  const meetings = await Meeting.find({ group: { $in: groups.map((g) => g._id) } }).select('group weekNumber chapters');
  const weeksDone = new Map();
  meetings.forEach((m) => {
    if (!realGoal(m.chapters)) return;
    const key = String(m.group);
    if (!weeksDone.has(key)) weeksDone.set(key, new Set());
    weeksDone.get(key).add(m.weekNumber);
  });
  return new Set(groups.filter((g) => {
    const done = weeksDone.get(String(g._id));
    return done && Array.from({ length: g.totalWeeks }, (_, i) => i + 1).every((w) => done.has(w));
  }).map((g) => String(g._id)));
};

// Can a new member join this group right now? { open, reason }
const joinStatus = async (group) => {
  if (group.status === 'finished') return { open: false, reason: 'This group has already finished.' };
  if (group.currentWeek >= JOIN_CLOSES_WEEK) {
    return { open: false, reason: `Joining closed when week ${JOIN_CLOSES_WEEK} began. Look for the next group for this book.` };
  }
  const complete = await completePlans([group]);
  if (!complete.has(String(group._id))) {
    return { open: false, reason: 'The leader is still finishing the weekly reading plan, so this group is not open for sign-ups yet.' };
  }
  return { open: true, reason: '' };
};

// What the Browse page shows: EVERY group that is not finished, sorted into three kinds.
//   open       - the reading plan is complete and the group has not reached week 3: people can join
//   comingSoon - the leader has not finished the weekly plan yet (greyed out; the plan is due before the start date)
//   started    - the group has reached week 3, so joining is closed (greyed out; "notify me when a new group starts")
const browseStatus = async () => {
  const groups = await ReadingGroup.find({ status: { $ne: 'finished' } }).select('totalWeeks currentWeek status');
  const complete = await completePlans(groups);
  const ids = (list) => list.map((g) => String(g._id));
  const started = groups.filter((g) => g.currentWeek >= JOIN_CLOSES_WEEK);
  const waiting = groups.filter((g) => g.currentWeek < JOIN_CLOSES_WEEK);
  return {
    open: ids(waiting.filter((g) => complete.has(String(g._id)))),
    comingSoon: ids(waiting.filter((g) => !complete.has(String(g._id)))),
    started: ids(started),
  };
};

module.exports = { listGoals, currentGoals, saveGoal, joinStatus, browseStatus, JOIN_CLOSES_WEEK };
