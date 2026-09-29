const Trip = require('../models/Trip');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Create a new trip
 * @route   POST /api/trips
 * @access  Private
 */
const createTrip = async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      user: req.user._id,
    };

    const trip = await Trip.create(tripData);

    await AuditLog.log({
      user: req.user._id,
      action: 'trip_created',
      category: 'trip',
      description: `Created trip: ${trip.title}`,
      resourceType: 'Trip',
      resourceId: trip._id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create trip', error: error.message });
  }
};

/**
 * @desc    Get all trips for authenticated user
 * @route   GET /api/trips
 * @access  Private
 */
const getUserTrips = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('waypoints.destination', 'title slug city images');

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      data: trips,
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
 * @desc    Get single trip by ID
 * @route   GET /api/trips/:id
 * @access  Private
 */
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id })
      .populate('waypoints.destination', 'title slug city state images location rating');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update trip details
 * @route   PUT /api/trips/:id
 * @access  Private
 */
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const allowedFields = [
      'title', 'description', 'startDate', 'endDate', 'status',
      'tripType', 'waypoints', 'companions', 'budget', 'tags',
      'currentLocation', 'totalDistanceKm', 'rating', 'feedback',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        trip[field] = req.body[field];
      }
    }

    await trip.save();

    await AuditLog.log({
      user: req.user._id,
      action: 'trip_updated',
      category: 'trip',
      description: `Updated trip: ${trip.title}`,
      resourceType: 'Trip',
      resourceId: trip._id,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete trip
 * @route   DELETE /api/trips/:id
 * @access  Private
 */
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    await AuditLog.log({
      user: req.user._id,
      action: 'trip_deleted',
      category: 'trip',
      description: `Deleted trip: ${trip.title}`,
      resourceType: 'Trip',
      resourceId: trip._id,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update trip status (start, pause, resume, complete, cancel)
 * @route   PATCH /api/trips/:id/status
 * @access  Private
 */
const updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['planning', 'active', 'paused', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip.status = status;
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update waypoint status in a trip
 * @route   PATCH /api/trips/:id/waypoints/:waypointId
 * @access  Private
 */
const updateWaypointStatus = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const waypoint = trip.waypoints.id(req.params.waypointId);

    if (!waypoint) {
      return res.status(404).json({ success: false, message: 'Waypoint not found' });
    }

    if (req.body.status) waypoint.status = req.body.status;
    if (req.body.arrivalTime) waypoint.arrivalTime = req.body.arrivalTime;
    if (req.body.departureTime) waypoint.departureTime = req.body.departureTime;
    if (req.body.notes !== undefined) waypoint.notes = req.body.notes;

    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all trips (Admin)
 * @route   GET /api/trips/admin/all
 * @access  Admin
 */
const getAllTripsAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email digitalId');

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      data: trips,
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

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  updateWaypointStatus,
  getAllTripsAdmin,
};
