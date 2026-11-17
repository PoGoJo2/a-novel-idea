const express = require('express');
const { param, body } = require('express-validator');

const { list, current, save } = require('../controllers/goalController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();
const idRule = [param('id').isMongoId().withMessage('Invalid group id')];
const goalRules = [
  ...idRule,
  body('weekNumber').isInt({ min: 1, max: 52 }).withMessage('Week must be a number from 1 to 52').toInt(),
  body('chapters').trim().isLength({ max: 60 }).withMessage('Keep the goal under 60 characters, for example "Chapters 1-5"'),
];

// Mounted at /api, so these are /api/goals/current and /api/groups/:id/goals
router.get('/goals/current', current); // public: this week's goal for every open group
router.get('/groups/:id/goals', idRule, validate, list); // public: the whole plan for one group
router.put('/groups/:id/goals', protect, authorize('leader', 'admin'), goalRules, validate, save); // leader only

module.exports = router;
