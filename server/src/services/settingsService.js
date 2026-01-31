const Company = require('../models/Company');
const CustomField = require('../models/CustomField');
const EmailTemplate = require('../models/EmailTemplate');
const logger = require('../utils/logger');

class SettingsService {
  // Company Settings
  async getCompanySettings(tenantId) {
    try {
      const company = await Company.findById(tenantId);
      if (!company) throw new Error('Company not found');
      return company.settings;
    } catch (error) {
      logger.error('Get company settings error:', error);
      throw error;
    }
  }

  async updateCompanySettings(tenantId, settingsData) {
    try {
      const company = await Company.findByIdAndUpdate(
        tenantId,
        { $set: { settings: settingsData } },
        { new: true, runValidators: true }
      );
      if (!company) throw new Error('Company not found');
      logger.info(`Company settings updated: ${tenantId}`);
      return company.settings;
    } catch (error) {
      logger.error('Update company settings error:', error);
      throw error;
    }
  }

  // Custom Fields
  async getCustomFields(tenantId, module = null) {
    try {
      const query = { tenantId, isActive: true };
      if (module) query.module = module;

      return CustomField.find(query).sort('order');
    } catch (error) {
      logger.error('Get custom fields error:', error);
      throw error;
    }
  }

  async createCustomField(tenantId, userId, fieldData) {
    try {
      const field = await CustomField.create({
        tenantId,
        createdBy: userId,
        ...fieldData,
      });
      logger.info(`Custom field created: ${field.fieldName} for ${field.module}`);
      return field;
    } catch (error) {
      logger.error('Create custom field error:', error);
      throw error;
    }
  }

  async updateCustomField(tenantId, fieldId, updateData) {
    try {
      const field = await CustomField.findOneAndUpdate(
        { tenantId, _id: fieldId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!field) throw new Error('Custom field not found');
      return field;
    } catch (error) {
      logger.error('Update custom field error:', error);
      throw error;
    }
  }

  async deleteCustomField(tenantId, fieldId) {
    try {
      const field = await CustomField.findOneAndUpdate(
        { tenantId, _id: fieldId },
        { $set: { isActive: false } },
        { new: true }
      );
      if (!field) throw new Error('Custom field not found');
      logger.info(`Custom field deleted: ${fieldId}`);
      return field;
    } catch (error) {
      logger.error('Delete custom field error:', error);
      throw error;
    }
  }

  // Email Templates
  async getEmailTemplates(tenantId, category = null) {
    try {
      const query = { tenantId, isActive: true };
      if (category) query.category = category;

      return EmailTemplate.find(query).sort('-createdAt');
    } catch (error) {
      logger.error('Get email templates error:', error);
      throw error;
    }
  }

  async getEmailTemplateById(tenantId, templateId) {
    try {
      const template = await EmailTemplate.findOne({ tenantId, _id: templateId });
      if (!template) throw new Error('Email template not found');
      return template;
    } catch (error) {
      logger.error('Get email template error:', error);
      throw error;
    }
  }

  async createEmailTemplate(tenantId, userId, templateData) {
    try {
      const template = await EmailTemplate.create({
        tenantId,
        createdBy: userId,
        ...templateData,
      });
      logger.info(`Email template created: ${template.name}`);
      return template;
    } catch (error) {
      logger.error('Create email template error:', error);
      throw error;
    }
  }

  async updateEmailTemplate(tenantId, templateId, updateData) {
    try {
      const template = await EmailTemplate.findOneAndUpdate(
        { tenantId, _id: templateId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!template) throw new Error('Email template not found');
      return template;
    } catch (error) {
      logger.error('Update email template error:', error);
      throw error;
    }
  }

  async deleteEmailTemplate(tenantId, templateId) {
    try {
      const template = await EmailTemplate.findOneAndUpdate(
        { tenantId, _id: templateId },
        { $set: { isActive: false } },
        { new: true }
      );
      if (!template) throw new Error('Email template not found');
      logger.info(`Email template deleted: ${templateId}`);
      return template;
    } catch (error) {
      logger.error('Delete email template error:', error);
      throw error;
    }
  }

  // Pipeline Configuration
  async updatePipelineStages(tenantId, module, stages) {
    try {
      const company = await Company.findById(tenantId);
      if (!company) throw new Error('Company not found');

      if (module === 'lead') {
        company.settings.leadStages = stages;
      } else if (module === 'deal') {
        company.settings.dealStages = stages;
      }

      await company.save();
      logger.info(`Pipeline stages updated for ${module}`);
      return company.settings;
    } catch (error) {
      logger.error('Update pipeline stages error:', error);
      throw error;
    }
  }

  async updateLeadSources(tenantId, sources) {
    try {
      const company = await Company.findByIdAndUpdate(
        tenantId,
        { $set: { 'settings.leadSources': sources } },
        { new: true }
      );
      if (!company) throw new Error('Company not found');
      return company.settings.leadSources;
    } catch (error) {
      logger.error('Update lead sources error:', error);
      throw error;
    }
  }
}

module.exports = new SettingsService();
