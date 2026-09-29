const mongoose = require('mongoose');

const touristMovementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    lastCoordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
    currentSpeed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    totalDistanceTraveledKm: {
      type: Number,
      default: 0,
    },
    currentGeofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Geofence',
      default: null,
    },
    currentGeofenceName: {
      type: String,
      default: null,
    },
    breadcrumbs: [
      {
        coordinates: [Number], // [lng, lat]
        timestamp: { type: Date, default: Date.now },
        speed: Number,
      },
    ],
    lastPingAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

touristMovementSchema.index({ userId: 1 });
touristMovementSchema.index({ isOnline: 1, lastPingAt: -1 });

module.exports = mongoose.model('TouristMovement', touristMovementSchema);
