const User = require('../models/User');
const Trip = require('../models/Trip');
const Location = require('../models/Location');
const Destination = require('../models/Destination');
const SOSRequest = require('../models/SOSRequest');
const Incident = require('../models/Incident');
const Zone = require('../models/Zone');

/**
 * @desc    Get platform overview analytics
 * @route   GET /api/analytics/overview
 * @access  Admin
 */
const getOverviewAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalDestinations,
      totalTrips,
      activeTrips,
      totalSOS,
      pendingSOS,
      totalIncidents,
      totalZones,
    ] = await Promise.all([
      User.countDocuments({ role: 'tourist' }),
      User.countDocuments({ role: 'tourist', isOnline: true }),
      Destination.countDocuments(),
      Trip.countDocuments(),
      Trip.countDocuments({ status: 'active' }),
      SOSRequest.countDocuments(),
      SOSRequest.countDocuments({ status: 'pending' }),
      Incident.countDocuments(),
      Zone.countDocuments({ isActive: true }),
    ]);

    // User registration trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // SOS by type
    const sosByType = await SOSRequest.aggregate([
      {
        $group: {
          _id: '$emergencyType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top destinations by reviews
    const topDestinations = await Destination.find()
      .sort({ numReviews: -1, rating: -1 })
      .limit(10)
      .select('title city state rating numReviews crowdStatus');

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          activeUsers,
          totalDestinations,
          totalTrips,
          activeTrips,
          totalSOS,
          pendingSOS,
          totalIncidents,
          totalZones,
        },
        registrationTrend,
        sosByType,
        topDestinations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get tourist activity analytics
 * @route   GET /api/analytics/tourist-activity
 * @access  Admin
 */
const getTouristActivity = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // Location pings per day
    const locationActivity = await Location.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          pings: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
        },
      },
      {
        $project: {
          _id: 1,
          pings: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Trip creation trend
    const tripActivity = await Trip.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          tripsCreated: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Most active tourists
    const activeUsers = await Location.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$user',
          pingCount: { $sum: 1 },
          lastPing: { $max: '$createdAt' },
        },
      },
      { $sort: { pingCount: -1 } },
      { $limit: 20 },
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
          pingCount: 1,
          lastPing: 1,
          'userInfo.name': 1,
          'userInfo.digitalId': 1,
          'userInfo.city': 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        locationActivity,
        tripActivity,
        mostActiveTourists: activeUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get safety analytics
 * @route   GET /api/analytics/safety
 * @access  Admin
 */
const getSafetyAnalytics = async (req, res) => {
  try {
    // Incident breakdown by type
    const incidentsByType = await Incident.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgSeverity: { $avg: { $switch: {
            branches: [
              { case: { $eq: ['$severity', 'low'] }, then: 1 },
              { case: { $eq: ['$severity', 'medium'] }, then: 2 },
              { case: { $eq: ['$severity', 'high'] }, then: 3 },
              { case: { $eq: ['$severity', 'critical'] }, then: 4 },
            ],
            default: 2,
          }}},
        },
      },
      { $sort: { count: -1 } },
    ]);

    // SOS response metrics
    const sosMetrics = await SOSRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // High-risk zones
    const highRiskZones = await Zone.find({
      type: { $in: ['danger', 'restricted', 'emergency'] },
      isActive: true,
    }).select('name type alertLevel radius currentOccupancy maxCapacity');

    // Active incidents
    const activeIncidents = await Incident.find({
      status: { $nin: ['resolved', 'closed'] },
    })
      .sort({ severity: -1, createdAt: -1 })
      .limit(10)
      .populate('reportedBy', 'name digitalId')
      .populate('zone', 'name type');

    res.status(200).json({
      success: true,
      data: {
        incidentsByType,
        sosMetrics: sosMetrics.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        highRiskZones,
        activeIncidents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get destination analytics
 * @route   GET /api/analytics/destinations
 * @access  Admin
 */
const getDestinationAnalytics = async (req, res) => {
  try {
    // Destinations by category
    const byCategory = await Destination.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Destinations by crowd status
    const byCrowd = await Destination.aggregate([
      {
        $group: {
          _id: '$crowdStatus',
          count: { $sum: 1 },
          avgPercentage: { $avg: '$crowdPercentage' },
        },
      },
    ]);

    // Top rated destinations
    const topRated = await Destination.find()
      .sort({ rating: -1 })
      .limit(10)
      .select('title city state rating numReviews crowdStatus');

    // Destinations by state
    const byState = await Destination.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byCategory,
        byCrowd,
        topRated,
        byState,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getOverviewAnalytics,
  getTouristActivity,
  getSafetyAnalytics,
  getDestinationAnalytics,
};
