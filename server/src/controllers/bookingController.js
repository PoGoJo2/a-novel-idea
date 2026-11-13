const asyncHandler = require('../utils/asyncHandler');
const bookingService = require('../services/bookingService');

// POST /api/groups/:id/join   body: { slotId }
const joinGroup = asyncHandler(async (req, res) => {
  const membership = await bookingService.joinGroup(req.user._id, req.params.id, req.body.slotId);
  res.status(201).json({ success: true, membership });
});

// PUT /api/memberships/:id   body: { slotId }
const switchSlot = asyncHandler(async (req, res) => {
  const membership = await bookingService.switchSlot(req.user._id, req.params.id, req.body.slotId);
  res.json({ success: true, membership });
});

// DELETE /api/memberships/:id
const leaveGroup = asyncHandler(async (req, res) => {
  await bookingService.leaveGroup(req.user._id, req.params.id);
  res.json({ success: true, message: 'You left the group' });
});

// GET /api/me/memberships
const getMyMemberships = asyncHandler(async (req, res) => {
  const memberships = await bookingService.getMyMemberships(req.user._id);
  res.json({ success: true, memberships });
});

module.exports = { joinGroup, switchSlot, leaveGroup, getMyMemberships };
