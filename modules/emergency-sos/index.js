const EmergencyAlert = require('./models/EmergencyAlert');
const emergencySosService = require('./services/emergencySosService');
const emergencySosController = require('./controllers/emergencySosController');
const emergencySosRoutes = require('./routes/emergencySosRoutes');

module.exports = {
  EmergencyAlert,
  emergencySosService,
  emergencySosController,
  emergencySosRoutes,
};
