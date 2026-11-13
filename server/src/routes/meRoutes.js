const express = require('express');

const { getMyMemberships } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Things that belong to the logged-in user
router.get('/memberships', protect, getMyMemberships);

module.exports = router;
