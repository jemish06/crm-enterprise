const express = require('express');
const leadController = require('../controllers/leadController');
const leadValidator = require('../validators/leadValidator');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');
const roleMiddleware = require('../middleware/roleCheck');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

// Get lead statistics
router.get(
  '/statistics',
  leadController.getStatistics.bind(leadController)
);

// Bulk operations
router.post(
  '/bulk/assign',
  roleMiddleware.requireRole('admin', 'manager'),
  leadValidator.bulkAssign,
  validate,
  leadController.bulkAssign.bind(leadController)
);

// CRUD operations
router.post(
  '/',
  leadValidator.create,
  validate,
  leadController.createLead.bind(leadController)
);

router.get(
  '/',
  leadValidator.queryFilters,
  validate,
  leadController.getAllLeads.bind(leadController)
);

router.get(
  '/:id',
  leadValidator.idParam,
  validate,
  leadController.getLeadById.bind(leadController)
);

router.put(
  '/:id',
  leadValidator.idParam,
  leadValidator.update,
  validate,
  leadController.updateLead.bind(leadController)
);

router.delete(
  '/:id',
  roleMiddleware.requireRole('admin', 'manager'),
  leadValidator.idParam,
  validate,
  leadController.deleteLead.bind(leadController)
);

// Notes
router.post(
  '/:id/notes',
  leadValidator.addNote,
  validate,
  leadController.addNote.bind(leadController)
);

// Conversion
router.post(
  '/:id/convert',
  leadValidator.idParam,
  validate,
  leadController.convertLead.bind(leadController)
);

module.exports = router;
