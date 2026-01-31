const Workflow = require('../models/Workflow');
const logger = require('../utils/logger');

class WorkflowService {
  async getAllWorkflows(tenantId, filters = {}) {
    try {
      return Workflow.find({ tenantId, ...filters })
        .populate('createdBy')
        .sort('-createdAt');
    } catch (error) {
      logger.error('Get workflows error:', error);
      throw error;
    }
  }

  async getWorkflowById(tenantId, workflowId) {
    try {
      const workflow = await Workflow.findOne({ tenantId, _id: workflowId })
        .populate('createdBy');
      if (!workflow) throw new Error('Workflow not found');
      return workflow;
    } catch (error) {
      logger.error('Get workflow error:', error);
      throw error;
    }
  }

  async createWorkflow(tenantId, userId, workflowData) {
    try {
      const workflow = await Workflow.create({
        tenantId,
        createdBy: userId,
        ...workflowData,
      });
      logger.info(`Workflow created: ${workflow.name}`);
      return workflow;
    } catch (error) {
      logger.error('Create workflow error:', error);
      throw error;
    }
  }

  async updateWorkflow(tenantId, workflowId, updateData) {
    try {
      const workflow = await Workflow.findOneAndUpdate(
        { tenantId, _id: workflowId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!workflow) throw new Error('Workflow not found');
      logger.info(`Workflow updated: ${workflowId}`);
      return workflow;
    } catch (error) {
      logger.error('Update workflow error:', error);
      throw error;
    }
  }

  async deleteWorkflow(tenantId, workflowId) {
    try {
      const workflow = await Workflow.findOneAndDelete({ tenantId, _id: workflowId });
      if (!workflow) throw new Error('Workflow not found');
      logger.info(`Workflow deleted: ${workflowId}`);
      return workflow;
    } catch (error) {
      logger.error('Delete workflow error:', error);
      throw error;
    }
  }

  async toggleWorkflow(tenantId, workflowId, isActive) {
    try {
      const workflow = await Workflow.findOneAndUpdate(
        { tenantId, _id: workflowId },
        { $set: { isActive } },
        { new: true }
      );
      if (!workflow) throw new Error('Workflow not found');
      logger.info(`Workflow ${isActive ? 'activated' : 'deactivated'}: ${workflowId}`);
      return workflow;
    } catch (error) {
      logger.error('Toggle workflow error:', error);
      throw error;
    }
  }

  // Workflow execution logic
  async triggerWorkflows(tenantId, triggerType, data) {
    try {
      const workflows = await Workflow.find({
        tenantId,
        'trigger.type': triggerType,
        isActive: true,
      });

      for (const workflow of workflows) {
        const conditionsMet = this.evaluateConditions(workflow.trigger.conditions, data);
        if (conditionsMet) {
          await this.executeWorkflow(workflow, data);
        }
      }
    } catch (error) {
      logger.error('Trigger workflows error:', error);
    }
  }

  evaluateConditions(conditions, data) {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(data, condition.field);

      switch (condition.operator) {
        case 'equals':
          return fieldValue == condition.value;
        case 'not_equals':
          return fieldValue != condition.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        case 'is_empty':
          return !fieldValue || fieldValue === '';
        case 'is_not_empty':
          return fieldValue && fieldValue !== '';
        default:
          return false;
      }
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  async executeWorkflow(workflow, data) {
    try {
      // Sort actions by order
      const sortedActions = workflow.actions.sort((a, b) => a.order - b.order);

      for (const action of sortedActions) {
        // Apply delay if specified
        if (action.delay > 0) {
          await this.delay(action.delay * 60000); // Convert minutes to ms
        }

        // Execute action based on type
        await this.executeAction(workflow.tenantId, action, data);
      }

      // Update workflow execution count
      workflow.executionCount += 1;
      workflow.lastExecutedAt = new Date();
      await workflow.save();

      logger.info(`Workflow executed: ${workflow.name}`);
    } catch (error) {
      logger.error(`Workflow execution error: ${workflow.name}`, error);
    }
  }

  async executeAction(tenantId, action, data) {
    switch (action.type) {
      case 'send_email':
        // TODO: Implement email sending
        logger.info('Action: Send email', action.config);
        break;

      case 'assign_user':
        // TODO: Implement user assignment
        logger.info('Action: Assign user', action.config);
        break;

      case 'create_task':
        // TODO: Implement task creation
        logger.info('Action: Create task', action.config);
        break;

      case 'update_field':
        // TODO: Implement field update
        logger.info('Action: Update field', action.config);
        break;

      case 'send_notification':
        // TODO: Implement notification
        logger.info('Action: Send notification', action.config);
        break;

      default:
        logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new WorkflowService();
