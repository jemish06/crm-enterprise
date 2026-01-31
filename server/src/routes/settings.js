const express = require('express');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const roleMiddleware = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

const idValidator = [
  param('id').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid ID'),
];

// Company Settings (admin only)
router.get('/company', settingsController.getCompanySettings.bind(settingsController));
router.put('/company', roleMiddleware.requireRole('admin'), settingsController.updateCompanySettings.bind(settingsController));

// Custom Fields (admin/manager)
router.get('/custom-fields', settingsController.getCustomFields.bind(settingsController));
router.post('/custom-fields', roleMiddleware.requireRole('admin', 'manager'), settingsController.createCustomField.bind(settingsController));
router.put('/custom-fields/:id', roleMiddleware.requireRole('admin', 'manager'), idValidator, validate, settingsController.updateCustomField.bind(settingsController));
router.delete('/custom-fields/:id', roleMiddleware.requireRole('admin', 'manager'), idValidator, validate, settingsController.deleteCustomField.bind(settingsController));

// Email Templates
router.get('/email-templates', settingsController.getEmailTemplates.bind(settingsController));
router.get('/email-templates/:id', idValidator, validate, settingsController.getEmailTemplateById.bind(settingsController));
router.post('/email-templates', settingsController.createEmailTemplate.bind(settingsController));
router.put('/email-templates/:id', idValidator, validate, settingsController.updateEmailTemplate.bind(settingsController));
router.delete('/email-templates/:id', idValidator, validate, settingsController.deleteEmailTemplate.bind(settingsController));

// Pipeline Configuration (admin/manager)
router.put('/pipeline-stages', roleMiddleware.requireRole('admin', 'manager'), settingsController.updatePipelineStages.bind(settingsController));
router.put('/lead-sources', roleMiddleware.requireRole('admin', 'manager'), settingsController.updateLeadSources.bind(settingsController));

module.exports = router;
