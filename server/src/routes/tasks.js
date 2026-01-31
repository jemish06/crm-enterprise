const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const validate = require('../middleware/validate');
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

const createValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('assignedTo').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid assignedTo ID'),
];

const idValidator = [
  param('id').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid ID'),
];

// Routes
router.get('/statistics', taskController.getStatistics.bind(taskController));
router.get('/my-tasks', taskController.getMyTasks.bind(taskController));
router.get('/overdue', taskController.getOverdueTasks.bind(taskController));
router.get('/upcoming', taskController.getUpcomingTasks.bind(taskController));
router.post('/', createValidator, validate, taskController.createTask.bind(taskController));
router.get('/', taskController.getAllTasks.bind(taskController));
router.get('/:id', idValidator, validate, taskController.getTaskById.bind(taskController));
router.put('/:id', idValidator, validate, taskController.updateTask.bind(taskController));
router.patch('/:id/complete', idValidator, validate, taskController.completeTask.bind(taskController));
router.delete('/:id', idValidator, validate, taskController.deleteTask.bind(taskController));

module.exports = router;
