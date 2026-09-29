const recommendationService = require('../services/recommendationService');

/**
 * @desc    Get smart personalized recommendations
 * @route   GET /api/recommendations/smart
 * @access  Public / Private
 */
exports.getSmartRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const recommendations = await recommendationService.getSmartRecommendations(userId, req.query);
    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get dynamic personalized tourist feed
 * @route   GET /api/recommendations/feed
 * @access  Public / Private
 */
exports.getPersonalizedFeed = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const feed = await recommendationService.getPersonalizedFeed(userId);
    return res.status(200).json({
      success: true,
      data: feed,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get destinations liked by similar tourists
 * @route   GET /api/recommendations/similar-tourists
 * @access  Public / Private
 */
exports.getSimilarTouristRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const recommendations = await recommendationService.getSimilarTouristPicks(userId);
    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get weather-based destination recommendations
 * @route   GET /api/recommendations/weather
 * @access  Public
 */
exports.getWeatherRecommendations = async (req, res) => {
  try {
    const weather = req.query.weather || 'Sunny';
    const recommendations = await recommendationService.getWeatherRecommendations(weather);
    return res.status(200).json({
      success: true,
      weather,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user travel preferences
 * @route   GET /api/recommendations/preferences
 * @access  Private
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const prefs = await recommendationService.getUserPreferences(req.user._id);
    return res.status(200).json({ success: true, data: prefs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user travel preferences
 * @route   PUT /api/recommendations/preferences
 * @access  Private
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const prefs = await recommendationService.updateUserPreferences(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: prefs,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
