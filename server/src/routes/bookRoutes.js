const express = require('express');
const { query, param } = require('express-validator');

const { listBooks, getGenres, getBook, getBookLinks } = require('../controllers/bookController');
const validate = require('../middleware/validate');
const { GENRES } = require('../models/Book');

const router = express.Router();

const listRules = [
  query('genre').optional().isIn(GENRES).withMessage(`Genre must be one of: ${GENRES.join(', ')}`),
  query('q').optional().trim().isLength({ max: 100 }).withMessage('Search text is too long'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];
const idRule = [param('id').isMongoId().withMessage('Invalid book id')];

router.get('/genres', getGenres); // must come before '/:id'
router.get('/', listRules, validate, listBooks);
router.get('/:id', idRule, validate, getBook);
router.get('/:id/links', idRule, validate, getBookLinks);

module.exports = router;
