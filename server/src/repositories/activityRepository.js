const Activity = require('../models/Activity');

class ActivityRepository {
  async create(tenantId, activityData) {
    return Activity.create({ tenantId, ...activityData });
  }

  async findById(tenantId, activityId) {
    return Activity.findOne({ tenantId, _id: activityId }).populate('createdBy');
  }

  async findAll(tenantId, filters = {}, options = {}) {
    const { page = 1, limit = 50, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ tenantId, ...filters })
      .populate('createdBy')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments({ tenantId, ...filters });

    return {
      data: activities,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findByRelated(tenantId, relatedType, relatedId) {
    return Activity.find({
      tenantId,
      'relatedTo.type': relatedType,
      'relatedTo.id': relatedId,
    })
      .populate('createdBy')
      .sort('-createdAt');
  }

  async findByUser(tenantId, userId, options = {}) {
    const { limit = 50, type = null } = options;
    const query = { tenantId, createdBy: userId };
    if (type) query.type = type;

    return Activity.find(query)
      .sort('-createdAt')
      .limit(limit);
  }

  async getActivityStats(tenantId, startDate, endDate) {
    return Activity.aggregate([
      {
        $match: {
          tenantId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  async delete(tenantId, activityId) {
    return Activity.findOneAndDelete({ tenantId, _id: activityId });
  }
}

module.exports = new ActivityRepository();
