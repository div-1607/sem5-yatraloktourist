const trackingService = require('../services/trackingService');

/**
 * @desc    Submit current GPS location ping
 * @route   POST /api/tracking/record
 * @access  Private (Tourist)
 */
exports.recordLocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await trackingService.recordLocation(userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Location tracked successfully',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user's personal location history
 * @route   GET /api/tracking/history
 * @access  Private
 */
exports.getLocationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = req.query.limit || 50;
    const history = await trackingService.getLocationHistory(userId, limit);
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get current movement trail breadcrumbs
 * @route   GET /api/tracking/trail
 * @access  Private
 */
exports.getTrail = async (req, res) => {
  try {
    const userId = req.user._id;
    const trail = await trackingService.getMovementTrail(userId);
    return res.status(200).json({
      success: true,
      count: trail.length,
      data: trail,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Get all active tourists and their live location
 * @route   GET /api/tracking/admin/active
 * @access  Private (Admin)
 */
exports.adminGetActiveTourists = async (req, res) => {
  try {
    const tourists = await trackingService.getActiveTourists();
    return res.status(200).json({
      success: true,
      count: tourists.length,
      data: tourists,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
