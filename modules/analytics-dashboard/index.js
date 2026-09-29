const AnalyticsLog = require('./models/AnalyticsLog');
const TouristTrend = require('./models/TouristTrend');
const analyticsService = require('./services/analyticsService');
const analyticsController = require('./controllers/analyticsController');
const analyticsRoutes = require('./routes/analyticsRoutes');

module.exports = {
  AnalyticsLog,
  TouristTrend,
  analyticsService,
  analyticsController,
  analyticsRoutes,
};
