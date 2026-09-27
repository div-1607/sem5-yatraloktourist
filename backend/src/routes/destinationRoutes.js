const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getFeatured,
  getStatesAndCities,
  getDestinationById,
  getCategories,
  getRecommendations,
} = require('../controllers/destinationController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', getDestinations);
router.get('/featured', getFeatured);
router.get('/hierarchy', getStatesAndCities);
router.get('/categories', getCategories);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/:id', getDestinationById);

module.exports = router;
