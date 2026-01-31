const accountService = require('../services/accountService');
const ApiResponse = require('../utils/response');

class AccountController {
  async createAccount(req, res, next) {
    try {
      const account = await accountService.createAccount(req.tenantId, req.user.userId, req.body);
      return ApiResponse.success(res, account, 'Account created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req, res, next) {
    try {
      const { includeRelations } = req.query;
      const account = includeRelations
        ? await accountService.getAccountWithRelations(req.tenantId, req.params.id)
        : await accountService.getAccountById(req.tenantId, req.params.id);
      return ApiResponse.success(res, account, 'Account retrieved successfully');
    } catch (error) {
      if (error.message === 'Account not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async getAllAccounts(req, res, next) {
    try {
      const { page, limit, sort, search, type, assignedTo } = req.query;
      const filters = {};
      if (type) filters.type = type;
      if (assignedTo) filters.assignedTo = assignedTo;

      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 50, sort, search };
      const result = await accountService.getAllAccounts(req.tenantId, filters, options);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Accounts retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateAccount(req, res, next) {
    try {
      const account = await accountService.updateAccount(req.tenantId, req.user.userId, req.params.id, req.body);
      return ApiResponse.success(res, account, 'Account updated successfully');
    } catch (error) {
      if (error.message === 'Account not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      await accountService.deleteAccount(req.tenantId, req.params.id);
      return ApiResponse.success(res, null, 'Account deleted successfully');
    } catch (error) {
      if (error.message === 'Account not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async addNote(req, res, next) {
    try {
      const account = await accountService.addNote(req.tenantId, req.user.userId, req.params.id, req.body.content);
      return ApiResponse.success(res, account, 'Note added successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const stats = await accountService.getAccountStatistics(req.tenantId);
      return ApiResponse.success(res, stats, 'Account statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  // Add this method to authController
async acceptInvitation(req, res) {
  try {
    const { token, password, firstName, lastName } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required',
      });
    }

    // Find user by invitation token
    const user = await User.findOne({
      invitationToken: token,
      invitationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation token',
      });
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

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
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
    });
  } catch (error) {
    logger.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept invitation',
    });
  }
}

}

module.exports = new AccountController();
