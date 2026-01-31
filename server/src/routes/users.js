const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const roleMiddleware = require('../middleware/roleCheck');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const mongoose = require('mongoose');

// Apply authentication and tenant context to all routes
router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

// Validation rules
const inviteValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['user', 'manager', 'admin']).withMessage('Invalid role'),
];

const updateValidator = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('role').optional().isIn(['user', 'manager', 'admin']).withMessage('Invalid role'),
];

const idValidator = [
  param('id').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid user ID'),
];

// Routes
router.get('/me', userController.getMyProfile.bind(userController));

router.post(
  '/invite',
  roleMiddleware.requireRole('admin', 'manager'),
  inviteValidator,
  validate,
  userController.inviteUser.bind(userController)
);

router.get(
  '/',
  userController.getAllUsers.bind(userController)
);

router.get(
  '/:id',
  idValidator,
  validate,
  userController.getUserById.bind(userController)
);

router.patch(
  '/:id',
  roleMiddleware.requireRole('admin', 'manager'),
  idValidator,
  updateValidator,
  validate,
  userController.updateUser.bind(userController)
);

router.patch(
  '/:id/toggle-status',
  roleMiddleware.requireRole('admin'),
  idValidator,
  validate,
  userController.toggleUserStatus.bind(userController)
);

router.delete(
  '/:id',
  roleMiddleware.requireRole('admin'),
  idValidator,
  validate,
  userController.deleteUser.bind(userController)
);

module.exports = router;
