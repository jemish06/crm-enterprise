const leadService = require('../services/leadService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class LeadController {
  async createLead(req, res, next) {
    try {
      const lead = await leadService.createLead(
        req.tenantId,
        req.user.userId,
        req.body
      );

      return ApiResponse.success(
        res,
        lead,
        'Lead created successfully',
        201
      );
    } catch (error) {
      logger.error('Create lead controller error:', error);
      next(error);
    }
  }

  async getLeadById(req, res, next) {
    try {
      const { id } = req.params;
      const populate = req.query.populate?.split(',') || ['assignedTo', 'createdBy'];

      const lead = await leadService.getLeadById(req.tenantId, id, populate);

      return ApiResponse.success(res, lead, 'Lead retrieved successfully');
    } catch (error) {
      if (error.message === 'Lead not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      logger.error('Get lead controller error:', error);
      next(error);
    }
  }

  async getAllLeads(req, res, next) {
    try {
      const {
        page,
        limit,
        sort,
        search,
        status,
        source,
        assignedTo,
        stage,
      } = req.query;

      // Build filters
      const filters = {};
      if (status) filters.status = status;
      if (source) filters.source = source;
      if (assignedTo) filters.assignedTo = assignedTo;
      if (stage) filters.stage = stage;

      // Build options
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        sort: sort || '-createdAt',
        search: search || '',
        populate: ['assignedTo', 'createdBy'],
      };

      const result = await leadService.getAllLeads(req.tenantId, filters, options);

      return ApiResponse.paginated(
        res,
        result.data,
        result.pagination,
        'Leads retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all leads controller error:', error);
      next(error);
    }
  }

  async updateLead(req, res, next) {
    try {
      const { id } = req.params;

      const lead = await leadService.updateLead(
        req.tenantId,
        req.user.userId,
        id,
        req.body
      );

      return ApiResponse.success(res, lead, 'Lead updated successfully');
    } catch (error) {
      if (error.message === 'Lead not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      logger.error('Update lead controller error:', error);
      next(error);
    }
  }

  async deleteLead(req, res, next) {
    try {
      const { id } = req.params;

      await leadService.deleteLead(req.tenantId, id);

      return ApiResponse.success(res, null, 'Lead deleted successfully');
    } catch (error) {
      if (error.message === 'Lead not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      logger.error('Delete lead controller error:', error);
      next(error);
    }
  }

  async addNote(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const lead = await leadService.addNote(
        req.tenantId,
        req.user.userId,
        id,
        content
      );

      return ApiResponse.success(res, lead, 'Note added successfully');
    } catch (error) {
      if (error.message === 'Lead not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      logger.error('Add note controller error:', error);
      next(error);
    }
  }

  async bulkAssign(req, res, next) {
    try {
      const { leadIds, assignedTo } = req.body;

      const result = await leadService.assignLeads(
        req.tenantId,
        leadIds,
        assignedTo
      );

      return ApiResponse.success(res, result, 'Leads assigned successfully');
    } catch (error) {
      logger.error('Bulk assign controller error:', error);
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const stats = await leadService.getLeadStatistics(req.tenantId);

      return ApiResponse.success(res, stats, 'Statistics retrieved successfully');
    } catch (error) {
      logger.error('Get statistics controller error:', error);
      next(error);
    }
  }

  async convertLead(req, res, next) {
  try {
    const { id } = req.params;
    
    // Log what we received
    logger.info('Convert lead request data:', req.body);

    // Pass the entire req.body as conversionData
    const result = await leadService.convertLead(
      req.tenantId,
      req.user.userId,
      id,
      req.body  // This is the conversionData
    );

    return ApiResponse.success(res, result, 'Lead converted successfully');
  } catch (error) {
    if (error.message === 'Lead not found' || error.message === 'Lead already converted') {
      return ApiResponse.error(res, error.message, 400);
    }
    logger.error('Convert lead controller error:', error);
    next(error);
  }
}

}

module.exports = new LeadController();
