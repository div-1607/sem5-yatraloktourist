const emergencySosService = require('../services/emergencySosService');

/**
 * @desc    Trigger an emergency SOS alert
 * @route   POST /api/emergency-sos/trigger
 * @access  Private
 */
exports.triggerAlert = async (req, res) => {
  try {
    const userId = req.user._id;
    const alert = await emergencySosService.triggerAlert(userId, req.body);
    return res.status(201).json({
      success: true,
      message: '🚨 Emergency SOS broadcasted! Responders and local authorities alerted.',
      data: alert,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get active SOS alerts for command center
 * @route   GET /api/emergency-sos/active
 * @access  Private (Admin)
 */
exports.getActiveAlerts = async (req, res) => {
  try {
    const alerts = await emergencySosService.getActiveAlerts();
    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all alerts with pagination/filtering
 * @route   GET /api/emergency-sos/all
 * @access  Private (Admin)
 */
exports.getAllAlerts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;

    const alerts = await emergencySosService.getAllAlerts(filter);
    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update SOS status (responder dispatched, resolved, false alarm)
 * @route   PATCH /api/emergency-sos/:id/status
 * @access  Private (Admin)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status, responderNotes } = req.body;
    const updated = await emergencySosService.updateStatus(
      req.params.id,
      status,
      responderNotes,
      req.user._id
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Alert updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
