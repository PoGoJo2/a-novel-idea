const asyncHandler = require('../utils/asyncHandler');
const leader = require('../services/leaderService');

const ok = (res, data, status = 200) => res.status(status).json({ success: true, ...data });

module.exports = {
  classes: asyncHandler(async (req, res) => ok(res, { groups: await leader.myClasses(req.user) })),
  open: asyncHandler(async (req, res) => ok(res, { groups: await leader.openClasses(req.user) })),
  request: asyncHandler(async (req, res) => ok(res, await leader.requestToLead(req.user, req.params.groupId, req.body?.note), 201)),
  withdraw: asyncHandler(async (req, res) => ok(res, await leader.withdrawRequest(req.user, req.params.groupId))),
  finish: asyncHandler(async (req, res) => ok(res, await leader.finishClass(req.user, req.params.groupId))),
  record: asyncHandler(async (req, res) => ok(res, await leader.record(req.user))),
};
