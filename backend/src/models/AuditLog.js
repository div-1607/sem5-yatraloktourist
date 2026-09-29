const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'auth',
        'user-management',
        'destination',
        'trip',
        'zone',
        'sos',
        'incident',
        'geofence',
        'analytics',
        'system',
        'admin',
      ],
      default: 'system',
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    resourceType: {
      type: String,
      trim: true,
      default: '',
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'warning'],
      default: 'success',
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

// TTL index: auto-delete logs older than 365 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Static: create audit entry helper
auditLogSchema.statics.log = function (data) {
  return this.create(data);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
