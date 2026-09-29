const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  recordLocationPing,
  getLocationHistory,
  getLastKnownLocation,
  getLocationTrail,
  getActiveTouristLocations,
} = require('../controllers/locationController');

// Tourist location routes
router.post('/ping', protect, recordLocationPing);
router.get('/history', protect, getLocationHistory);
router.get('/last', protect, getLastKnownLocation);
router.get('/trail', protect, getLocationTrail);

// Admin routes
router.get('/admin/active', protect, adminOnly, getActiveTouristLocations);

module.exports = router;
