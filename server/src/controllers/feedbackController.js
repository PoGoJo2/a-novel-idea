const asyncHandler = require('../utils/asyncHandler');
const feedbackService = require('../services/feedbackService');

const submit = asyncHandler(async (req, res) => {
  const result = await feedbackService.submit(req.user, req.body || {});
  res.status(201).json({ success: true, ...result });
});

module.exports = { submit };
