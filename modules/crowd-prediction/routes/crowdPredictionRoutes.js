const express = require('express');
const router = express.Router();
const crowdPredictionController = require('../controllers/crowdPredictionController');

router.get('/overview', crowdPredictionController.getCrowdOverview);
router.post('/destination/:id', crowdPredictionController.predictDestinationCrowd);

module.exports = router;
