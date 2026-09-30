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
  emailTripItinerary,
} = require('../controllers/tripController');

// Tourist trip routes
router.post('/', protect, createTrip);
router.get('/', protect, getUserTrips);
router.post('/:tripId/email', protect, emailTripItinerary);
router.get('/admin/all', protect, adminOnly, getAllTripsAdmin);
router.get('/:id', protect, getTripById);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);
router.patch('/:id/status', protect, updateTripStatus);
router.patch('/:id/waypoints/:waypointId', protect, updateWaypointStatus);

module.exports = router;
