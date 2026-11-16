const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Like "protect", but visitors who are not logged in may continue too (req.user is just left empty).
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      // a bad or expired token is treated like being logged out
    }
  }
  next();
};

module.exports = optionalAuth;
