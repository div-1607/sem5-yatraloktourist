const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getOverviewAnalytics,
  getTouristActivity,
  getSafetyAnalytics,
  getDestinationAnalytics,
} = require('../controllers/analyticsController');

// All analytics routes are admin-only
router.get('/overview', protect, adminOnly, getOverviewAnalytics);
router.get('/tourist-activity', protect, adminOnly, getTouristActivity);
router.get('/safety', protect, adminOnly, getSafetyAnalytics);
router.get('/destinations', protect, adminOnly, getDestinationAnalytics);

module.exports = router;
