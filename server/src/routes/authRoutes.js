const express = require('express');
const { body } = require('express-validator');

const { register, login, getMe, logout, changePassword, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }).withMessage('Name is too long'),
  body('email').trim().toLowerCase().isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Please type your current password'),
  body('newPassword').isLength({ min: 8 }).withMessage('The new password must be at least 8 characters'),
];

const forgotRules = [body('email').trim().toLowerCase().isEmail().withMessage('A valid email is required')];

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/password', protect, changePasswordRules, validate, changePassword);
router.post('/forgot-password', forgotRules, validate, forgotPassword);

module.exports = router;
