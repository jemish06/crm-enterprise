const userService = require('../services/userService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const { page, limit, search, role, isActive } = req.query;

      const filters = {};
      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        search: search || '',
      };

      const result = await userService.getAllUsers(req.tenantId, filters, options);

      return ApiResponse.paginated(
        res,
        result.data,
        result.pagination,
        'Users retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all users error:', error);
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(req.tenantId, id);

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get user by ID error:', error);
      next(error);
    }
  }

  async inviteUser(req, res, next) {
    try {
      const { email, firstName, lastName, role } = req.body;

      const result = await userService.inviteUser(req.tenantId, {
        email,
        firstName,
        lastName,
        role: role || 'user',
        invitedBy: req.user.userId,
      });

      return ApiResponse.success(
        res,
        result,
        'User invited successfully',
        201
      );
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        return ApiResponse.error(res, error.message, 400);
      }
      logger.error('Invite user error:', error);
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await userService.updateUser(req.tenantId, id, updateData);

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;

      const user = await userService.toggleUserStatus(req.tenantId, id);

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      return ApiResponse.success(
        res,
        user,
        `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      logger.error('Toggle user status error:', error);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      await userService.deleteUser(req.tenantId, id);

      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      if (error.message === 'Cannot delete the only admin user') {
        return ApiResponse.error(res, error.message, 400);
      }
      logger.error('Delete user error:', error);
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await userService.updateUserRole(req.tenantId, id, role);

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      return ApiResponse.success(res, user, 'User role updated successfully');
    } catch (error) {
      logger.error('Update user role error:', error);
      next(error);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const user = await userService.getUserById(req.tenantId, req.user.userId);

      return ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get my profile error:', error);
      next(error);
    }
  }
}

module.exports = new UserController();
