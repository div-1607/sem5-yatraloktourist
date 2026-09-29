const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { protect, admin } = require('../../../backend/src/middleware/authMiddleware');

// Tourist tracking routes
router.post('/record', protect, trackingController.recordLocation);
router.get('/history', protect, trackingController.getLocationHistory);
router.get('/trail', protect, trackingController.getTrail);

// Admin live fleet view
router.get('/admin/active', protect, admin, trackingController.adminGetActiveTourists);

module.exports = router;
