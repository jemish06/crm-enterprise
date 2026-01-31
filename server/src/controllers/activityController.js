const activityService = require('../services/activityService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class ActivityController {
  async logActivity(req, res, next) {
    try {
      logger.info('Log activity request:', req.body);
      
      const activityData = { 
        ...req.body, 
        tenantId: req.tenantId,  // ADD THIS
        createdBy: req.user.userId 
      };
      
const activity = await activityService.logActivity(req.tenantId, activityData);
      return ApiResponse.success(res, activity, 'Activity logged successfully', 201);
    } catch (error) {
      logger.error('Log activity controller error:', error);
      next(error);
    }
  }

  async getActivityById(req, res, next) {
    try {
      const activity = await activityService.getActivityById(req.tenantId, req.params.id);
      return ApiResponse.success(res, activity, 'Activity retrieved successfully');
    } catch (error) {
      if (error.message === 'Activity not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async getAllActivities(req, res, next) {
    try {
      const { page, limit, sort, type, relatedType, relatedId } = req.query;
      const filters = {};
      if (type) filters.type = type;
      if (relatedType && relatedId) {
        filters['relatedTo.type'] = relatedType;
        filters['relatedTo.id'] = relatedId;
      }

      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 50, sort };
      const result = await activityService.getAllActivities(req.tenantId, filters, options);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Activities retrieved');
    } catch (error) {
      logger.error('Get all activities error:', error);
      next(error);
    }
  }

  async getActivitiesByRelated(req, res, next) {
    try {
      const { type, id } = req.params;
      const activities = await activityService.getActivitiesByRelated(req.tenantId, type, id);
      return ApiResponse.success(res, activities, 'Related activities retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getMyActivities(req, res, next) {
    try {
      const { limit, type } = req.query;
      const options = { limit: parseInt(limit) || 50, type };
      const activities = await activityService.getMyActivities(req.tenantId, req.user.userId, options);
      return ApiResponse.success(res, activities, 'My activities retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const stats = await activityService.getActivityStatistics(req.tenantId, start, end);
      return ApiResponse.success(res, stats, 'Activity statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async deleteActivity(req, res, next) {
    try {
      await activityService.deleteActivity(req.tenantId, req.params.id);
      return ApiResponse.success(res, null, 'Activity deleted successfully');
    } catch (error) {
      if (error.message === 'Activity not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }
}

module.exports = new ActivityController();
