const asyncHandler = require('../utils/asyncHandler');
const groupService = require('../services/groupService');

// GET /api/groups?genre=&day=&q=&page=&limit=
const listGroups = asyncHandler(async (req, res) => {
  const result = await groupService.listGroups(req.query);
  res.json({ success: true, ...result });
});

// GET /api/groups/:id
const getGroup = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(req.params.id);
  res.json({ success: true, group });
});

module.exports = { listGroups, getGroup };
