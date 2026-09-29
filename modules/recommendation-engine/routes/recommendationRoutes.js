const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { protect } = require('../../../backend/src/middleware/authMiddleware');

// Public / Semi-protected routes
router.get('/smart', recommendationController.getSmartRecommendations);
router.get('/feed', recommendationController.getPersonalizedFeed);
router.get('/similar-tourists', recommendationController.getSimilarTouristRecommendations);
router.get('/weather', recommendationController.getWeatherRecommendations);

// User Preferences
router.get('/preferences', protect, recommendationController.getUserPreferences);
router.put('/preferences', protect, recommendationController.updateUserPreferences);

module.exports = router;
