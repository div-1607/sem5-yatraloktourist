const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'DESTINATION_VIEW',
        'GEOFENCE_ENTRY',
        'GEOFENCE_EXIT',
        'GEOFENCE_BREACH',
        'SOS_TRIGGERED',
        'RECOMMENDATION_IMPRESSION',
        'CROWD_CHECK',
      ],
      required: true,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

analyticsLogSchema.index({ eventType: 1, timestamp: -1 });
analyticsLogSchema.index({ destinationId: 1 });

module.exports = mongoose.model('AnalyticsLog', analyticsLogSchema);
