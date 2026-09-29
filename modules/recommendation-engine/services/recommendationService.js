const RecommendationLog = require('../models/RecommendationLog');
const UserPreference = require('../models/UserPreference');
const Destination = require('../../../backend/src/models/Destination');
const mlBridge = require('../../machine-learning/services/mlBridge');

class RecommendationService {
  /**
   * Get or create tourist preferences
   */
  async getUserPreferences(userId) {
    let prefs = await UserPreference.findOne({ userId });
    if (!prefs) {
      prefs = await UserPreference.create({
        userId,
        age: 27,
        interests: ['Heritage', 'Nature', 'Photography', 'Culture'],
        budgetTier: 'moderate',
      });
    }
    return prefs;
  }

  /**
   * Update tourist preferences
   */
  async updateUserPreferences(userId, updateData) {
    let prefs = await UserPreference.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );
    return prefs;
  }

  /**
   * 1. Smart Destination Recommendations
   */
  async getSmartRecommendations(userId, queryParams = {}) {
    let prefs = { age: 26, interests: ['Heritage', 'Nature'], budgetTier: 'moderate', travelHistory: [] };
    if (userId) {
      prefs = await this.getUserPreferences(userId);
    }

    const age = queryParams.age !== undefined ? parseInt(queryParams.age, 10) : prefs.age;
    const interests = queryParams.interests ? queryParams.interests.split(',') : prefs.interests;
    const budgetTier = queryParams.budgetTier || prefs.budgetTier;
    const latitude = queryParams.latitude ? parseFloat(queryParams.latitude) : null;
    const longitude = queryParams.longitude ? parseFloat(queryParams.longitude) : null;

    const destinations = await Destination.find().limit(60);

    const mlResults = await mlBridge.getSmartRecommendations({
      age,
      interests,
      budgetTier,
      latitude,
      longitude,
      travelHistory: prefs.travelHistory || [],
      destinations,
    });

    // Log recommendation to separate MongoDB collection
    if (userId && mlResults.length > 0) {
      await RecommendationLog.create({
        userId,
        recommendationType: 'SMART_PROFILE',
        recommendedDestinations: mlResults.slice(0, 10).map((r) => ({
          destinationId: r.destination._id,
          title: r.destination.title,
          matchScore: r.matchScore,
          matchReasons: r.matchReasons,
        })),
        contextCriteria: { age, interests, budgetTier, userLocation: [longitude, latitude] },
      }).catch(() => {});
    }

    return mlResults;
  }

  /**
   * 4. Personalized Tourist Feed (Dynamic based on behavior)
   */
  async getPersonalizedFeed(userId) {
    let prefs = { age: 26, interests: ['Nature', 'Heritage', 'Adventure'], budgetTier: 'moderate' };
    if (userId) {
      prefs = await this.getUserPreferences(userId);
    }

    const destinations = await Destination.find().limit(50);
    const scored = await mlBridge.getSmartRecommendations({
      age: prefs.age,
      interests: prefs.interests,
      budgetTier: prefs.budgetTier,
      travelHistory: prefs.travelHistory || [],
      destinations,
    });

    // Group into dynamic feed sections
    const topPicks = scored.slice(0, 6);
    const hiddenGems = scored.filter((s) => (s.destination.totalReviews || 0) < 30).slice(0, 4);
    const safetyPicks = scored.filter((s) => s.destination.currentSafetyScore >= 88).slice(0, 4);

    return {
      topPicks,
      hiddenGems: hiddenGems.length ? hiddenGems : scored.slice(6, 10),
      safetyPicks: safetyPicks.length ? safetyPicks : scored.slice(4, 8),
      userInterests: prefs.interests,
    };
  }

  /**
   * 5. Similar Tourist Recommendations
   */
  async getSimilarTouristPicks(userId) {
    let prefs = { interests: ['Spiritual', 'Heritage', 'Architecture'] };
    if (userId) {
      prefs = await this.getUserPreferences(userId);
    }

    const destinations = await Destination.find().limit(50);
    return mlBridge.getSimilarTouristRecommendations({
      interests: prefs.interests,
      destinations,
    });
  }

  /**
   * 6. Weather-Based Recommendations
   */
  async getWeatherRecommendations(weatherCondition = 'Sunny') {
    const destinations = await Destination.find().limit(50);
    return mlBridge.getWeatherRecommendations({
      weather: weatherCondition,
      destinations,
    });
  }
}

module.exports = new RecommendationService();
