const express = require('express');
const { query, param, body } = require('express-validator');

const { listGroups, getGroup } = require('../controllers/groupController');
const { joinGroup } = require('../controllers/bookingController');
const { listNotes, saveNotes, listSlots, createSlot } = require('../controllers/memberToolsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { GENRES } = require('../models/Book');

const router = express.Router();

const listRules = [
  query('genre').optional().isIn(GENRES).withMessage(`Genre must be one of: ${GENRES.join(', ')}`),
  query('day').optional().isInt({ min: 0, max: 6 }).withMessage('Day must be 0 (Sunday) to 6 (Saturday)'),
  query('q').optional().trim().isLength({ max: 100 }).withMessage('Search text is too long'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];
const idRule = [param('id').isMongoId().withMessage('Invalid group id')];
const joinRules = [...idRule, body('slotId').isMongoId().withMessage('A valid slotId is required')];
const noteRules = [
  ...idRule,
  body('weekNumber').isInt({ min: 1, max: 52 }).withMessage('Week must be a number from 1 to 52').toInt(),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Notes must be 1 to 5000 characters'),
];
const slotRules = [
  ...idRule,
  body('startsAtUtc').isISO8601().withMessage('A valid date and time is required'),
  body('durationMinutes').optional().isInt({ min: 5, max: 120 }).withMessage('Duration must be 5 to 120 minutes').toInt(),
  body('meetingLink').optional({ checkFalsy: true }).isURL().withMessage('The video link must be a valid web address'),
];

router.get('/', listRules, validate, listGroups);
router.get('/:id', idRule, validate, getGroup);
router.post('/:id/join', protect, joinRules, validate, joinGroup); // logged-in members only

// Weekly notes: members and the leader read; only the leader writes
router.get('/:id/notes', protect, idRule, validate, listNotes);
router.post('/:id/notes', protect, authorize('leader', 'admin'), noteRules, validate, saveNotes);

// One-on-ones: members see open times and book; the leader offers times
router.get('/:id/one-on-ones', protect, idRule, validate, listSlots);
router.post('/:id/one-on-ones', protect, authorize('leader', 'admin'), slotRules, validate, createSlot);

module.exports = router;
