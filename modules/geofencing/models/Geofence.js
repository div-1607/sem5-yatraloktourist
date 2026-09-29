const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Geofence name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['attraction', 'safe-zone', 'high-risk', 'restricted', 'transit-hub', 'buffer-zone'],
      default: 'attraction',
    },
    center: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [lng, lat] are required'],
      },
    },
    radiusMeters: {
      type: Number,
      required: [true, 'Radius in meters is required'],
      min: [20, 'Radius must be at least 20 meters'],
      max: [50000, 'Radius cannot exceed 50,000 meters'],
      default: 500,
    },
    alertLevel: {
      type: String,
      enum: ['info', 'warning', 'danger', 'critical'],
      default: 'info',
    },
    entryNotificationMessage: {
      type: String,
      default: 'Welcome to this tourist zone! Explore responsibly.',
    },
    exitNotificationMessage: {
      type: String,
      default: 'You have exited this zone.',
    },
    highRiskAdvisory: {
      type: String,
      default: '',
    },
    maxCapacity: {
      type: Number,
      default: 500,
    },
    activeTouristsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    destinationRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Geo-spatial 2dsphere index for ultra-fast spatial search
geofenceSchema.index({ center: '2dsphere' });
geofenceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Geofence', geofenceSchema);
