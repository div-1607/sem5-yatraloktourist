const express = require('express');
const router = express.Router();
const {
  getCrowdOverview,
  getDestinationCrowd,
  updateCrowdStatus,
} = require('../controllers/crowdController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/status', getCrowdOverview);
router.get('/:destinationId', getDestinationCrowd);
router.put('/:destinationId', protect, adminOnly, updateCrowdStatus);

module.exports = router;
