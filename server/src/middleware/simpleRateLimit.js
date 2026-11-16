const AppError = require('../utils/AppError');

// A tiny per-IP limiter so the AI endpoint cannot be spammed (it can cost money when an API key is used).
const simpleRateLimit = ({ max = 20, windowMs = 60 * 1000 } = {}) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip);
    if (!entry || entry.reset < now) {
      hits.set(req.ip, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) return next(new AppError('You are asking too fast. Please wait a minute and try again.', 429));
    next();
  };
};

module.exports = simpleRateLimit;
