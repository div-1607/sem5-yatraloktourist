const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

router.get('/status', mlController.getStatus);
router.post('/predict-crowd', mlController.predictCrowd);
router.post('/predict-safety', mlController.predictSafety);
router.post('/recommend/smart', mlController.smartRecommend);
router.post('/recommend/similar-tourists', mlController.similarTourists);
router.post('/recommend/weather', mlController.weatherRecommend);

module.exports = router;
