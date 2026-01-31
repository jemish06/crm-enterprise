const express = require('express');
const workflowController = require('../controllers/workflowController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const roleMiddleware = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));
router.use(roleMiddleware.requireRole('admin', 'manager'));

const idValidator = [
  param('id').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid ID'),
];

const createValidator = [
  body('name').trim().notEmpty().withMessage('Workflow name is required'),
  body('trigger.type').notEmpty().withMessage('Trigger type is required'),
  body('actions').isArray({ min: 1 }).withMessage('At least one action is required'),
];

router.get('/', workflowController.getAllWorkflows.bind(workflowController));
router.get('/:id', idValidator, validate, workflowController.getWorkflowById.bind(workflowController));
router.post('/', createValidator, validate, workflowController.createWorkflow.bind(workflowController));
router.put('/:id', idValidator, validate, workflowController.updateWorkflow.bind(workflowController));
router.patch('/:id/toggle', idValidator, validate, workflowController.toggleWorkflow.bind(workflowController));
router.delete('/:id', idValidator, validate, workflowController.deleteWorkflow.bind(workflowController));

module.exports = router;
