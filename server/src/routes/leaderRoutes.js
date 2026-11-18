const express = require('express');
const c = require('../controllers/leaderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, authorize('leader', 'admin'));

router.get('/classes', c.classes);          // classes I lead
router.get('/open', c.open);                // classes I can volunteer for
router.get('/record', c.record);            // classes I finished
router.post('/classes/:groupId/request', c.request);
router.delete('/classes/:groupId/request', c.withdraw);
router.put('/classes/:groupId/finish', c.finish);

module.exports = router;
