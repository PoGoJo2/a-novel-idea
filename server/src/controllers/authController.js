const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// Only send back fields that are safe to show
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  timezone: user.timezone,
  themePreference: user.themePreference,
  mustChangePassword: Boolean(user.mustChangePassword),
});

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  // Pick fields on purpose: a visitor must never be able to set their own role
  const { name, email, password, timezone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('An account with that email already exists', 409);

  const user = await User.create({ name, email, password, timezone });

  res.status(201).json({ success: true, token: generateToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  // Same message for "no user" and "wrong password" so attackers learn nothing
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({ success: true, token: generateToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me  (protected)
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// POST /api/auth/logout  (protected)
// Tokens live in the browser, so the client deletes it; this endpoint just confirms.
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// PUT /api/auth/password  (protected)
// The signed-in person changes their own password. They must type the current one first.
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw new AppError('Your current password is not correct', 400);
  if (currentPassword === newPassword) throw new AppError('Please choose a password that is different from the current one', 400);

  user.password = newPassword;
  user.mustChangePassword = false;
  user.passwordResetRequestedAt = null;
  await user.save({ validateBeforeSave: false });

  // Older logins stop working, so this device gets a fresh one
  res.json({ success: true, message: 'Your password was changed.', token: generateToken(user._id), user: publicUser(user) });
});

// POST /api/auth/forgot-password
// Someone who forgot their password asks for help. An administrator sees the request and sets a
// temporary password. The answer is always the same, so nobody can use it to find out who has an account.
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && !user.suspended) {
    user.passwordResetRequestedAt = new Date();
    await user.save({ validateBeforeSave: false });
  }
  res.json({
    success: true,
    message: 'Thank you. If that email has an account, an administrator will set a temporary password and contact you.',
  });
});

module.exports = { register, login, getMe, logout, changePassword, forgotPassword };
