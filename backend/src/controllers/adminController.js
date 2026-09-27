const User = require('../models/User');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const SOSRequest = require('../models/SOSRequest');
const { CROWD_LEVELS } = require('../config/constants');

/**
 * @desc    Get admin dashboard analytics & metrics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
const getAnalytics = async (req, res, next) => {
  try {
    const totalDestinations = await Destination.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'tourist' });
    const totalReviews = await Review.countDocuments();
    const activeSOS = await SOSRequest.countDocuments({ status: { $in: ['pending', 'responding'] } });

    // Crowd distribution
    const lowCrowd = await Destination.countDocuments({ crowdStatus: CROWD_LEVELS.LOW });
    const modCrowd = await Destination.countDocuments({ crowdStatus: CROWD_LEVELS.MODERATE });
    const highCrowd = await Destination.countDocuments({ crowdStatus: CROWD_LEVELS.HIGH });

    // Recent SOS alerts
    const recentSOS = await SOSRequest.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent reviews
    const recentReviews = await Review.find()
      .populate('user', 'name')
      .populate('destination', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Users signed in (sorted by recent login / activity)
    const signedInUsers = await User.find()
      .select('name email mobile city address role isVerified isActive lastLogin isOnline loginCount createdAt updatedAt')
      .sort({ lastLogin: -1, updatedAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: {
        totalDestinations,
        totalUsers,
        totalReviews,
        activeSOS,
        crowdDistribution: {
          low: lowCrowd,
          moderate: modCrowd,
          high: highCrowd,
        },
        recentSOS,
        recentReviews,
        signedInUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of all signed in users & their login status
 * @route   GET /api/admin/signed-in-users
 * @access  Private (Admin)
 */
const getSignedInUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name email mobile city address role isVerified isActive lastLogin isOnline loginCount createdAt updatedAt')
      .sort({ lastLogin: -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new destination
 * @route   POST /api/admin/destinations
 * @access  Private (Admin)
 */
const createDestination = async (req, res, next) => {
  try {
    const {
      title,
      country = 'India',
      state,
      city,
      category,
      description,
      shortDescription,
      images,
      location,
      crowdStatus,
      crowdPercentage,
      entryFee,
      timings,
      bestTimeToVisit,
      emergencyHelpline,
      isPopular,
      tags,
    } = req.body;

    if (!title || !state || !city || !category || !description || !images || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, state, city, category, description, images, and location are required.',
      });
    }

    const destination = await Destination.create({
      title,
      country,
      state,
      city,
      category,
      description,
      shortDescription: shortDescription || description.substring(0, 140) + '...',
      images: Array.isArray(images) ? images : [images],
      location,
      crowdStatus: crowdStatus || CROWD_LEVELS.LOW,
      crowdPercentage: crowdPercentage || 25,
      entryFee: entryFee || 'Free',
      timings: timings || '09:00 AM - 06:00 PM',
      bestTimeToVisit: bestTimeToVisit || 'October to March',
      emergencyHelpline: emergencyHelpline || '112 / 1363',
      isPopular: Boolean(isPopular),
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
    });

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update destination
 * @route   PUT /api/admin/destinations/:id
 * @access  Private (Admin)
 */
const updateDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const updated = await Destination.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete destination
 * @route   DELETE /api/admin/destinations/:id
 * @access  Private (Admin)
 */
const deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    await destination.deleteOne();
    await Review.deleteMany({ destination: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Destination and its associated reviews removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get registered users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user status (Active / Inactive)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reseed database with all destinations
 * @route   POST /api/admin/reseed
 * @access  Private (Admin)
 */
const reseedDatabase = async (req, res, next) => {
  try {
    const { seedData } = require('../utils/seeder');
    await seedData();
    const count = await Destination.countDocuments();
    res.status(200).json({
      success: true,
      message: `Database successfully re-seeded with ${count} destinations.`,
      destinationsCount: count,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getSignedInUsers,
  createDestination,
  updateDestination,
  deleteDestination,
  getUsers,
  toggleUserStatus,
  reseedDatabase,
};
