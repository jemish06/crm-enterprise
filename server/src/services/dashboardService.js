const leadRepository = require('../repositories/leadRepository');
const dealRepository = require('../repositories/dealRepository');
const taskRepository = require('../repositories/taskRepository');
const activityRepository = require('../repositories/activityRepository');
const Contact = require('../models/Contact');
const logger = require('../utils/logger');

class DashboardService {
  async getOverview(tenantId, userId, role) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get counts
      const [
        totalLeads,
        totalContacts,
        totalDeals,
        totalTasks,
        myTasks,
        overdueTasks,
      ] = await Promise.all([
        leadRepository.count(tenantId),
        Contact.countDocuments({ tenantId }),
        dealRepository.findAll(tenantId, {}, { page: 1, limit: 1 }).then(r => r.pagination.totalItems),
        taskRepository.findAll(tenantId, {}, { page: 1, limit: 1 }).then(r => r.pagination.totalItems),
        taskRepository.findByUser(tenantId, userId, 'pending'),
        taskRepository.findOverdue(tenantId, userId),
      ]);

      // Get this month's data
      const [leadsThisMonth, dealsThisMonth, wonDealsThisMonth] = await Promise.all([
        leadRepository.count(tenantId, { createdAt: { $gte: startOfMonth } }),
        dealRepository.findAll(tenantId, { createdAt: { $gte: startOfMonth } }, { page: 1, limit: 1 })
          .then(r => r.pagination.totalItems),
        dealRepository.findAll(tenantId, {
          stage: 'closed-won',
          actualCloseDate: { $gte: startOfMonth },
        }, { page: 1, limit: 1 }).then(r => r.pagination.totalItems),
      ]);

      // Get last month's data for comparison
      const [leadsLastMonth, dealsLastMonth, wonDealsLastMonth] = await Promise.all([
        leadRepository.count(tenantId, {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        }),
        dealRepository.findAll(tenantId, {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        }, { page: 1, limit: 1 }).then(r => r.pagination.totalItems),
        dealRepository.findAll(tenantId, {
          stage: 'closed-won',
          actualCloseDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        }, { page: 1, limit: 1 }).then(r => r.pagination.totalItems),
      ]);

      // Calculate growth percentages
      const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      return {
        overview: {
          totalLeads,
          totalContacts,
          totalDeals,
          totalTasks,
          myPendingTasks: myTasks.length,
          overdueTasksCount: overdueTasks.length,
        },
        trends: {
          leads: {
            current: leadsThisMonth,
            previous: leadsLastMonth,
            growth: calculateGrowth(leadsThisMonth, leadsLastMonth),
          },
          deals: {
            current: dealsThisMonth,
            previous: dealsLastMonth,
            growth: calculateGrowth(dealsThisMonth, dealsLastMonth),
          },
          wonDeals: {
            current: wonDealsThisMonth,
            previous: wonDealsLastMonth,
            growth: calculateGrowth(wonDealsThisMonth, wonDealsLastMonth),
          },
        },
      };
    } catch (error) {
      logger.error('Dashboard overview error:', error);
      throw error;
    }
  }

  async getSalesMetrics(tenantId, startDate, endDate) {
    try {
      const [pipelineStats, revenueForecast, wonDeals] = await Promise.all([
        dealRepository.getPipelineStats(tenantId, 'sales'),
        dealRepository.getRevenueForecast(tenantId, startDate, endDate),
        dealRepository.getWonDeals(tenantId, startDate, endDate),
      ]);

      // Calculate pipeline health
      const totalPipelineValue = pipelineStats.reduce((sum, stage) => sum + stage.totalValue, 0);
      const weightedPipelineValue = pipelineStats.reduce((sum, stage) => sum + stage.weightedValue, 0);

      return {
        pipeline: {
          stages: pipelineStats,
          totalValue: totalPipelineValue,
          weightedValue: weightedPipelineValue,
        },
        forecast: revenueForecast,
        revenue: wonDeals.length > 0 ? wonDeals[0] : { totalRevenue: 0, dealCount: 0, avgDealSize: 0 },
      };
    } catch (error) {
      logger.error('Sales metrics error:', error);
      throw error;
    }
  }

  async getLeadMetrics(tenantId) {
    try {
      const [byStatus, bySource, conversionRate] = await Promise.all([
        leadRepository.getLeadsByStatus(tenantId),
        leadRepository.getLeadsBySource(tenantId),
        this.calculateLeadConversionRate(tenantId),
      ]);

      return {
        byStatus,
        bySource,
        conversionRate,
      };
    } catch (error) {
      logger.error('Lead metrics error:', error);
      throw error;
    }
  }

  async calculateLeadConversionRate(tenantId) {
    const totalLeads = await leadRepository.count(tenantId);
    const convertedLeads = await leadRepository.count(tenantId, { status: 'converted' });

    return {
      total: totalLeads,
      converted: convertedLeads,
      rate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
    };
  }

  async getUserPerformance(tenantId, startDate, endDate) {
    try {
      const dealsByUser = await dealRepository.getDealsByUser(tenantId, startDate, endDate);
      return dealsByUser;
    } catch (error) {
      logger.error('User performance error:', error);
      throw error;
    }
  }

  async getRecentActivities(tenantId, userId, limit = 20) {
    try {
      const activities = await activityRepository.findByUser(tenantId, userId, { limit });
      return activities;
    } catch (error) {
      logger.error('Recent activities error:', error);
      throw error;
    }
  }

  async getUpcomingTasks(tenantId, userId, days = 7) {
    try {
      const tasks = await taskRepository.findUpcoming(tenantId, userId, days);
      return tasks;
    } catch (error) {
      logger.error('Upcoming tasks error:', error);
      throw error;
    }
  }

  async getSalesTrend(tenantId, months = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const trend = await dealRepository.getWonDeals(tenantId, startDate, endDate);
      // TODO: Group by month for trend chart
      return trend;
    } catch (error) {
      logger.error('Sales trend error:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();
