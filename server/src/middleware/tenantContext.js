const mongoose = require('mongoose');
const ApiResponse = require('../utils/response');
const Company = require('../models/Company');
const logger = require('../utils/logger');

class TenantMiddleware {
  // Inject tenant context into all queries
  async setTenantContext(req, res, next) {
    try {
      if (!req.user || !req.user.tenantId) {
        return ApiResponse.error(
          res,
          'Tenant context not found',
          400
        );
      }

const tenantId = req.user.tenantId;

      // Verify tenant exists and is active
      const tenant = await Company.findById(tenantId);

      if (!tenant || !tenant.isActive) {
        return ApiResponse.error(
          res,
          'Tenant not found or inactive',
          403
        );
      }

      // Attach tenant info to request
      req.tenantId = tenantId;
      req.tenant = {
        id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        settings: tenant.settings,
      };

      // Create reusable tenant query filter
      req.tenantQuery = { tenantId };

      next();
    } catch (error) {
      logger.error('Tenant context error:', error);
      return ApiResponse.error(
        res,
        'Failed to set tenant context',
        500
      );
    }
  }
}

module.exports = new TenantMiddleware();
