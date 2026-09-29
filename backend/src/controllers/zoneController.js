const Zone = require('../models/Zone');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Create a new zone
 * @route   POST /api/zones
 * @access  Admin
 */
const createZone = async (req, res) => {
  try {
    const {
      name, description, type, category, center, radius,
      alertLevel, alertMessage, maxCapacity, operatingHours,
      contactInfo, linkedDestinations, metadata,
    } = req.body;

    if (!center || !center.coordinates || center.coordinates.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'center.coordinates [longitude, latitude] is required',
      });
    }

    const zone = await Zone.create({
      name,
      description,
      type,
      category,
      center: {
        type: 'Point',
        coordinates: center.coordinates,
      },
      radius,
      alertLevel,
      alertMessage,
      maxCapacity,
      operatingHours,
      contactInfo,
      linkedDestinations,
      metadata,
      createdBy: req.user._id,
    });

    await AuditLog.log({
      user: req.user._id,
      action: 'zone_created',
      category: 'zone',
      description: `Created zone: ${zone.name} (${zone.type})`,
      resourceType: 'Zone',
      resourceId: zone._id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create zone', error: error.message });
  }
};

/**
 * @desc    Get all zones with optional filters
 * @route   GET /api/zones
 * @access  Public
 */
const getAllZones = async (req, res) => {
  try {
    const { type, category, isActive, page = 1, limit = 50 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const zones = await Zone.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('linkedDestinations', 'title slug city')
      .populate('createdBy', 'name email');

    const total = await Zone.countDocuments(query);

    res.status(200).json({
      success: true,
      data: zones,
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
 * @desc    Get zone by ID
 * @route   GET /api/zones/:id
 * @access  Public
 */
const getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id)
      .populate('linkedDestinations', 'title slug city images rating')
      .populate('createdBy', 'name email');

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    res.status(200).json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update zone
 * @route   PUT /api/zones/:id
 * @access  Admin
 */
const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    const allowedFields = [
      'name', 'description', 'type', 'category', 'radius',
      'alertLevel', 'alertMessage', 'isActive', 'maxCapacity',
      'currentOccupancy', 'operatingHours', 'contactInfo',
      'linkedDestinations', 'metadata',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        zone[field] = req.body[field];
      }
    }

    // Handle center coordinate update
    if (req.body.center && req.body.center.coordinates) {
      zone.center = {
        type: 'Point',
        coordinates: req.body.center.coordinates,
      };
    }

    await zone.save();

    await AuditLog.log({
      user: req.user._id,
      action: 'zone_updated',
      category: 'zone',
      description: `Updated zone: ${zone.name}`,
      resourceType: 'Zone',
      resourceId: zone._id,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete zone
 * @route   DELETE /api/zones/:id
 * @access  Admin
 */
const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    await AuditLog.log({
      user: req.user._id,
      action: 'zone_deleted',
      category: 'zone',
      description: `Deleted zone: ${zone.name}`,
      resourceType: 'Zone',
      resourceId: zone._id,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Find nearby zones
 * @route   GET /api/zones/nearby?lat=&lng=&radius=
 * @access  Public
 */
const getNearbyZones = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng query params are required' });
    }

    const zones = await Zone.findNearby(parseFloat(lng), parseFloat(lat), parseInt(radius));

    res.status(200).json({
      success: true,
      count: zones.length,
      data: zones,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Toggle zone active status
 * @route   PATCH /api/zones/:id/toggle
 * @access  Admin
 */
const toggleZoneStatus = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    zone.isActive = !zone.isActive;
    await zone.save();

    res.status(200).json({
      success: true,
      message: `Zone ${zone.isActive ? 'activated' : 'deactivated'}`,
      data: zone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
  getNearbyZones,
  toggleZoneStatus,
};
