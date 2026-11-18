const express = require('express');
const { submit } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/', protect, submit); // any signed-in member may send feedback

module.exports = router;
