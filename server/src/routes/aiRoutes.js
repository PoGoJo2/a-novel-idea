const express = require('express');
const { body } = require('express-validator');

const { chat } = require('../controllers/aiController');
const optionalAuth = require('../middleware/optionalAuth');
const simpleRateLimit = require('../middleware/simpleRateLimit');
const validate = require('../middleware/validate');

const router = express.Router();

const chatRules = [
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1 to 500 characters'),
  body('bookId').optional({ nullable: true }).isMongoId().withMessage('Invalid book id'),
  body('history').optional().isArray({ max: 8 }).withMessage('History must be a short list'),
];

router.post('/chat', simpleRateLimit({ max: 20 }), optionalAuth, chatRules, validate, chat);

module.exports = router;
