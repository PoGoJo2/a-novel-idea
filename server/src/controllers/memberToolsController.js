const asyncHandler = require('../utils/asyncHandler');
const noteService = require('../services/noteService');
const oneOnOneService = require('../services/oneOnOneService');

const listNotes = asyncHandler(async (req, res) => {
  res.json({ success: true, notes: await noteService.listNotes(req.params.id, req.user) });
});

const saveNotes = asyncHandler(async (req, res) => {
  const note = await noteService.saveWeekNotes(req.params.id, req.user, req.body);
  res.status(201).json({ success: true, note });
});

const listSlots = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await oneOnOneService.listSlots(req.params.id, req.user)) });
});

const createSlot = asyncHandler(async (req, res) => {
  const slot = await oneOnOneService.createSlot(req.params.id, req.user, req.body);
  res.status(201).json({ success: true, slot });
});

const bookSlot = asyncHandler(async (req, res) => {
  const slot = await oneOnOneService.bookSlot(req.params.id, req.user);
  res.status(201).json({ success: true, slot });
});

const cancelMyBooking = asyncHandler(async (req, res) => {
  await oneOnOneService.cancelMyBooking(req.params.id, req.user);
  res.json({ success: true, message: 'Your one-on-one was cancelled' });
});

const cancelSlot = asyncHandler(async (req, res) => {
  await oneOnOneService.cancelSlot(req.params.id, req.user);
  res.json({ success: true, message: 'That time was withdrawn' });
});

const ledGroups = asyncHandler(async (req, res) => {
  res.json({ success: true, groups: await oneOnOneService.ledGroups(req.user) });
});

module.exports = { listNotes, saveNotes, listSlots, createSlot, bookSlot, cancelMyBooking, cancelSlot, ledGroups };
