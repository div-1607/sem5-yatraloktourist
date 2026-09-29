const mlBridge = require('../services/mlBridge');
const Destination = require('../../../backend/src/models/Destination');

/**
 * @desc    Get ML status and loaded models
 * @route   GET /api/ml/status
 * @access  Public
 */
exports.getStatus = async (req, res) => {
  return res.status(200).json({
    success: true,
    service: 'YatraLok Machine Learning Service',
    features: [
      'Smart Destination Recommendation (Scikit-Learn TF-IDF Cosine Similarity)',
      'Crowd Prediction (Random Forest Classifier)',
      'Tourist Safety Prediction (Gradient Boosting Regressor)',
      'Personalized Tourist Feed',
      'Similar Tourist Recommendation (Collaborative Filtering)',
      'Weather-Based Recommendation',
    ],
  });
};

/**
 * @desc    Run Crowd Prediction ML model
 * @route   POST /api/ml/predict-crowd
 * @access  Public / Private
 */
exports.predictCrowd = async (req, res) => {
  try {
    const result = await mlBridge.predictCrowd(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Run Tourist Safety Prediction ML model
 * @route   POST /api/ml/predict-safety
 * @access  Public / Private
 */
exports.predictSafety = async (req, res) => {
  try {
    const result = await mlBridge.predictSafetyScore(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Smart Recommendations
 * @route   POST /api/ml/recommend/smart
 * @access  Public / Private
 */
exports.smartRecommend = async (req, res) => {
  try {
    const destinations = await Destination.find().limit(50);
    const result = await mlBridge.getSmartRecommendations({
      ...req.body,
      destinations,
    });
    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Similar Tourist Recommendations
 * @route   POST /api/ml/recommend/similar-tourists
 * @access  Public / Private
 */
exports.similarTourists = async (req, res) => {
  try {
    const destinations = await Destination.find().limit(50);
    const result = await mlBridge.getSimilarTouristRecommendations({
      interests: req.body.interests || [],
      destinations,
    });
    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Weather-Based Recommendations
 * @route   POST /api/ml/recommend/weather
 * @access  Public / Private
 */
exports.weatherRecommend = async (req, res) => {
  try {
    const destinations = await Destination.find().limit(50);
    const result = await mlBridge.getWeatherRecommendations({
      weather: req.body.weather || 'sunny',
      destinations,
    });
    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
