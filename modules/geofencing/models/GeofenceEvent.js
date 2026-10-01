const mongoose = require('../../../backend/src/config/mongoose');

const geofenceEventSchema = new mongoose.Schema(
  {
    geofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Geofence',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['ENTRY', 'EXIT', 'DWELL', 'BREACH_RESTRICTED', 'PROXIMITY_WARNING'],
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
    distanceFromCenterMeters: {
      type: Number,
      default: 0,
    },
    alertLevel: {
      type: String,
      enum: ['info', 'warning', 'danger', 'critical'],
      default: 'info',
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationTitle: {
      type: String,
      default: '',
    },
    notificationBody: {
      type: String,
      default: '',
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

geofenceEventSchema.index({ userId: 1, timestamp: -1 });
geofenceEventSchema.index({ geofenceId: 1, timestamp: -1 });
geofenceEventSchema.index({ eventType: 1, alertLevel: 1 });

module.exports = mongoose.connection.models.GeofenceEvent ||
  mongoose.connection.model('GeofenceEvent', geofenceEventSchema);
