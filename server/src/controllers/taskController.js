const taskService = require('../services/taskService');
const ApiResponse = require('../utils/response');

class TaskController {
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.tenantId, req.user.userId, req.body);
      return ApiResponse.success(res, task, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.tenantId, req.params.id);
      return ApiResponse.success(res, task, 'Task retrieved successfully');
    } catch (error) {
      if (error.message === 'Task not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async getAllTasks(req, res, next) {
    try {
      const { page, limit, sort, search, status, priority, assignedTo, type } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (assignedTo) filters.assignedTo = assignedTo;
      if (type) filters.type = type;

      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 50, sort, search };
      const result = await taskService.getAllTasks(req.tenantId, filters, options);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req, res, next) {
    try {
      const { status } = req.query;
      const tasks = await taskService.getMyTasks(req.tenantId, req.user.userId, status);
      return ApiResponse.success(res, tasks, 'My tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getOverdueTasks(req, res, next) {
    try {
      const tasks = await taskService.getOverdueTasks(req.tenantId, req.user.userId);
      return ApiResponse.success(res, tasks, 'Overdue tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingTasks(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const tasks = await taskService.getUpcomingTasks(req.tenantId, req.user.userId, parseInt(days));
      return ApiResponse.success(res, tasks, 'Upcoming tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.tenantId, req.params.id, req.body);
      return ApiResponse.success(res, task, 'Task updated successfully');
    } catch (error) {
      if (error.message === 'Task not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async completeTask(req, res, next) {
    try {
      const task = await taskService.completeTask(req.tenantId, req.user.userId, req.params.id);
      return ApiResponse.success(res, task, 'Task completed successfully');
    } catch (error) {
      if (error.message === 'Task not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.tenantId, req.params.id);
      return ApiResponse.success(res, null, 'Task deleted successfully');
    } catch (error) {
      if (error.message === 'Task not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const stats = await taskService.getTaskStatistics(req.tenantId, req.user.userId);
      return ApiResponse.success(res, stats, 'Task statistics retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
