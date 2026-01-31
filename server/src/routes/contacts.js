const express = require('express');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const validate = require('../middleware/validate');
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

// Validation
const createValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
];

const idValidator = [
  param('id').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid ID'),
];

// Routes
router.post('/', createValidator, validate, contactController.createContact.bind(contactController));
router.get('/', contactController.getAllContacts.bind(contactController));
router.get('/:id', idValidator, validate, contactController.getContactById.bind(contactController));
router.put('/:id', idValidator, validate, contactController.updateContact.bind(contactController));
router.delete('/:id', idValidator, validate, contactController.deleteContact.bind(contactController));
router.post('/:id/notes', idValidator, validate, contactController.addNote.bind(contactController));

module.exports = router;
