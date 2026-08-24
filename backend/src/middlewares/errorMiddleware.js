const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new ApiError(409, message);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    const formattedErrors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    error = new ApiError(400, message, formattedErrors);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = errorHandler;
