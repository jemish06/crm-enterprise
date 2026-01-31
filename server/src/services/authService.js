const User = require('../models/User');
const Company = require('../models/Company');
const JWTUtil = require('../utils/jwt');
const logger = require('../utils/logger');
const redisClient = require('../config/redis');

class AuthService {
  // Register new company and admin user
  async register({ companyName, subdomain, email, password, firstName, lastName }) {
    try {
      // Check if subdomain exists
      const existingCompany = await Company.findOne({ subdomain });
      if (existingCompany) {
        throw new Error('Subdomain already exists');
      }

      // Create company (tenant)
      const company = await Company.create({
        name: companyName,
        subdomain: subdomain.toLowerCase(),
      });

      // Create admin user
      const user = await User.create({
        tenantId: company._id,
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        role: 'admin',
        permissions: ['*'], // Full permissions
      });

      // Update company user count
      company.totalUsers = 1;
      await company.save();

      // Generate tokens
      const accessToken = JWTUtil.generateAccessToken(user._id, company._id);
      const refreshToken = JWTUtil.generateRefreshToken(user._id, company._id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      logger.info(`New company registered: ${company.name} (${subdomain})`);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
        },
        company: {
          id: company._id,
          name: company.name,
          subdomain: company.subdomain,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login({ email, password, subdomain }) {
    try {
      // Find company by subdomain
      const company = await Company.findOne({ subdomain: subdomain.toLowerCase() });
      if (!company || !company.isActive) {
        throw new Error('Invalid credentials');
      }

      // Find user by email and tenantId
      const user = await User.findOne({
        tenantId: company._id,
        email: email.toLowerCase(),
      }).select('+password +refreshToken');

      if (!user || !user.isActive) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate new tokens
      const accessToken = JWTUtil.generateAccessToken(user._id, company._id);
      const refreshToken = JWTUtil.generateRefreshToken(user._id, company._id);

      // Update refresh token
      user.refreshToken = refreshToken;
      await user.save();

      // Cache user session in Redis
      await redisClient.set(
        `user:${user._id}:session`,
        {
          userId: user._id,
          tenantId: company._id,
          role: user.role,
        },
        3600 // 1 hour
      );

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          avatar: user.avatar,
        },
        company: {
          id: company._id,
          name: company.name,
          subdomain: company.subdomain,
          settings: company.settings,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId).select('+refreshToken');
      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = JWTUtil.generateAccessToken(user._id, user.tenantId);

      return { accessToken };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Logout user
  async logout(userId) {
    try {
      // Remove refresh token from user
      await User.findByIdAndUpdate(userId, { refreshToken: null });

      // Clear Redis cache
      await redisClient.del(`user:${userId}:session`);

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email, subdomain) {
    try {
      // Find company
      const company = await Company.findOne({ subdomain: subdomain.toLowerCase() });
      if (!company) {
        // Don't reveal if company exists
        return { message: 'If email exists, reset link has been sent' };
      }

      // Find user
      const user = await User.findOne({
        tenantId: company._id,
        email: email.toLowerCase(),
      });

      if (!user) {
        // Don't reveal if user exists
        return { message: 'If email exists, reset link has been sent' };
      }

      // Generate reset token
      const { resetToken, hashedToken } = JWTUtil.generatePasswordResetToken();

      // Save hashed token to user
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      // TODO: Send email with reset link
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&subdomain=${subdomain}`;

      logger.info(`Password reset requested for: ${email}`);

      return {
        message: 'Password reset link sent to email',
        resetToken, // Remove in production, only for testing
      };
    } catch (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(resetToken, newPassword, subdomain) {
    try {
      // Hash token for comparison
      const hashedToken = JWTUtil.hashToken(resetToken);

      // Find company
      const company = await Company.findOne({ subdomain: subdomain.toLowerCase() });
      if (!company) {
        throw new Error('Invalid reset link');
      }

      // Find user with valid reset token
      const user = await User.findOne({
        tenantId: company._id,
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error('Token is invalid or has expired');
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = Date.now();
      await user.save();

      logger.info(`Password reset successful for: ${user.email}`);

      return { message: 'Password reset successful' };
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId).populate('tenantId', 'name subdomain settings');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar,
          phone: user.phone,
          lastLogin: user.lastLogin,
        },
        company: {
          id: user.tenantId._id,
          name: user.tenantId.name,
          subdomain: user.tenantId.subdomain,
          settings: user.tenantId.settings,
        },
      };
    } catch (error) {
      logger.error('Get current user error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
