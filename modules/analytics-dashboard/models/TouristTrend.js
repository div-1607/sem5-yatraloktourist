const mongoose = require('mongoose');

const touristTrendSchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
    },
    destinationName: {
      type: String,
      required: true,
    },
    monthYear: {
      type: String, // e.g. '2026-09'
      required: true,
    },
    visitorCount: {
      type: Number,
      default: 0,
    },
    averageDwellMinutes: {
      type: Number,
      default: 120,
    },
    peakHours: {
      type: [Number],
      default: [11, 16, 17],
    },
    safetyScoreAvg: {
      type: Number,
      default: 88,
    },
  },
  {
    timestamps: true,
  }
);

touristTrendSchema.index({ monthYear: 1, visitorCount: -1 });

module.exports = mongoose.model('TouristTrend', touristTrendSchema);
