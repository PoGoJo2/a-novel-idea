const asyncHandler = require('../utils/asyncHandler');
const ReadingGroup = require('../models/ReadingGroup');
const AppError = require('../utils/AppError');
const goalService = require('../services/goalService');

const list = asyncHandler(async (req, res) => {
  res.json({ success: true, goals: await goalService.listGoals(req.params.id) });
});

const current = asyncHandler(async (req, res) => {
  res.json({ success: true, goals: await goalService.currentGoals() });
});

const save = asyncHandler(async (req, res) => {
  res.json({ success: true, goal: await goalService.saveGoal(req.params.id, req.user, req.body) });
});

const browsable = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await goalService.browseStatus()) });
});

const joinStatus = asyncHandler(async (req, res) => {
  const group = await ReadingGroup.findById(req.params.id);
  if (!group) throw new AppError('Reading group not found', 404);
  res.json({ success: true, ...(await goalService.joinStatus(group)) });
});

module.exports = { list, current, save, browsable, joinStatus };
