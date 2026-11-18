const asyncHandler = require('../utils/asyncHandler');
const admin = require('../services/adminService');

const ok = (res, data, status = 200) => res.status(status).json({ success: true, ...data });

module.exports = {
  stats: asyncHandler(async (req, res) => ok(res, { stats: await admin.getStats() })),
  groups: asyncHandler(async (req, res) => ok(res, { groups: await admin.listGroups() })),
  updateGroup: asyncHandler(async (req, res) => ok(res, { group: await admin.updateGroup(req.params.id, req.body || {}) })),
  createGroup: asyncHandler(async (req, res) => ok(res, { group: await admin.createGroup(req.body || {}) }, 201)),
  books: asyncHandler(async (req, res) => ok(res, { books: await admin.listBooks() })),
  createBook: asyncHandler(async (req, res) => ok(res, { book: await admin.createBook(req.body || {}) }, 201)),
  retireBook: asyncHandler(async (req, res) => ok(res, await admin.setBookRetired(req.params.id, req.body?.retired))),
  users: asyncHandler(async (req, res) => ok(res, { users: await admin.listUsers(req.query) })),
  setRole: asyncHandler(async (req, res) => ok(res, await admin.setUserRole(req.user, req.params.id, req.body?.role))),
  suspend: asyncHandler(async (req, res) => ok(res, await admin.setUserSuspended(req.user, req.params.id, req.body?.suspended, req.body?.reason))),
  feedback: asyncHandler(async (req, res) => ok(res, { feedback: await admin.listFeedback(req.query) })),
  leaderRequests: asyncHandler(async (req, res) => ok(res, { requests: await admin.listLeaderRequests() })),
  decideLeaderRequest: asyncHandler(async (req, res) => ok(res, await admin.decideLeaderRequest(req.params.id, req.body?.decision))),
  setFeedback: asyncHandler(async (req, res) => ok(res, await admin.setFeedbackStatus(req.params.id, req.body?.status))),
};
