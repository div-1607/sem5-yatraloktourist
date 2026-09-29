const CrowdPrediction = require('./models/CrowdPrediction');
const crowdPredictionService = require('./services/crowdPredictionService');
const crowdPredictionController = require('./controllers/crowdPredictionController');
const crowdPredictionRoutes = require('./routes/crowdPredictionRoutes');

module.exports = {
  CrowdPrediction,
  crowdPredictionService,
  crowdPredictionController,
  crowdPredictionRoutes,
};
