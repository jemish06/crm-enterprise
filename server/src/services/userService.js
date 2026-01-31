const User = require('../models/User');
const logger = require('../utils/logger');
const crypto = require('crypto');
const emailService = require('./emailService');

class UserService {
  async getAllUsers(tenantId, filters, options) {
    try {
      const query = { tenantId, ...filters };
      const { page, limit, search } = options;

      let mongoQuery = User.find(query).select('-password');

      if (search) {
        mongoQuery = mongoQuery.or([
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]);
      }

      const users = await mongoQuery
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(query);

      return {
        data: users,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  async getUserById(tenantId, userId) {
    try {
      const user = await User.findOne({ _id: userId, tenantId }).select('-password');
      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  async inviteUser(tenantId, userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        email: userData.email,
        tenantId,
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate invitation token
      const invitationToken = crypto.randomBytes(32).toString('hex');
      const invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create temporary password
      const tempPassword = crypto.randomBytes(16).toString('hex');

      // Create user
      const user = await User.create({
        ...userData,
        tenantId,
        password: tempPassword, // Will be hashed by pre-save hook
        isActive: false, // Inactive until they accept invitation
        invitationToken,
        invitationExpiry,
      });

      logger.info(`User invited: ${user.email}`);

      // Send invitation email
      try {
        await emailService.sendInvitationEmail({
          to: user.email,
          name: user.fullName,
          token: invitationToken,
        });
        logger.info(`Invitation email sent to ${user.email}`);
      } catch (emailError) {
        logger.error('Failed to send invitation email:', emailError);
        // Don't throw error, user is created successfully
      }

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        invitationToken, // Return for testing purposes
      };
    } catch (error) {
      logger.error('Invite user error:', error);
      throw error;
    }
  }

  async updateUser(tenantId, userId, updateData) {
    try {
      // Don't allow updating certain fields
      delete updateData.password;
      delete updateData.email;
      delete updateData.tenantId;

      const user = await User.findOneAndUpdate(
        { _id: userId, tenantId },
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return null;
      }

      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  async toggleUserStatus(tenantId, userId) {
    try {
      const user = await User.findOne({ _id: userId, tenantId });

      if (!user) {
        return null;
      }

      user.isActive = !user.isActive;
      await user.save();

      logger.info(`User ${user.isActive ? 'activated' : 'deactivated'}: ${user.email}`);

      // Return user without password
      return await User.findById(userId).select('-password');
    } catch (error) {
      logger.error('Toggle user status error:', error);
      throw error;
    }
  }

  async deleteUser(tenantId, userId) {
    try {
      const user = await User.findOne({ _id: userId, tenantId });

      if (!user) {
        throw new Error('User not found');
      }

      // Prevent deleting the last admin
      if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ tenantId, role: 'admin' });
        if (adminCount <= 1) {
          throw new Error('Cannot delete the only admin user');
        }
      }

      await User.findByIdAndDelete(userId);

      logger.info(`User deleted: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  async updateUserRole(tenantId, userId, newRole) {
    try {
      const user = await User.findOne({ _id: userId, tenantId });

      if (!user) {
        return null;
      }

      // Prevent changing the last admin's role
      if (user.role === 'admin' && newRole !== 'admin') {
        const adminCount = await User.countDocuments({ tenantId, role: 'admin' });
        if (adminCount <= 1) {
          throw new Error('Cannot change the role of the only admin user');
        }
      }

      user.role = newRole;
      await user.save();

      logger.info(`User role updated: ${user.email} -> ${newRole}`);

      return await User.findById(userId).select('-password');
    } catch (error) {
      logger.error('Update user role error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
