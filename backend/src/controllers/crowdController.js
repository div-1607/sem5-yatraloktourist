const Destination = require('../models/Destination');
const CrowdStatus = require('../models/CrowdStatus');
const { CROWD_LEVELS } = require('../config/constants');

/**
 * @desc    Get aggregate crowd overview across destinations
 * @route   GET /api/crowd/status
 * @access  Public
 */
const getCrowdOverview = async (req, res, next) => {
  try {
    const lowCount = await Destination.countDocuments({ crowdStatus: CROWD_LEVELS.LOW });
    const modCount = await Destination.countDocuments({ crowdStatus: CROWD_LEVELS.MODERATE });
    const highCount = await Destination.countDocuments({ crowdStatus: CROWD_LEVELS.HIGH });
    const total = lowCount + modCount + highCount;

    // Fetch top destinations in each level
    const lowPlaces = await Destination.find({ crowdStatus: CROWD_LEVELS.LOW })
      .select('title state city crowdStatus crowdPercentage images rating')
      .limit(6);

    const modPlaces = await Destination.find({ crowdStatus: CROWD_LEVELS.MODERATE })
      .select('title state city crowdStatus crowdPercentage images rating')
      .limit(6);

    const highPlaces = await Destination.find({ crowdStatus: CROWD_LEVELS.HIGH })
      .select('title state city crowdStatus crowdPercentage images rating')
      .limit(6);

    res.status(200).json({
      success: true,
      summary: {
        total,
        low: {
          count: lowCount,
          percentage: total ? Math.round((lowCount / total) * 100) : 0,
          color: 'green',
          label: 'Calm / Low Crowd',
        },
        moderate: {
          count: modCount,
          percentage: total ? Math.round((modCount / total) * 100) : 0,
          color: 'yellow',
          label: 'Moderate Rush',
        },
        high: {
          count: highCount,
          percentage: total ? Math.round((highCount / total) * 100) : 0,
          color: 'red',
          label: 'Heavy Rush / Caution',
        },
      },
      destinations: {
        low: lowPlaces,
        moderate: modPlaces,
        high: highPlaces,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed crowd info for a specific destination
 * @route   GET /api/crowd/:destinationId
 * @access  Public
 */
const getDestinationCrowd = async (req, res, next) => {
  try {
    const { destinationId } = req.params;

    const destination = await Destination.findById(destinationId).select(
      'title state city crowdStatus crowdPercentage bestTimeToVisit timings'
    );

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    // Generate peak hour trends
    const peakHours = [
      { time: '08:00 AM - 10:00 AM', crowd: 'Low', percentage: 20 },
      { time: '10:00 AM - 01:00 PM', crowd: 'Moderate', percentage: 60 },
      { time: '01:00 PM - 04:00 PM', crowd: 'High', percentage: 85 },
      { time: '04:00 PM - 07:00 PM', crowd: 'High', percentage: 90 },
      { time: '07:00 PM - 09:00 PM', crowd: 'Moderate', percentage: 50 },
    ];

    let safetyAdvice = 'Optimal time to visit with minimal wait times.';
    if (destination.crowdStatus === CROWD_LEVELS.MODERATE) {
      safetyAdvice = 'Expect average waiting times. Keep personal belongings secure.';
    } else if (destination.crowdStatus === CROWD_LEVELS.HIGH) {
      safetyAdvice = 'Heavy tourist footfall. Keep children close, follow designated queues, and stay alert.';
    }

    res.status(200).json({
      success: true,
      data: {
        destination,
        safetyAdvice,
        peakHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update destination crowd status (Admin/Staff)
 * @route   PUT /api/crowd/:destinationId
 * @access  Private (Admin)
 */
const updateCrowdStatus = async (req, res, next) => {
  try {
    const { destinationId } = req.params;
    const { level, percentage, notes } = req.body;

    if (!level || !Object.values(CROWD_LEVELS).includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Valid crowd level (low, moderate, high) is required',
      });
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    destination.crowdStatus = level;
    if (percentage !== undefined) {
      destination.crowdPercentage = Number(percentage);
    } else {
      destination.crowdPercentage = level === 'low' ? 25 : level === 'moderate' ? 60 : 90;
    }
    await destination.save();

    // Log crowd history
    await CrowdStatus.create({
      destination: destinationId,
      level,
      percentage: destination.crowdPercentage,
      reportedBy: req.user ? req.user._id : null,
      notes: notes || `Status updated to ${level}`,
    });

    res.status(200).json({
      success: true,
      message: `Crowd status updated to ${level.toUpperCase()}`,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrowdOverview,
  getDestinationCrowd,
  updateCrowdStatus,
};
