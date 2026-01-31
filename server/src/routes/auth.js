const express = require('express');
const authController = require('../controllers/authController');
const authValidator = require('../validators/authValidator');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator'); // ADD THIS LINE

const router = express.Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  authValidator.register,
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  authValidator.login,
  validate,
  authController.login
);

router.post(
  '/accept-invitation',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
    validate,
  ],
  authController.acceptInvitation
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  authValidator.forgotPassword,
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  passwordResetLimiter,
  authValidator.resetPassword,
  validate,
  authController.resetPassword
);

router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(authMiddleware.protect.bind(authMiddleware));

router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

module.exports = router;
