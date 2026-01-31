const express = require('express');
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const validate = require('../middleware/validate');
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

const createValidator = [
  body('name').trim().notEmpty().withMessage('Account name is required'),
];

const idValidator = [
  param('id').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid ID'),
];

// Routes
router.get('/statistics', accountController.getStatistics.bind(accountController));
router.post('/', createValidator, validate, accountController.createAccount.bind(accountController));
router.get('/', accountController.getAllAccounts.bind(accountController));
router.get('/:id', idValidator, validate, accountController.getAccountById.bind(accountController));
router.put('/:id', idValidator, validate, accountController.updateAccount.bind(accountController));
router.delete('/:id', idValidator, validate, accountController.deleteAccount.bind(accountController));
router.post('/:id/notes', idValidator, validate, accountController.addNote.bind(accountController));

module.exports = router;
