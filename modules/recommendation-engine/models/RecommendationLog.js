const mongoose = require('mongoose');

const recommendationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recommendationType: {
      type: String,
      enum: ['SMART_PROFILE', 'SIMILAR_TOURISTS', 'WEATHER_BASED', 'PERSONALIZED_FEED'],
      required: true,
    },
    recommendedDestinations: [
      {
        destinationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Destination',
          required: true,
        },
        title: String,
        matchScore: Number,
        matchReasons: [String],
      },
    ],
    contextCriteria: {
      age: Number,
      interests: [String],
      budgetTier: String,
      weather: String,
      userLocation: [Number],
    },
  },
  {
    timestamps: true,
  }
);

recommendationLogSchema.index({ userId: 1, createdAt: -1 });
recommendationLogSchema.index({ recommendationType: 1 });

module.exports = mongoose.model('RecommendationLog', recommendationLogSchema);
