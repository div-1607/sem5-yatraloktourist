const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Destination = require('./models/Destination');
const { seedData } = require('./utils/seeder');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const sosRoutes = require('./routes/sosRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

const app = express();

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
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', adminRoutes);

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
    if (destCount < 80) {
      console.log(`[Server] Database has ${destCount} destinations (target >= 80). Running full seed initialization...`);
      await seedData();
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 [YATRA LOK BACKEND] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
