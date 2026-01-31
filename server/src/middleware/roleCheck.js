const ApiResponse = require('../utils/response');

class RoleMiddleware {
  // Check if user has required role
  requireRole(...roles) {
    return (req, res, next) => {
      if (!req.user || !req.user.role) {
        return ApiResponse.error(
          res,
          'User role not found',
          403
        );
      }

      if (!roles.includes(req.user.role)) {
        return ApiResponse.error(
          res,
          `Access denied. Required role: ${roles.join(' or ')}`,
          403
        );
      }

      next();
    };
  }

  // Check if user has specific permission
  requirePermission(...permissions) {
    return (req, res, next) => {
      if (!req.user || !req.user.permissions) {
        return ApiResponse.error(
          res,
          'User permissions not found',
          403
        );
      }

      const hasPermission = permissions.some(permission =>
        req.user.permissions.includes(permission)
      );

      if (!hasPermission) {
        return ApiResponse.error(
          res,
          `Access denied. Required permission: ${permissions.join(' or ')}`,
          403
        );
      }

      next();
    };
  }

  // Check if user is admin or the resource owner
  requireOwnershipOrAdmin(resourceUserIdField = 'createdBy') {
    return (req, res, next) => {
      if (!req.user) {
        return ApiResponse.error(res, 'User not authenticated', 401);
      }

      // Admins can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Check ownership - will be validated in controller
      req.requiresOwnershipCheck = {
        field: resourceUserIdField,
        userId: req.user.userId,
      };

      next();
    };
  }
}

module.exports = new RoleMiddleware();
