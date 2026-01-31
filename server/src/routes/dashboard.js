const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantContext');

const router = express.Router();

router.use(authMiddleware.protect.bind(authMiddleware));
router.use(tenantMiddleware.setTenantContext.bind(tenantMiddleware));

router.get('/overview', dashboardController.getOverview.bind(dashboardController));
router.get('/sales-metrics', dashboardController.getSalesMetrics.bind(dashboardController));
router.get('/lead-metrics', dashboardController.getLeadMetrics.bind(dashboardController));
router.get('/user-performance', dashboardController.getUserPerformance.bind(dashboardController));
router.get('/recent-activities', dashboardController.getRecentActivities.bind(dashboardController));
router.get('/upcoming-tasks', dashboardController.getUpcomingTasks.bind(dashboardController));

module.exports = router;
