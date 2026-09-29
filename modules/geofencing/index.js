const Geofence = require('./models/Geofence');
const GeofenceEvent = require('./models/GeofenceEvent');
const geofenceService = require('./services/geofenceService');
const geofenceController = require('./controllers/geofenceController');
const geofenceRoutes = require('./routes/geofenceRoutes');

module.exports = {
  Geofence,
  GeofenceEvent,
  geofenceService,
  geofenceController,
  geofenceRoutes,
};
