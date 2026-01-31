const settingsService = require('../services/settingsService');
const ApiResponse = require('../utils/response');

class SettingsController {
  // Company Settings
  async getCompanySettings(req, res, next) {
    try {
      const settings = await settingsService.getCompanySettings(req.tenantId);
      return ApiResponse.success(res, settings, 'Settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCompanySettings(req, res, next) {
    try {
      const settings = await settingsService.updateCompanySettings(req.tenantId, req.body);
      return ApiResponse.success(res, settings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Custom Fields
  async getCustomFields(req, res, next) {
    try {
      const { module } = req.query;
      const fields = await settingsService.getCustomFields(req.tenantId, module);
      return ApiResponse.success(res, fields, 'Custom fields retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createCustomField(req, res, next) {
    try {
      const field = await settingsService.createCustomField(req.tenantId, req.user.userId, req.body);
      return ApiResponse.success(res, field, 'Custom field created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCustomField(req, res, next) {
    try {
      const field = await settingsService.updateCustomField(req.tenantId, req.params.id, req.body);
      return ApiResponse.success(res, field, 'Custom field updated successfully');
    } catch (error) {
      if (error.message === 'Custom field not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async deleteCustomField(req, res, next) {
    try {
      await settingsService.deleteCustomField(req.tenantId, req.params.id);
      return ApiResponse.success(res, null, 'Custom field deleted successfully');
    } catch (error) {
      if (error.message === 'Custom field not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  // Email Templates
  async getEmailTemplates(req, res, next) {
    try {
      const { category } = req.query;
      const templates = await settingsService.getEmailTemplates(req.tenantId, category);
      return ApiResponse.success(res, templates, 'Email templates retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getEmailTemplateById(req, res, next) {
    try {
      const template = await settingsService.getEmailTemplateById(req.tenantId, req.params.id);
      return ApiResponse.success(res, template, 'Email template retrieved');
    } catch (error) {
      if (error.message === 'Email template not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async createEmailTemplate(req, res, next) {
    try {
      const template = await settingsService.createEmailTemplate(req.tenantId, req.user.userId, req.body);
      return ApiResponse.success(res, template, 'Email template created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateEmailTemplate(req, res, next) {
    try {
      const template = await settingsService.updateEmailTemplate(req.tenantId, req.params.id, req.body);
      return ApiResponse.success(res, template, 'Email template updated successfully');
    } catch (error) {
      if (error.message === 'Email template not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async deleteEmailTemplate(req, res, next) {
    try {
      await settingsService.deleteEmailTemplate(req.tenantId, req.params.id);
      return ApiResponse.success(res, null, 'Email template deleted successfully');
    } catch (error) {
      if (error.message === 'Email template not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  // Pipeline Configuration
  async updatePipelineStages(req, res, next) {
    try {
      const { module, stages } = req.body;
      const settings = await settingsService.updatePipelineStages(req.tenantId, module, stages);
      return ApiResponse.success(res, settings, 'Pipeline stages updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateLeadSources(req, res, next) {
    try {
      const { sources } = req.body;
      const leadSources = await settingsService.updateLeadSources(req.tenantId, sources);
      return ApiResponse.success(res, leadSources, 'Lead sources updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingsController();
