const Task = require('../models/Task');

class TaskRepository {
  async create(tenantId, taskData) {
    return Task.create({ tenantId, ...taskData });
  }

  async findById(tenantId, taskId, populate = []) {
    let query = Task.findOne({ tenantId, _id: taskId });
    populate.forEach(field => query = query.populate(field));
    return query.exec();
  }

  async findAll(tenantId, filters = {}, options = {}) {
    const { page = 1, limit = 50, sort = '-createdAt', search = '' } = options;
    const skip = (page - 1) * limit;
    const query = { tenantId, ...filters };

    if (search) {
      query.$text = { $search: search };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo createdBy')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    return {
      data: tasks,
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

  async update(tenantId, taskId, updateData) {
    return Task.findOneAndUpdate(
      { tenantId, _id: taskId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('assignedTo');
  }

  async delete(tenantId, taskId) {
    return Task.findOneAndDelete({ tenantId, _id: taskId });
  }

  async findByUser(tenantId, userId, status = null) {
    const query = { tenantId, assignedTo: userId };
    if (status) query.status = status;
    return Task.find(query).sort('dueDate');
  }

  async findOverdue(tenantId, userId = null) {
    const query = {
      tenantId,
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] },
    };
    if (userId) query.assignedTo = userId;
    return Task.find(query).populate('assignedTo').sort('dueDate');
  }

  async findUpcoming(tenantId, userId = null, days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const query = {
      tenantId,
      dueDate: { $gte: new Date(), $lte: endDate },
      status: { $nin: ['completed', 'cancelled'] },
    };
    if (userId) query.assignedTo = userId;
    return Task.find(query).populate('assignedTo').sort('dueDate');
  }

  async markComplete(tenantId, taskId, userId) {
    return Task.findOneAndUpdate(
      { tenantId, _id: taskId },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          completedBy: userId,
        },
      },
      { new: true }
    );
  }

  async getTaskStats(tenantId, userId = null) {
    const match = { tenantId };
    if (userId) match.assignedTo = userId;

    return Task.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

module.exports = new TaskRepository();
