const mongoose = require('mongoose');

const responseLogSchema = new mongoose.Schema({
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
  },
  notes: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Incident description is required'],
    },
    type: {
      type: String,
      enum: [
        'medical',
        'theft',
        'harassment',
        'accident',
        'natural-disaster',
        'lost-tourist',
        'crowd-crush',
        'fire',
        'structural',
        'other',
      ],
      required: [true, 'Incident type is required'],
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['reported', 'acknowledged', 'investigating', 'responding', 'resolved', 'closed'],
      default: 'reported',
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: 'GPS Location' },
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
    },
    relatedSOS: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SOSRequest',
    },
    affectedCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    evidence: [
      {
        type: { type: String, enum: ['photo', 'video', 'audio', 'document'] },
        url: { type: String },
        description: { type: String, default: '' },
      },
    ],
    responseLog: [responseLogSchema],
    resolvedAt: { type: Date },
    resolutionSummary: { type: String, default: '' },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

// Virtual: response time in minutes
incidentSchema.virtual('responseTimeMinutes').get(function () {
  if (this.responseLog.length > 0) {
    const firstResponse = this.responseLog[0].timestamp;
    return Math.round((firstResponse - this.createdAt) / (1000 * 60));
  }
  return null;
});

// Virtual: resolution time in minutes
incidentSchema.virtual('resolutionTimeMinutes').get(function () {
  if (this.resolvedAt) {
    return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60));
  }
  return null;
});

incidentSchema.set('toJSON', { virtuals: true });
incidentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Incident', incidentSchema);
