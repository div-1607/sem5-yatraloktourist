const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      default: 26,
    },
    interests: {
      type: [String],
      default: ['Heritage', 'Nature', 'Spiritual', 'Photography'],
    },
    budgetTier: {
      type: String,
      enum: ['budget', 'moderate', 'luxury'],
      default: 'moderate',
    },
    travelPace: {
      type: String,
      enum: ['relaxed', 'moderate', 'fast-paced'],
      default: 'moderate',
    },
    travelHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
      },
    ],
    preferredWeather: {
      type: String,
      default: 'Sunny',
    },
  },
  {
    timestamps: true,
  }
);

userPreferenceSchema.index({ userId: 1 });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
