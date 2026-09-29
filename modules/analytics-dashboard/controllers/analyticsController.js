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
