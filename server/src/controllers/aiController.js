const asyncHandler = require('../utils/asyncHandler');
const aiService = require('../services/aiService');

// POST /api/ai/chat   body: { message, bookId?, history? }
const chat = asyncHandler(async (req, res) => {
  const { message, bookId, history } = req.body;
  const answer = await aiService.chat({ message, bookId, history, userId: req.user?._id });
  res.json({ success: true, ...answer });
});

module.exports = { chat };
