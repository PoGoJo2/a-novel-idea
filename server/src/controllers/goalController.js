const asyncHandler = require('../utils/asyncHandler');
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

module.exports = { list, current, save };
