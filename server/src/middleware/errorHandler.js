const AppError = require('../utils/AppError');

// Runs when no route matched
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// One place that turns every error into a consistent JSON response
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let status = err.statusCode || 500;
  let message = err.message;

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Session expired, please log in again';
  }

  // Do not leak internal details in production
  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong';
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
