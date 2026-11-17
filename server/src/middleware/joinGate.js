const ReadingGroup = require('../models/ReadingGroup');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { joinStatus } = require('../services/goalService');

// Runs before a member joins a group: refuses if joining has closed or the reading plan is unfinished.
module.exports = asyncHandler(async (req, res, next) => {
  const group = await ReadingGroup.findById(req.params.id);
  if (!group) throw new AppError('Reading group not found', 404);
  const status = await joinStatus(group);
  if (!status.open) throw new AppError(status.reason, 403);
  next();
});
