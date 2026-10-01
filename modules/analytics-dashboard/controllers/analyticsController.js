const analyticsService = require('../services/analyticsService');

/**
 * @desc    Get complete analytics dashboard data
 * @route   GET /api/analytics/overview
 * @access  Public / Private (Admin / Tourists)
 */
exports.getOverview = async (req, res) => {
  try {
    const data = await analyticsService.getDashboardOverview();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Log a client interaction event
 * @route   POST /api/analytics/event
 * @access  Public / Private
 */
exports.logEvent = async (req, res) => {
  try {
    const { eventType, destinationId, metadata } = req.body;
    const userId = req.user ? req.user._id : null;
    await analyticsService.logEvent(eventType, { destinationId, userId, metadata });
    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get top destinations analytics for admin dashboard
 * @route   GET /api/analytics/destinations
 * @access  Public / Private
 */
exports.getDestinationAnalytics = async (req, res) => {
  try {
    const Destination = require('../../../backend/src/models/Destination');
    const destinations = await Destination.find()
      .sort({ rating: -1, numReviews: -1 })
      .limit(10)
      .select('title city state rating numReviews totalReviews averageRating category currentCrowdStatus images');

    const topRated = destinations.map((d) => ({
      _id: d._id,
      title: d.title,
      city: d.city,
      state: d.state,
      rating: d.rating || d.averageRating || 4.5,
      numReviews: d.numReviews || d.totalReviews || 0,
      category: d.category,
      crowdStatus: d.currentCrowdStatus || 'MEDIUM',
    }));

    return res.status(200).json({
      success: true,
      data: {
        topRated,
        total: destinations.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
