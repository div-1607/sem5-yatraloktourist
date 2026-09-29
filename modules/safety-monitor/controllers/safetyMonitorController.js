const safetyMonitorService = require('../services/safetyMonitorService');

/**
 * @desc    Predict safety score for destination or location
 * @route   POST /api/safety/score
 * @access  Public / Private
 */
exports.getSafetyScore = async (req, res) => {
  try {
    const { destinationId, crowdLevel, localIncidents, hour, lat, lon } = req.body;
    const result = await safetyMonitorService.calculateSafetyScore({
      destinationId,
      crowdLevel,
      localIncidents,
      hour,
      lat,
      lon,
    });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get safety heatmap dataset for interactive maps
 * @route   GET /api/safety/heatmap
 * @access  Public / Private
 */
exports.getHeatmap = async (req, res) => {
  try {
    const heatmap = await safetyMonitorService.getSafetyHeatmap();
    return res.status(200).json({
      success: true,
      count: heatmap.length,
      data: heatmap,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all active high-risk hazard zones
 * @route   GET /api/safety/high-risk-zones
 * @access  Public / Private
 */
exports.getHighRiskZones = async (req, res) => {
  try {
    const zones = await safetyMonitorService.getHighRiskZones();
    return res.status(200).json({
      success: true,
      count: zones.length,
      data: zones,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Create a high-risk zone
 * @route   POST /api/safety/admin/high-risk-zone
 * @access  Private (Admin)
 */
exports.createHighRiskZone = async (req, res) => {
  try {
    const zone = await safetyMonitorService.createHighRiskZone(req.body);
    return res.status(201).json({
      success: true,
      message: 'High risk hazard zone created',
      data: zone,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
