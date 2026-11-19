const asyncHandler = require('../utils/asyncHandler');
const profiles = require('../services/profileService');

const ok = (res, data) => res.status(200).json({ success: true, ...data });

module.exports = {
  list: asyncHandler(async (req, res) => ok(res, { leaders: await profiles.listLeaders() })),
  one: asyncHandler(async (req, res) => ok(res, { leader: await profiles.getLeader(req.params.id) })),
  mine: asyncHandler(async (req, res) => ok(res, { profile: await profiles.getMyProfile(req.user) })),
  update: asyncHandler(async (req, res) => ok(res, { profile: await profiles.updateMyProfile(req.user, req.body) })),
};
