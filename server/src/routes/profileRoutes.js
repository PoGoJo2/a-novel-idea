const express = require('express');
const c = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, c.list); // Meet the Leaders: any signed-in member, leader or administrator
router.get('/me', protect, authorize('leader', 'admin'), c.mine);
router.put('/me', protect, authorize('leader', 'admin'), c.update);
router.get('/:id', protect, c.one); // one leader's page (must come after /me)

module.exports = router;
