const express = require('express');
const dealController = require('../controllers/dealController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const validate = require('../middleware/validate');
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

const createValidator = [
  body('name').trim().notEmpty().withMessage('Deal name is required'),
  body('value').isFloat({ min: 0 }).withMessage('Valid deal value is required'),
  body('assignedTo').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid assignedTo ID'),
];

const idValidator = [
  param('id').custom(v => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid ID'),
];

const stageValidator = [
  body('stage').isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'])
    .withMessage('Invalid stage'),
];

// Routes
router.get('/pipeline/stats', dealController.getPipelineStats.bind(dealController));
router.get('/stage/:stage', dealController.getDealsByStage.bind(dealController));
router.post('/', createValidator, validate, dealController.createDeal.bind(dealController));
router.get('/', dealController.getAllDeals.bind(dealController));
router.get('/:id', idValidator, validate, dealController.getDealById.bind(dealController));
router.put('/:id', idValidator, validate, dealController.updateDeal.bind(dealController));
router.patch('/:id/stage', idValidator, stageValidator, validate, dealController.updateDealStage.bind(dealController));
router.delete('/:id', idValidator, validate, dealController.deleteDeal.bind(dealController));
router.post('/:id/notes', idValidator, validate, dealController.addNote.bind(dealController));
router.post('/:id/products', idValidator, validate, dealController.addProduct.bind(dealController));

module.exports = router;
