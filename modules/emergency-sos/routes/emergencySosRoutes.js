const express = require('express');
const router = express.Router();
const emergencySosController = require('../controllers/emergencySosController');
const { protect, admin } = require('../../../backend/src/middleware/authMiddleware');

// Tourist route to trigger SOS
router.post('/trigger', protect, emergencySosController.triggerAlert);

// Admin emergency management routes
router.get('/active', protect, admin, emergencySosController.getActiveAlerts);
router.get('/all', protect, admin, emergencySosController.getAllAlerts);
router.patch('/:id/status', protect, admin, emergencySosController.updateStatus);

module.exports = router;
