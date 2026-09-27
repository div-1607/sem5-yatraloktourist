const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  toggleFavorite,
  getFavorites,
  addRecentSearch,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All user routes protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/favorites/:destId', toggleFavorite);
router.get('/favorites', getFavorites);
router.post('/recent-searches', addRecentSearch);

module.exports = router;
