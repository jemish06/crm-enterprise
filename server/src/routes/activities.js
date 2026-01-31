const express = require('express');
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const validate = require('../middleware/validate');
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

const createValidator = [
  body('type').isIn(['email', 'call', 'meeting', 'note', 'task_created', 'task_completed', 'lead_created', 'lead_converted', 'contact_created', 'deal_created', 'deal_won', 'deal_lost', 'stage_change', 'status_change', 'other'])
    .withMessage('Invalid activity type'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('relatedTo.type').optional().isIn(['Lead', 'Contact', 'Deal', 'Account', 'Task']).withMessage('Invalid related type'),
  body('relatedTo.id').optional().custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid related ID'),
];

const idValidator = [
  param('id').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid ID'),
];

// Routes
router.get('/statistics', activityController.getStatistics.bind(activityController));
router.get('/my-activities', activityController.getMyActivities.bind(activityController));
router.get('/related/:type/:id', activityController.getActivitiesByRelated.bind(activityController));
router.post('/', createValidator, validate, activityController.logActivity.bind(activityController));
router.get('/', activityController.getAllActivities.bind(activityController));
router.get('/:id', idValidator, validate, activityController.getActivityById.bind(activityController));
router.delete('/:id', idValidator, validate, activityController.deleteActivity.bind(activityController));

module.exports = router;
