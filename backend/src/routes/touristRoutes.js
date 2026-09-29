const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getTouristProfile,
  updateTouristProfile,
  getDigitalId,
  toggleFavorite,
  getTravelHistory,
  getNearbyTourists,
} = require('../controllers/touristController');

// Tourist profile routes
router.get('/profile', protect, getTouristProfile);
router.put('/profile', protect, updateTouristProfile);
router.get('/digital-id', protect, getDigitalId);
router.post('/favorites/:destinationId', protect, toggleFavorite);
router.get('/travel-history', protect, getTravelHistory);

// Admin: nearby tourists
router.get('/nearby', protect, adminOnly, getNearbyTourists);

module.exports = router;
