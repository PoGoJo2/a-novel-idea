const express = require('express');
const { body, param } = require('express-validator');

const { switchSlot, leaveGroup } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const idRule = param('id').isMongoId().withMessage('Invalid booking id');

// Every route here needs a logged-in user
router.use(protect);

router.put('/:id', [idRule, body('slotId').isMongoId().withMessage('A valid slotId is required')], validate, switchSlot);
router.delete('/:id', [idRule], validate, leaveGroup);

module.exports = router;
