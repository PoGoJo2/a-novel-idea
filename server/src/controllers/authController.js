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

module.exports = { register, login, getMe, logout };
