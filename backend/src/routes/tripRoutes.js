const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  updateWaypointStatus,
  getAllTripsAdmin,
} = require('../controllers/tripController');

// Tourist trip routes
router.post('/', protect, createTrip);
router.get('/', protect, getUserTrips);
router.get('/:id', protect, getTripById);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);
router.patch('/:id/status', protect, updateTripStatus);
router.patch('/:id/waypoints/:waypointId', protect, updateWaypointStatus);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllTripsAdmin);

module.exports = router;
