const geofenceService = require('../services/geofenceService');
const Geofence = require('../models/Geofence');
const GeofenceEvent = require('../models/GeofenceEvent');

/**
 * @desc    Process tourist GPS ping and return active zones & notifications
 * @route   POST /api/geofencing/ping
 * @access  Private (Tourist/Admin)
 */
exports.pingLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user ? req.user._id : req.body.userId;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const result = await geofenceService.processLocationPing(userId, latitude, longitude);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Discover nearby attractions within radius
 * @route   GET /api/geofencing/nearby
 * @access  Public / Private
 */
exports.getNearbyAttractions = async (req, res) => {
  try {
    const lat = req.query.lat || req.query.latitude;
    const lon = req.query.lon || req.query.lng || req.query.longitude;
    const radius = req.query.radius;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'lat and lon (or latitude and longitude) query params are required' });
    }

    const attractions = await geofenceService.findNearbyAttractions(
      parseFloat(lat),
      parseFloat(lon),
      radius ? parseInt(radius, 10) : 10000
    );

    return res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user's geofence events history (entries, exits, warnings)
 * @route   GET /api/geofencing/events/my
 * @access  Private
 */
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await GeofenceEvent.find({ userId })
      .populate('geofenceId', 'name category alertLevel center radiusMeters')
      .sort({ timestamp: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all active geofences for map rendering
 * @route   GET /api/geofencing/active
 * @access  Public / Private
 */
exports.getActiveGeofences = async (req, res) => {
  try {
    const geofences = await Geofence.find({ isActive: true });
    return res.status(200).json({
      success: true,
      count: geofences.length,
      data: geofences,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Get all geofences
 * @route   GET /api/geofencing/admin/list
 * @access  Private (Admin)
 */
exports.adminGetAllGeofences = async (req, res) => {
  try {
    const geofences = await geofenceService.getAllGeofences();
    return res.status(200).json({
      success: true,
      count: geofences.length,
      data: geofences,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Create new geofence
 * @route   POST /api/geofencing/admin/create
 * @access  Private (Admin)
 */
exports.adminCreateGeofence = async (req, res) => {
  try {
    const geofence = await geofenceService.createGeofence(req.body, req.user._id);
    return res.status(201).json({
      success: true,
      message: 'Geofence created successfully',
      data: geofence,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Update geofence
 * @route   PUT /api/geofencing/admin/:id
 * @access  Private (Admin)
 */
exports.adminUpdateGeofence = async (req, res) => {
  try {
    const updated = await geofenceService.updateGeofence(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Geofence updated',
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Delete geofence
 * @route   DELETE /api/geofencing/admin/:id
 * @access  Private (Admin)
 */
exports.adminDeleteGeofence = async (req, res) => {
  try {
    const deleted = await geofenceService.deleteGeofence(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Geofence deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
