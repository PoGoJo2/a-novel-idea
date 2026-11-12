// An error with an HTTP status code, so controllers can say exactly what went wrong.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
