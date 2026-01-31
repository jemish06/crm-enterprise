const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class AuthMiddleware {
  // Verify JWT token and attach user to request
  async protect(req, res, next) {
    try {
      let token;

      // Get token from header
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
      }

      if (!token) {
        return ApiResponse.error(
          res,
          'You are not logged in. Please log in to access this resource',
          401
        );
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findById(decoded.userId).select('+password');

      if (!user || !user.isActive) {
        return ApiResponse.error(
          res,
          'User no longer exists or is inactive',
          401
        );
      }

      // Check if user changed password after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return ApiResponse.error(
          res,
          'User recently changed password. Please log in again',
          401
        );
      }

      // Attach user and tenant to request
      req.user = {
        userId: user._id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        fullName: user.fullName,
      };

      next();
    } catch (error) {
      logger.error('Auth middleware error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return ApiResponse.error(res, 'Invalid token. Please log in again', 401);
      }
      
      if (error.name === 'TokenExpiredError') {
        return ApiResponse.error(res, 'Token expired. Please log in again', 401);
      }

      return ApiResponse.error(res, 'Authentication failed', 401);
    }
  }

  // Optional authentication (doesn't fail if no token)
  async optional(req, res, next) {
    try {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user && user.isActive) {
          req.user = {
            userId: user._id,
            tenantId: user.tenantId,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
          };
        }
      }

      next();
    } catch (error) {
      next();
    }
  }
}

module.exports = new AuthMiddleware();
