const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/response');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later',
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many requests, please try again later',
      429
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many authentication attempts, please try again after 15 minutes',
      429
    );
  },
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts',
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many password reset attempts, please try again after 1 hour',
      429
    );
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
};
