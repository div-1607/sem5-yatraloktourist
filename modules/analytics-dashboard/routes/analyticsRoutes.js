const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverview);
router.get('/destinations', analyticsController.getDestinationAnalytics);
router.post('/event', analyticsController.logEvent);

module.exports = router;
