const express = require('express');
const { query, param } = require('express-validator');

const { listGroups, getGroup } = require('../controllers/groupController');
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

router.get('/', listRules, validate, listGroups);
router.get('/:id', idRule, validate, getGroup);

module.exports = router;
