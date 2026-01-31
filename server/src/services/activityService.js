const activityRepository = require('../repositories/activityRepository');
const Activity = require('../models/Activity');
const logger = require('../utils/logger');

class ActivityService {
  async logActivity(tenantId, activityData) {
    try {
      logger.info('Activity service - tenantId:', tenantId);
      logger.info('Activity service - activityData:', activityData);
      
      // Use repository if it exists, otherwise use model directly
      let activity;
      if (activityRepository && activityRepository.create) {
        activity = await activityRepository.create(tenantId, activityData);
      } else {
        // Direct model creation if repository doesn't exist
        activity = await Activity.create(activityData);
        await activity.populate('createdBy', 'firstName lastName email');
      }
      
      logger.info(`Activity logged: ${activity.type} - ${activity.subject}`);
      return activity;
    } catch (error) {
      logger.error('Log activity error:', error);
      throw error;
    }
  }

  async getActivityById(tenantId, activityId) {
    if (activityRepository && activityRepository.findById) {
      const activity = await activityRepository.findById(tenantId, activityId);
      if (!activity) throw new Error('Activity not found');
      return activity;
    } else {
      const activity = await Activity.findOne({ _id: activityId, tenantId })
        .populate('createdBy', 'firstName lastName email');
      if (!activity) throw new Error('Activity not found');
      return activity;
    }
  }

  async getAllActivities(tenantId, filters, options) {
    if (activityRepository && activityRepository.findAll) {
      return activityRepository.findAll(tenantId, filters, options);
    } else {
      const query = { tenantId, ...filters };
      const { page = 1, limit = 50, sort = '-createdAt' } = options;
      
      const activities = await Activity.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit);
      
      const total = await Activity.countDocuments(query);
      
      return {
        data: activities,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      };
    }
  }

  async getActivitiesByRelated(tenantId, relatedType, relatedId) {
    if (activityRepository && activityRepository.findByRelated) {
      return activityRepository.findByRelated(tenantId, relatedType, relatedId);
    } else {
      return Activity.find({
        tenantId,
        'relatedTo.type': relatedType,
        'relatedTo.id': relatedId,
      })
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 });
    }
  }

  async getMyActivities(tenantId, userId, options) {
    if (activityRepository && activityRepository.findByUser) {
      return activityRepository.findByUser(tenantId, userId, options);
    } else {
      const query = { tenantId, createdBy: userId };
      if (options.type) query.type = options.type;
      
      return Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);
    }
  }

  async getActivityStatistics(tenantId, startDate, endDate) {
    if (activityRepository && activityRepository.getActivityStats) {
      return activityRepository.getActivityStats(tenantId, startDate, endDate);
    } else {
      const total = await Activity.countDocuments({
        tenantId,
        createdAt: { $gte: startDate, $lte: endDate },
      });
      
      return { total };
    }
  }

  async deleteActivity(tenantId, activityId) {
    if (activityRepository && activityRepository.delete) {
      const activity = await activityRepository.delete(tenantId, activityId);
      if (!activity) throw new Error('Activity not found');
      return activity;
    } else {
      const activity = await Activity.findOneAndDelete({ _id: activityId, tenantId });
      if (!activity) throw new Error('Activity not found');
      return activity;
    }
  }
}

module.exports = new ActivityService();
