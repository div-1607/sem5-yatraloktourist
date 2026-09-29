const Location = require('../models/Location');
const Zone = require('../models/Zone');
const AuditLog = require('../models/AuditLog');

/**
 * Calculate Haversine distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * @desc    Record real-time location ping
 * @route   POST /api/locations/ping
 * @access  Private
 */
const recordLocationPing = async (req, res) => {
  try {
    const { latitude, longitude, altitude, accuracy, speed, heading, batteryLevel, source } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    // Check if inside any zone
    let nearestZone = null;
    let isInsideGeofence = false;
    let geofenceId = null;

    try {
      const nearbyZones = await Zone.find({
        isActive: true,
        center: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: 10000, // 10km radius search
          },
        },
      }).limit(10);

      for (const zone of nearbyZones) {
        const dist = haversineDistance(
          latitude,
          longitude,
          zone.center.coordinates[1],
          zone.center.coordinates[0]
        );
        if (dist <= zone.radius) {
          isInsideGeofence = true;
          geofenceId = zone._id;
          nearestZone = zone._id;
          break;
        }
      }

      if (!nearestZone && nearbyZones.length > 0) {
        nearestZone = nearbyZones[0]._id;
      }
    } catch (geoErr) {
      // Continue even if geospatial query fails
    }

    const locationEntry = await Location.create({
      user: req.user._id,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      latitude,
      longitude,
      altitude: altitude || null,
      accuracy: accuracy || null,
      speed: speed || 0,
      heading: heading || null,
      batteryLevel: batteryLevel || null,
      source: source || 'gps',
      nearestZone,
      isInsideGeofence,
      geofenceId,
    });

    res.status(201).json({
      success: true,
      data: {
        id: locationEntry._id,
        isInsideGeofence,
        geofenceId,
        nearestZone,
        timestamp: locationEntry.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record location', error: error.message });
  }
};

/**
 * @desc    Get user's location history
 * @route   GET /api/locations/history
 * @access  Private
 */
const getLocationHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const locations = await Location.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('latitude longitude speed accuracy createdAt isInsideGeofence');

    const total = await Location.countDocuments(query);

    res.status(200).json({
      success: true,
      data: locations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get last known location
 * @route   GET /api/locations/last
 * @access  Private
 */
const getLastKnownLocation = async (req, res) => {
  try {
    const location = await Location.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('nearestZone', 'name type alertLevel')
      .populate('nearestDestination', 'title city');

    if (!location) {
      return res.status(404).json({ success: false, message: 'No location data found' });
    }

    res.status(200).json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get location trail (path) for mapping
 * @route   GET /api/locations/trail
 * @access  Private
 */
const getLocationTrail = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);

    const locations = await Location.find({
      user: req.user._id,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: 1 })
      .select('latitude longitude speed createdAt');

    // Calculate total distance
    let totalDistanceM = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistanceM += haversineDistance(
        locations[i - 1].latitude,
        locations[i - 1].longitude,
        locations[i].latitude,
        locations[i].longitude
      );
    }

    res.status(200).json({
      success: true,
      data: {
        trail: locations,
        totalPoints: locations.length,
        totalDistanceKm: (totalDistanceM / 1000).toFixed(2),
        periodHours: parseInt(hours),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all active tourist locations (Admin)
 * @route   GET /api/locations/admin/active
 * @access  Admin
 */
const getActiveTouristLocations = async (req, res) => {
  try {
    const { minutes = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(minutes) * 60 * 1000);

    // Get most recent location per user
    const activeLocations = await Location.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$user',
          lastLocation: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          'userInfo.name': 1,
          'userInfo.digitalId': 1,
          'userInfo.mobile': 1,
          'lastLocation.latitude': 1,
          'lastLocation.longitude': 1,
          'lastLocation.speed': 1,
          'lastLocation.isInsideGeofence': 1,
          'lastLocation.createdAt': 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: activeLocations.length,
      data: activeLocations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  recordLocationPing,
  getLocationHistory,
  getLastKnownLocation,
  getLocationTrail,
  getActiveTouristLocations,
};
