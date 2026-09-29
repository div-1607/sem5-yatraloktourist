const express = require('express');
const router = express.Router();
const safetyMonitorController = require('../controllers/safetyMonitorController');
const { protect, admin } = require('../../../backend/src/middleware/authMiddleware');

router.post('/score', safetyMonitorController.getSafetyScore);
router.get('/heatmap', safetyMonitorController.getHeatmap);
router.get('/high-risk-zones', safetyMonitorController.getHighRiskZones);

// Admin route
router.post('/admin/high-risk-zone', protect, admin, safetyMonitorController.createHighRiskZone);

module.exports = router;
