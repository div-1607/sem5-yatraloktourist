const crowdPredictionService = require('../services/crowdPredictionService');

/**
 * @desc    Predict crowd for destination
 * @route   POST /api/crowd-prediction/destination/:id
 * @access  Public / Private
 */
exports.predictDestinationCrowd = async (req, res) => {
  try {
    const result = await crowdPredictionService.predictForDestination(
      req.params.id,
      req.body
    );
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get live crowd prediction overview for all destinations
 * @route   GET /api/crowd-prediction/overview
 * @access  Public / Private
 */
exports.getCrowdOverview = async (req, res) => {
  try {
    const overview = await crowdPredictionService.getLatestOverview();
    return res.status(200).json({
      success: true,
      count: overview.length,
      data: overview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
