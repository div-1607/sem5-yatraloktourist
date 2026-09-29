const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/geofenceController');
const { protect, admin } = require('../../../backend/src/middleware/authMiddleware');

// Public / Tourist routes
router.get('/active', geofenceController.getActiveGeofences);
router.get('/nearby', geofenceController.getNearbyAttractions);

// Authenticated Tourist routes
router.post('/ping', protect, geofenceController.pingLocation);
router.get('/events/my', protect, geofenceController.getMyEvents);

// Admin Geofence Management routes
router.get('/admin/list', protect, admin, geofenceController.adminGetAllGeofences);
router.post('/admin/create', protect, admin, geofenceController.adminCreateGeofence);
router.put('/admin/:id', protect, admin, geofenceController.adminUpdateGeofence);
router.delete('/admin/:id', protect, admin, geofenceController.adminDeleteGeofence);

module.exports = router;
