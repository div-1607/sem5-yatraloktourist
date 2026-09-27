const User = require('../models/User');
const Destination = require('../models/Destination');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, mobile, city, address, age, gender } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (city) user.city = city;
    if (address) user.address = address;
    if (age) user.age = age;
    if (gender) user.gender = gender;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle favourite destination
 * @route   POST /api/users/favorites/:destId
 * @access  Private
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const { destId } = req.params;
    const user = await User.findById(req.user.id);

    const dest = await Destination.findById(destId);
    if (!dest) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const index = user.favorites.indexOf(destId);
    let isFavorite = false;

    if (index > -1) {
      user.favorites.splice(index, 1);
      isFavorite = false;
    } else {
      user.favorites.push(destId);
      isFavorite = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      isFavorite,
      message: isFavorite ? 'Added to saved destinations' : 'Removed from saved destinations',
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's saved destinations
 * @route   GET /api/users/favorites
 * @access  Private
 */
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a recent search term
 * @route   POST /api/users/recent-searches
 * @access  Private
 */
const addRecentSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query cannot be empty' });
    }

    const user = await User.findById(req.user.id);
    const trimmed = query.trim();

    // Remove if already exists to push to front
    user.recentSearches = user.recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    user.recentSearches.unshift(trimmed);

    // Keep max 8
    if (user.recentSearches.length > 8) {
      user.recentSearches = user.recentSearches.slice(0, 8);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.recentSearches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  toggleFavorite,
  getFavorites,
  addRecentSearch,
};
