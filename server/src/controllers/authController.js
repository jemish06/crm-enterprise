const authService = require('../services/authService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const User = require('../models/User'); // ADD THIS
const jwt = require('jsonwebtoken'); // ADD THIS

class AuthController {
  // Register new company and admin
  async register(req, res, next) {
    try {
      const { companyName, subdomain, email, password, firstName, lastName } = req.body;

      const result = await authService.register({
        companyName,
        subdomain,
        email,
        password,
        firstName,
        lastName,
      });

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return ApiResponse.success(
        res,
        {
          user: result.user,
          company: result.company,
          accessToken: result.tokens.accessToken,
        },
        'Registration successful',
        201
      );
    } catch (error) {
      logger.error('Register controller error:', error);
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password, subdomain } = req.body;

      const result = await authService.login({ email, password, subdomain });

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(
        res,
        {
          user: result.user,
          company: result.company,
          accessToken: result.tokens.accessToken,
        },
        'Login successful'
      );
    } catch (error) {
      return ApiResponse.error(res, error.message || 'Login failed', 401);
    }
  }

  // Accept invitation - NEW METHOD
  async acceptInvitation(req, res, next) {
    try {
      const { token, password, firstName, lastName } = req.body;

      if (!token || !password) {
        return ApiResponse.error(res, 'Token and password are required', 400);
      }

      // Find user by invitation token
      const user = await User.findOne({
        invitationToken: token,
        invitationExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return ApiResponse.error(res, 'Invalid or expired invitation token', 400);
      }

      // Update user details
      user.password = password; // Will be hashed by pre-save hook
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      user.isActive = true;
      user.invitationToken = undefined;
      user.invitationExpiry = undefined;
      
      await user.save();

      // Generate auth token
      const authToken = jwt.sign(
        { 
          userId: user._id, 
          tenantId: user.tenantId,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      logger.info(`User accepted invitation: ${user.email}`);

      return ApiResponse.success(
        res,
        {
          token: authToken,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            tenantId: user.tenantId,
          },
        },
        'Invitation accepted successfully'
      );
    } catch (error) {
      logger.error('Accept invitation error:', error);
      return ApiResponse.error(res, error.message || 'Failed to accept invitation', 500);
    }
  }

  // Refresh access token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token not found', 401);
      }

      const result = await authService.refreshToken(refreshToken);

      return ApiResponse.success(res, result, 'Token refreshed');
    } catch (error) {
      return ApiResponse.error(res, error.message || 'Token refresh failed', 401);
    }
  }

  // Logout user
  async logout(req, res, next) {
    try {
      await authService.logout(req.user.userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout controller error:', error);
      next(error);
    }
  }

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      const result = await authService.getCurrentUser(req.user.userId);

      return ApiResponse.success(res, result, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get current user error:', error);
      next(error);
    }
  }

  // Request password reset
  async forgotPassword(req, res, next) {
    try {
      const { email, subdomain } = req.body;

      const result = await authService.requestPasswordReset(email, subdomain);

      return ApiResponse.success(res, result, 'Password reset email sent');
    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  }

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { token, password, subdomain } = req.body;

      const result = await authService.resetPassword(token, password, subdomain);

      return ApiResponse.success(res, result, 'Password reset successful');
    } catch (error) {
      return ApiResponse.error(res, error.message || 'Password reset failed', 400);
    }
  }
}

module.exports = new AuthController();
