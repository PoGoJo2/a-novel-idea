const express = require('express');

const c = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Everything here is for administrators only
router.use(protect, authorize('admin'));

router.get('/stats', c.stats);

router.get('/groups', c.groups);
router.post('/groups', c.createGroup);
router.put('/groups/:id', c.updateGroup);

router.get('/books', c.books);
router.post('/books', c.createBook);
router.put('/books/:id/retire', c.retireBook);

router.get('/users', c.users);
router.put('/users/:id/role', c.setRole);
router.put('/users/:id/suspend', c.suspend);

router.get('/leaders', c.leaders);
router.get('/leader-requests', c.leaderRequests);
router.put('/leader-requests/:id', c.decideLeaderRequest);

router.get('/feedback', c.feedback);
router.put('/feedback/:id', c.setFeedback);

module.exports = router;
