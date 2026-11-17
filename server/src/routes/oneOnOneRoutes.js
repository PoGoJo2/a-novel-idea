const express = require('express');
const { param } = require('express-validator');

const { bookSlot, cancelMyBooking, cancelSlot } = require('../controllers/memberToolsController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();
const idRule = param('id').isMongoId().withMessage('Invalid one-on-one id');

router.use(protect);
router.post('/:id/book', [idRule], validate, bookSlot); // member books a time
router.delete('/:id/book', [idRule], validate, cancelMyBooking); // member cancels their booking
router.delete('/:id', [idRule], validate, cancelSlot); // leader withdraws a time

module.exports = router;
