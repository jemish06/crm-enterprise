const taskRepository = require('../repositories/taskRepository');
const logger = require('../utils/logger');

class TaskService {
  async createTask(tenantId, userId, taskData) {
    try {
      taskData.createdBy = userId;
      if (!taskData.assignedTo) {
        taskData.assignedTo = userId;
      }
      const task = await taskRepository.create(tenantId, taskData);
      logger.info(`Task created: ${task._id}`);
      return task;
    } catch (error) {
      logger.error('Create task error:', error);
      throw error;
    }
  }

  async getTaskById(tenantId, taskId) {
    const task = await taskRepository.findById(tenantId, taskId, ['assignedTo', 'createdBy']);
    if (!task) throw new Error('Task not found');
    return task;
  }

  async getAllTasks(tenantId, filters, options) {
    return taskRepository.findAll(tenantId, filters, options);
  }

  async getMyTasks(tenantId, userId, status = null) {
    return taskRepository.findByUser(tenantId, userId, status);
  }

  async getOverdueTasks(tenantId, userId = null) {
    return taskRepository.findOverdue(tenantId, userId);
  }

  async getUpcomingTasks(tenantId, userId = null, days = 7) {
    return taskRepository.findUpcoming(tenantId, userId, days);
  }

  async updateTask(tenantId, taskId, updateData) {
    const task = await taskRepository.findById(tenantId, taskId);
    if (!task) throw new Error('Task not found');
    return taskRepository.update(tenantId, taskId, updateData);
  }

  async completeTask(tenantId, userId, taskId) {
    const task = await taskRepository.findById(tenantId, taskId);
    if (!task) throw new Error('Task not found');

    const completedTask = await taskRepository.markComplete(tenantId, taskId, userId);
    logger.info(`Task completed: ${taskId} by user ${userId}`);
    return completedTask;
  }

  async deleteTask(tenantId, taskId) {
    const task = await taskRepository.delete(tenantId, taskId);
    if (!task) throw new Error('Task not found');
    logger.info(`Task deleted: ${taskId}`);
    return task;
  }

  async getTaskStatistics(tenantId, userId = null) {
    const stats = await taskRepository.getTaskStats(tenantId, userId);
    const overdue = await taskRepository.findOverdue(tenantId, userId);
    const upcoming = await taskRepository.findUpcoming(tenantId, userId, 7);

    return {
      byStatus: stats,
      overdueCount: overdue.length,
      upcomingCount: upcoming.length,
    };
  }
}

module.exports = new TaskService();
