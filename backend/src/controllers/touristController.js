const User = require('../models/User');
const Trip = require('../models/Trip');
const Location = require('../models/Location');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get tourist profile with full stats
 * @route   GET /api/tourists/profile
 * @access  Private
 */
const getTouristProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites', 'title slug city state category images rating');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Tourist not found' });
    }

    // Get trip stats
    const tripStats = await Trip.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          activeTrips: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completedTrips: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalDistanceKm: { $sum: '$totalDistanceKm' },
          totalBudgetSpent: { $sum: '$budget.spent' },
        },
      },
    ]);

    // Get recent locations count
    const recentLocationCount = await Location.countDocuments({
      user: user._id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    res.status(200).json({
      success: true,
      data: {
        profile: user,
        stats: tripStats[0] || {
          totalTrips: 0,
          activeTrips: 0,
          completedTrips: 0,
          totalDistanceKm: 0,
          totalBudgetSpent: 0,
        },
        recentLocationPings: recentLocationCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update tourist profile
 * @route   PUT /api/tourists/profile
 * @access  Private
 */
const updateTouristProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'age', 'gender', 'mobile', 'city', 'address', 'chosenDestination'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    await AuditLog.log({
      user: req.user._id,
      action: 'profile_update',
      category: 'user-management',
      description: `Tourist updated profile fields: ${Object.keys(updates).join(', ')}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get tourist's digital ID card data
 * @route   GET /api/tourists/digital-id
 * @access  Private
 */
const getDigitalId = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email mobile digitalId city gender age role createdAt'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Tourist not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        digitalId: user.digitalId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        gender: user.gender,
        age: user.age,
        role: user.role,
        memberSince: user.createdAt,
        platform: 'YatraLok Smart Tourism',
        issuedBy: 'YatraLok Tourism Authority',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Toggle favorite destination
 * @route   POST /api/tourists/favorites/:destinationId
 * @access  Private
 */
const toggleFavorite = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.favorites.indexOf(destinationId);
    let action;

    if (index === -1) {
      user.favorites.push(destinationId);
      action = 'added';
    } else {
      user.favorites.splice(index, 1);
      action = 'removed';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Destination ${action} ${action === 'added' ? 'to' : 'from'} favorites`,
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get tourist's travel history
 * @route   GET /api/tourists/travel-history
 * @access  Private
 */
const getTravelHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const trips = await Trip.find({ user: req.user._id, status: 'completed' })
      .sort({ endDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments({ user: req.user._id, status: 'completed' });

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
 * @desc    Get nearby tourists (Admin only)
 * @route   GET /api/tourists/nearby?lat=&lng=&radius=
 * @access  Admin
 */
const getNearbyTourists = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    // Find recent locations within radius
    const recentLocations = await Location.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // Last 30 min
    })
      .populate('user', 'name digitalId mobile city')
      .limit(100);

    res.status(200).json({
      success: true,
      count: recentLocations.length,
      data: recentLocations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTouristProfile,
  updateTouristProfile,
  getDigitalId,
  toggleFavorite,
  getTravelHistory,
  getNearbyTourists,
};
