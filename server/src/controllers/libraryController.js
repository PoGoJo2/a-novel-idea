const asyncHandler = require('../utils/asyncHandler');
const libraryService = require('../services/libraryService');

const ids = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await libraryService.getIds(req.user._id)) });
});

const library = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await libraryService.getLibrary(req.user._id)) });
});

// One handler builds both add and remove for either list
const change = (listKey, on) =>
  asyncHandler(async (req, res) => {
    const result = await libraryService.setInList(req.user._id, listKey, req.params.bookId, on);
    res.json({ success: true, ...result });
  });

module.exports = { ids, library, change };
