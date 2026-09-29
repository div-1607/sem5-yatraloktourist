const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yatralok',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'yatralok_super_secret_jwt_key_2026_987654321',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',

  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@yatralok.com',

  // ML Service
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:5001',

  // Socket.IO
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || '*',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,

  // Geofencing
  DEFAULT_GEOFENCE_RADIUS: process.env.DEFAULT_GEOFENCE_RADIUS || 500,
  MAX_GEOFENCE_RADIUS: process.env.MAX_GEOFENCE_RADIUS || 50000,
  LOCATION_PING_INTERVAL_MS: process.env.LOCATION_PING_INTERVAL_MS || 10000,

  // SOS
  SOS_AUTO_ESCALATION_MINUTES: process.env.SOS_AUTO_ESCALATION_MINUTES || 5,
};
