const express = require('express');
const router = express.Router();
const {
  addReview,
  getDestinationReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:destinationId', getDestinationReviews);
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
