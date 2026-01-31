const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class ErrorHandler {
  // Handle Mongoose validation errors
  handleValidationError(err) {
    const errors = Object.values(err.errors).map(el => ({
      field: el.path,
      message: el.message,
    }));

    return {
      message: 'Validation Error',
      statusCode: 400,
      errors,
    };
  }

  // Handle Mongoose duplicate key errors
  handleDuplicateKeyError(err) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];

    return {
      message: `${field} '${value}' already exists`,
      statusCode: 409,
      errors: [{ field, message: `${field} must be unique` }],
    };
  }

  // Handle Mongoose cast errors
  handleCastError(err) {
    return {
      message: `Invalid ${err.path}: ${err.value}`,
      statusCode: 400,
      errors: [{ field: err.path, message: 'Invalid ID format' }],
    };
  }

  // Global error handler
  globalHandler(err, req, res, next) {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      user: req.user?.userId,
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      error = this.handleValidationError(err);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      error = this.handleDuplicateKeyError(err);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
      error = this.handleCastError(err);
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    const errors = error.errors || null;

    return ApiResponse.error(res, message, statusCode, errors);
  }

  // Handle 404 errors
  notFound(req, res) {
    return ApiResponse.error(
      res,
      `Route ${req.originalUrl} not found`,
      404
    );
  }
}

module.exports = new ErrorHandler();
