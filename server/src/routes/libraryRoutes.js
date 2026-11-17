const express = require('express');
const { param } = require('express-validator');

const { ids, library, change } = require('../controllers/libraryController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();
const bookRule = [param('bookId').isMongoId().withMessage('Invalid book id')];

// Everything here belongs to the logged-in reader
router.use(protect);

router.get('/', library); // full books for the My Library page
router.get('/ids', ids); // just ids, to fill in hearts and bookmarks

router.put('/favorites/:bookId', bookRule, validate, change('favorites', true));
router.delete('/favorites/:bookId', bookRule, validate, change('favorites', false));
router.put('/saved/:bookId', bookRule, validate, change('saved', true));
router.delete('/saved/:bookId', bookRule, validate, change('saved', false));
router.put('/notify/:bookId', bookRule, validate, change('notify', true));
router.delete('/notify/:bookId', bookRule, validate, change('notify', false));

module.exports = router;
