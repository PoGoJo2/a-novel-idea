const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// protect: requires a valid "Authorization: Bearer <token>" header
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Not authorized, no token', 401);
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // errors handled centrally

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('This account no longer exists', 401);

  // An administrator can remove a disruptive client; their login stops working at once
  if (user.suspended) throw new AppError('This account has been suspended. Please contact the club administrator.', 403);

  req.user = user;
  next();
});

// authorize('leader', 'admin'): only these roles may continue
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to do that', 403));
  }
  next();
};

module.exports = { protect, authorize };
