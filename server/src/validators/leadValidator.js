const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const leadValidator = {
  create: [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),

    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),

    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),

    body('phone')
      .optional()
      .trim(),

    body('company')
      .optional()
      .trim(),

    body('title')
      .optional()
      .trim(),

    body('source')
      .optional()
      .isIn(['website', 'referral', 'social-media', 'cold-call', 'email-campaign', 'event', 'other'])
      .withMessage('Invalid lead source'),

    body('status')
      .optional()
      .isIn(['new', 'contacted', 'qualified', 'lost', 'converted'])
      .withMessage('Invalid status'),

    body('stage')
      .optional()
      .isIn(['awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase'])
      .withMessage('Invalid stage'),

    body('value')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Value must be a positive number'),

    body('assignedTo')
      .optional()
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid assignedTo ID'),
  ],

  update: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),

    body('lastName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),

    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),

    body('status')
      .optional()
      .isIn(['new', 'contacted', 'qualified', 'lost', 'converted'])
      .withMessage('Invalid status'),

    body('stage')
      .optional()
      .isIn(['awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase'])
      .withMessage('Invalid stage'),

    body('value')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Value must be a positive number'),
  ],

  idParam: [
    param('id')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid lead ID'),
  ],

  addNote: [
    param('id')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid lead ID'),

    body('content')
      .trim()
      .notEmpty()
      .withMessage('Note content is required')
      .isLength({ max: 5000 })
      .withMessage('Note content cannot exceed 5000 characters'),
  ],

  bulkAssign: [
    body('leadIds')
      .isArray({ min: 1 })
      .withMessage('leadIds must be a non-empty array'),

    body('leadIds.*')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid lead ID in array'),

    body('assignedTo')
      .notEmpty()
      .withMessage('assignedTo is required')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid assignedTo user ID'),
  ],

  queryFilters: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('status')
      .optional()
      .isIn(['new', 'contacted', 'qualified', 'lost', 'converted'])
      .withMessage('Invalid status filter'),

    query('source')
      .optional()
      .isIn(['website', 'referral', 'social-media', 'cold-call', 'email-campaign', 'event', 'other'])
      .withMessage('Invalid source filter'),
  ],
};

module.exports = leadValidator;
