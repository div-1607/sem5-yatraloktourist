const mongoose = require('mongoose');

const safetyMetricSchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
      unique: true,
    },
    destinationName: {
      type: String,
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
    currentSafetyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    safetyTier: {
      type: String,
      enum: ['OPTIMAL', 'MODERATE', 'CAUTION', 'HAZARDOUS'],
      default: 'OPTIMAL',
    },
    metricsBreakdown: {
      crowdSafetyScore: { type: Number, default: 85 },
      incidentRiskScore: { type: Number, default: 90 },
      timeLightingScore: { type: Number, default: 85 },
      policeEmergencyAccessScore: { type: Number, default: 80 },
      terrainWeatherRiskScore: { type: Number, default: 85 },
    },
    incidentHistoryCount: {
      type: Number,
      default: 0,
    },
    lastEvaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

safetyMetricSchema.index({ location: '2dsphere' });
safetyMetricSchema.index({ currentSafetyScore: -1 });

module.exports = mongoose.model('SafetyMetric', safetyMetricSchema);
