const mongoose = require('mongoose');

const locationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    accuracy: {
      type: Number,
      default: 10, // meters
    },
    speed: {
      type: Number, // km/h
      default: 0,
    },
    heading: {
      type: Number, // degrees (0-360)
      default: 0,
    },
    batteryLevel: {
      type: Number, // percentage (0-100)
      default: 100,
    },
    currentGeofenceName: {
      type: String,
      default: null,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

locationLogSchema.index({ userId: 1, recordedAt: -1 });
locationLogSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LocationLog', locationLogSchema);
