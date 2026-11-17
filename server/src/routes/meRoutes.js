const express = require('express');

const { getMyMemberships } = require('../controllers/bookingController');
const { ledGroups } = require('../controllers/memberToolsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Things that belong to the logged-in user
router.get('/memberships', protect, getMyMemberships);
router.get('/led-groups', protect, authorize('leader', 'admin'), ledGroups);

module.exports = router;
