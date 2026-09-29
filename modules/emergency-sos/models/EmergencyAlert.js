const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema(
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
      address: {
        type: String,
        default: '',
      },
    },
    geofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Geofence',
      default: null,
    },
    geofenceName: {
      type: String,
      default: null,
    },
    alertType: {
      type: String,
      enum: [
        'MANUAL_PANIC',
        'GEOFENCE_BREACH',
        'HIGH_RISK_PROXIMITY',
        'MEDICAL_EMERGENCY',
        'HARASSMENT_THEFT',
        'LOST_IN_WILDERNESS',
      ],
      default: 'MANUAL_PANIC',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'CRITICAL',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESPONDER_DISPATCHED', 'RESOLVED', 'FALSE_ALARM'],
      default: 'ACTIVE',
    },
    message: {
      type: String,
      default: 'Emergency SOS alert initiated!',
    },
    contactNumbers: [String],
    respondersNotified: [
      {
        name: String,
        role: String,
        notifiedAt: { type: Date, default: Date.now },
      },
    ],
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emergencyAlertSchema.index({ status: 1, severity: 1, createdAt: -1 });
emergencyAlertSchema.index({ location: '2dsphere' });
emergencyAlertSchema.index({ userId: 1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
