const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    altitude: {
      type: Number,
      default: null,
    },
    accuracy: {
      type: Number, // meters
      default: null,
    },
    speed: {
      type: Number, // m/s
      default: 0,
    },
    heading: {
      type: Number, // degrees from north
      default: null,
    },
    batteryLevel: {
      type: Number, // 0-100
      default: null,
    },
    source: {
      type: String,
      enum: ['gps', 'network', 'wifi', 'manual', 'simulated'],
      default: 'gps',
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    nearestZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
    },
    nearestDestination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    isInsideGeofence: {
      type: Boolean,
      default: false,
    },
    geofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial queries
locationSchema.index({ location: '2dsphere' });

// Compound index for user location timeline
locationSchema.index({ user: 1, createdAt: -1 });

// TTL index: auto-delete location pings older than 30 days
locationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Location', locationSchema);
