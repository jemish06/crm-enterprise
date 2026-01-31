const workflowService = require('../services/workflowService');
const ApiResponse = require('../utils/response');

class WorkflowController {
  async getAllWorkflows(req, res, next) {
    try {
      const { isActive } = req.query;
      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const workflows = await workflowService.getAllWorkflows(req.tenantId, filters);
      return ApiResponse.success(res, workflows, 'Workflows retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getWorkflowById(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.tenantId, req.params.id);
      return ApiResponse.success(res, workflow, 'Workflow retrieved');
    } catch (error) {
      if (error.message === 'Workflow not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.tenantId, req.user.userId, req.body);
      return ApiResponse.success(res, workflow, 'Workflow created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.tenantId, req.params.id, req.body);
      return ApiResponse.success(res, workflow, 'Workflow updated successfully');
    } catch (error) {
      if (error.message === 'Workflow not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      await workflowService.deleteWorkflow(req.tenantId, req.params.id);
      return ApiResponse.success(res, null, 'Workflow deleted successfully');
    } catch (error) {
      if (error.message === 'Workflow not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async toggleWorkflow(req, res, next) {
    try {
      const { isActive } = req.body;
      const workflow = await workflowService.toggleWorkflow(req.tenantId, req.params.id, isActive);
      return ApiResponse.success(res, workflow, 'Workflow status updated');
    } catch (error) {
      if (error.message === 'Workflow not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }
}

module.exports = new WorkflowController();
