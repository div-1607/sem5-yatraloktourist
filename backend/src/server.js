const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Destination = require('./models/Destination');
const { seedData } = require('./utils/seeder');

// Route imports - Core
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const sosRoutes = require('./routes/sosRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Route imports - Extended Backend (Member 2)
const touristRoutes = require('./routes/touristRoutes');
const tripRoutes = require('./routes/tripRoutes');
const locationRoutes = require('./routes/locationRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const analyticsNewRoutes = require('./routes/analyticsRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Feature Module Route imports
const geofenceRoutes = require('../../modules/geofencing/routes/geofenceRoutes');
const trackingRoutes = require('../../modules/tourist-tracking/routes/trackingRoutes');
const emergencySosRoutes = require('../../modules/emergency-sos/routes/emergencySosRoutes');
const safetyMonitorRoutes = require('../../modules/safety-monitor/routes/safetyMonitorRoutes');
const mlRoutes = require('../../modules/machine-learning/routes/mlRoutes');
const crowdPredictionRoutes = require('../../modules/crowd-prediction/routes/crowdPredictionRoutes');
const recommendationRoutes = require('../../modules/recommendation-engine/routes/recommendationRoutes');
const analyticsRoutes = require('../../modules/analytics-dashboard/routes/analyticsRoutes');
const { seedGeofencesAndHazards } = require('./utils/geofenceSeeder');

// Socket.IO
let io;
try {
  const { Server } = require('socket.io');
  const { initializeSocketHandlers } = require('./sockets/socketHandler');
  // Socket.IO will be initialized after server creation
  var socketEnabled = true;
} catch (err) {
  var socketEnabled = false;
  console.log('[Server] Socket.IO not available - running without real-time features');
}

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO if available
if (socketEnabled) {
  try {
    const { Server } = require('socket.io');
    const { initializeSocketHandlers } = require('./sockets/socketHandler');
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    initializeSocketHandlers(io);
    app.set('io', io);
    console.log('[Server] ✅ Socket.IO initialized');
  } catch (err) {
    console.log('[Server] Socket.IO initialization skipped:', err.message);
  }
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Yatra Lok Tourism Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    socketIO: socketEnabled ? 'enabled' : 'disabled',
    version: '2.0.0',
  });
});

// ========================
// Core API Routes
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', adminRoutes);

// ========================
// Extended Backend Routes (Member 2)
// ========================
app.use('/api/tourists', touristRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/analytics-v2', analyticsNewRoutes);
app.use('/api/audit', auditRoutes);

// ========================
// Modular Feature Routes
// ========================
app.use('/api/geofencing', geofenceRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/emergency-sos', emergencySosRoutes);
app.use('/api/safety', safetyMonitorRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/crowd-prediction', crowdPredictionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is fresh or has incomplete dataset
    const destCount = await Destination.countDocuments();
    if (destCount < 350) {
      console.log(`[Server] Database has ${destCount} destinations (target >= 350). Running full seed initialization...`);
      await seedData();
    }

    // Seed initial Geofences & Hazard Zones if empty
    await seedGeofencesAndHazards();

    server.listen(PORT, () => {
      console.log(`\n🚀 [YATRA LOK BACKEND] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      if (socketEnabled) {
        console.log(`⚡ Socket.IO: ws://localhost:${PORT}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
