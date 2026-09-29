const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['safe', 'caution', 'restricted', 'danger', 'emergency', 'tourist-zone'],
      required: [true, 'Zone type is required'],
      index: true,
    },
    category: {
      type: String,
      enum: ['geofence', 'hazard', 'attraction', 'medical', 'police', 'evacuation'],
      default: 'geofence',
    },
    center: {
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
    radius: {
      type: Number,
      required: [true, 'Zone radius in meters is required'],
      min: [10, 'Radius must be at least 10 meters'],
      max: [50000, 'Radius cannot exceed 50km'],
    },
    alertLevel: {
      type: String,
      enum: ['none', 'info', 'warning', 'critical'],
      default: 'info',
    },
    alertMessage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    maxCapacity: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    currentOccupancy: {
      type: Number,
      default: 0,
    },
    operatingHours: {
      open: { type: String, default: '00:00' },
      close: { type: String, default: '23:59' },
    },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    linkedDestinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
      },
    ],
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
zoneSchema.index({ center: '2dsphere' });

// Static method: find zones near a point
zoneSchema.statics.findNearby = function (lng, lat, maxDistanceMeters = 5000) {
  return this.find({
    isActive: true,
    center: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  });
};

// Static method: find zones a point is inside
zoneSchema.statics.findContaining = function (lng, lat) {
  return this.find({
    isActive: true,
    center: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      },
    },
  });
};

module.exports = mongoose.model('Zone', zoneSchema);
