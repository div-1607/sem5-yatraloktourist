const mongoose = require('mongoose');

const crowdPredictionSchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
    },
    destinationTitle: {
      type: String,
      required: true,
    },
    predictedCrowdLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true,
    },
    statusColor: {
      type: String,
      enum: ['Green', 'Yellow', 'Red'],
      required: true,
    },
    crowdScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.85,
    },
    forecastHour: {
      type: Number,
      min: 0,
      max: 23,
      required: true,
    },
    season: {
      type: String,
      default: 'winter',
    },
    isWeekend: {
      type: Boolean,
      default: false,
    },
    isFestival: {
      type: Boolean,
      default: false,
    },
    festivalName: {
      type: String,
      default: null,
    },
    hourlyForecast: [
      {
        hour: Number,
        predictedCrowdLevel: String,
        statusColor: String,
        crowdScore: Number,
      },
    ],
    recommendedVisitWindow: {
      type: String,
      default: '07:00 AM - 09:30 AM',
    },
  },
  {
    timestamps: true,
  }
);

crowdPredictionSchema.index({ destinationId: 1, forecastHour: 1, createdAt: -1 });

module.exports = mongoose.model('CrowdPrediction', crowdPredictionSchema);
