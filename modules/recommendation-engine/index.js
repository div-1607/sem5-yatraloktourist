const RecommendationLog = require('./models/RecommendationLog');
const UserPreference = require('./models/UserPreference');
const recommendationService = require('./services/recommendationService');
const recommendationController = require('./controllers/recommendationController');
const recommendationRoutes = require('./routes/recommendationRoutes');

module.exports = {
  RecommendationLog,
  UserPreference,
  recommendationService,
  recommendationController,
  recommendationRoutes,
};
