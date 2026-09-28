const SOSRequest = require('../models/SOSRequest');
const { EMERGENCY_CONTACTS } = require('../config/constants');

/**
 * @desc    Trigger emergency SOS distress signal
 * @route   POST /api/sos/create
 * @access  Public / Optional Auth
 */
const createSOS = async (req, res, next) => {
  try {
    const {
      userName,
      userMobile,
      userEmail,
      location,
      emergencyType = 'General',
      message,
    } = req.body;

    if (!location || location.lat === undefined || location.lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Accurate GPS coordinates are required for emergency dispatch.',
      });
    }

    const resolvedName = userName || (req.user ? req.user.name : 'Tourist Traveler');
    const resolvedMobile = userMobile || (req.user ? req.user.mobile : 'GPS Broadcast Signal');
    const resolvedEmail = userEmail || (req.user ? req.user.email : '');
    const resolvedDigitalId = req.body.digitalId || (req.user ? req.user.digitalId : 'GUEST-UNREGISTERED');

    const sos = await SOSRequest.create({
      user: req.user ? req.user._id : null,
      userName: resolvedName,
      userMobile: resolvedMobile,
      userEmail: resolvedEmail,
      digitalId: resolvedDigitalId,
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng),
        address: location.address || `GPS Coordinates: ${Number(location.lat).toFixed(4)}, ${Number(location.lng).toFixed(4)}`,
      },
      emergencyType: emergencyType || 'Emergency SOS',
      message: message || 'Urgent SOS distress alert broadcast by tourist.',
      status: 'pending',
    });

    // Prominently alert server console
    console.log(`\n🚨🚨🚨 [EMERGENCY SOS ALERT ACTIVATED] 🚨🚨🚨`);
    console.log(`Caller:     ${userName} (${userMobile})`);
    console.log(`Emergency:  ${emergencyType.toUpperCase()}`);
    console.log(`Location:   Lat ${location.lat}, Lng ${location.lng}`);
    console.log(`Address:    ${location.address || 'GPS Coordinates'}`);
    console.log(`Timestamp:  ${new Date().toISOString()}`);
    console.log(`🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n`);

    res.status(201).json({
      success: true,
      message: 'Distress signal received. Emergency services have been alerted.',
      data: sos,
      emergencyContacts: EMERGENCY_CONTACTS,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active SOS distress alerts (Pending / Responding)
 * @route   GET /api/sos/active
 * @access  Private (Admin)
 */
const getActiveSOS = async (req, res, next) => {
  try {
    const activeAlerts = await SOSRequest.find({
      status: { $in: ['pending', 'responding'] },
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email mobile');

    res.status(200).json({
      success: true,
      count: activeAlerts.length,
      data: activeAlerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update SOS status
 * @route   PATCH /api/sos/:id/status
 * @access  Private (Admin)
 */
const updateSOSStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!['pending', 'responding', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Choose from pending, responding, or resolved.',
      });
    }

    const sos = await SOSRequest.findById(id);
    if (!sos) {
      return res.status(404).json({ success: false, message: 'SOS request not found' });
    }

    sos.status = status;
    if (resolutionNotes) {
      sos.resolutionNotes = resolutionNotes;
    }
    await sos.save();

    res.status(200).json({
      success: true,
      message: `SOS status updated to ${status}`,
      data: sos,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all historical SOS requests
 * @route   GET /api/sos/all
 * @access  Private (Admin)
 */
const getAllSOS = async (req, res, next) => {
  try {
    const requests = await SOSRequest.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email mobile');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSOS,
  getActiveSOS,
  updateSOSStatus,
  getAllSOS,
};
