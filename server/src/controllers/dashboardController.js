const dashboardService = require('../services/dashboardService');
const ApiResponse = require('../utils/response');

class DashboardController {
  async getOverview(req, res, next) {
    try {
      const overview = await dashboardService.getOverview(
        req.tenantId,
        req.user.userId,
        req.user.role
      );
      return ApiResponse.success(res, overview, 'Dashboard overview retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getSalesMetrics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const metrics = await dashboardService.getSalesMetrics(req.tenantId, start, end);
      return ApiResponse.success(res, metrics, 'Sales metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getLeadMetrics(req, res, next) {
    try {
      const metrics = await dashboardService.getLeadMetrics(req.tenantId);
      return ApiResponse.success(res, metrics, 'Lead metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUserPerformance(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const performance = await dashboardService.getUserPerformance(req.tenantId, start, end);
      return ApiResponse.success(res, performance, 'User performance retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivities(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const activities = await dashboardService.getRecentActivities(
        req.tenantId,
        req.user.userId,
        parseInt(limit)
      );
      return ApiResponse.success(res, activities, 'Recent activities retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingTasks(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const tasks = await dashboardService.getUpcomingTasks(
        req.tenantId,
        req.user.userId,
        parseInt(days)
      );
      return ApiResponse.success(res, tasks, 'Upcoming tasks retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
