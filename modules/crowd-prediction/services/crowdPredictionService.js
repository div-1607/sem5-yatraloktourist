const CrowdPrediction = require('../models/CrowdPrediction');
const Destination = require('../../../backend/src/models/Destination');
const mlBridge = require('../../machine-learning/services/mlBridge');

class CrowdPredictionService {
  /**
   * Predict crowd for a destination at a given hour or current time
   */
  async predictForDestination(destinationId, options = {}) {
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new Error('Destination not found');
    }

    const now = new Date();
    const targetHour = options.hour !== undefined ? parseInt(options.hour, 10) : now.getHours();
    const dayOfWeek = options.dayOfWeek !== undefined ? parseInt(options.dayOfWeek, 10) : now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const season = options.season || this.determineSeason(now.getMonth());
    const isFestival = Boolean(options.isFestival || false);
    const festivalName = options.festivalName || (isFestival ? 'Special Cultural Festival' : null);

    // Call ML prediction bridge
    const mlResult = await mlBridge.predictCrowd({
      hour: targetHour,
      isWeekend,
      season,
      isFestival,
      tempC: options.tempC || 26,
      basePopularity: Math.round((destination.averageRating || 4.2) * 2),
    });

    // Generate 24-hour forecast curve
    const hourlyForecast = [];
    let bestLowHour = 8;
    let minScore = 100;

    for (let h = 0; h < 24; h++) {
      let hScore = (destination.averageRating || 4.2) * 5 + (isWeekend ? 20 : 0) + (isFestival ? 30 : 0);
      if ((h >= 10 && h <= 12) || (h >= 16 && h <= 19)) hScore += 30;
      if (h >= 23 || h <= 5) hScore -= 35;
      hScore = Math.max(15, Math.min(98, Math.round(hScore)));

      let hLevel = 'MEDIUM';
      let hColor = 'Yellow';
      if (hScore < 45) {
        hLevel = 'LOW';
        hColor = 'Green';
      } else if (hScore >= 72) {
        hLevel = 'HIGH';
        hColor = 'Red';
      }

      if (hScore < minScore && h >= 6 && h <= 20) {
        minScore = hScore;
        bestLowHour = h;
      }

      hourlyForecast.push({
        hour: h,
        predictedCrowdLevel: hLevel,
        statusColor: hColor,
        crowdScore: hScore,
      });
    }

    const windowStart = `${bestLowHour.toString().padStart(2, '0')}:00`;
    const windowEnd = `${(bestLowHour + 2).toString().padStart(2, '0')}:30`;
    const recommendedVisitWindow = `${windowStart} - ${windowEnd} (Low Footfall)`;

    // Save record to separate MongoDB collection
    const record = await CrowdPrediction.create({
      destinationId: destination._id,
      destinationTitle: destination.title,
      predictedCrowdLevel: mlResult.predictedCrowdLevel,
      statusColor: mlResult.statusColor,
      crowdScore: mlResult.crowdScore,
      confidenceScore: mlResult.confidenceScore,
      forecastHour: targetHour,
      season,
      isWeekend,
      isFestival,
      festivalName,
      hourlyForecast,
      recommendedVisitWindow,
    });

    return record;
  }

  /**
   * Helper: determine season in India
   */
  determineSeason(month) {
    // 0: Jan, 1: Feb, 2: Mar, 3: Apr, 4: May, 5: Jun, 6: Jul, 7: Aug, 8: Sep, 9: Oct, 10: Nov, 11: Dec
    if (month >= 11 || month <= 1) return 'winter';
    if (month >= 2 && month <= 5) return 'summer';
    if (month >= 6 && month <= 8) return 'monsoon';
    return 'autumn';
  }

  /**
   * Get latest crowd predictions for all destinations
   */
  async getLatestOverview() {
    const destinations = await Destination.find().select('title city state category currentCrowdStatus images averageRating').limit(40);
    const now = new Date();
    const currentHour = now.getHours();

    const results = destinations.map((d) => {
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      let score = 50 + (isWeekend ? 20 : 0);
      if ((currentHour >= 10 && currentHour <= 12) || (currentHour >= 16 && currentHour <= 19)) {
        score += 25;
      }
      score = Math.min(95, Math.max(20, score));

      let level = 'MEDIUM';
      let color = 'Yellow';
      if (score < 45) {
        level = 'LOW';
        color = 'Green';
      } else if (score >= 70) {
        level = 'HIGH';
        color = 'Red';
      }

      return {
        id: d._id,
        title: d.title,
        city: d.city,
        state: d.state,
        image: d.images && d.images[0] ? d.images[0] : null,
        predictedCrowdLevel: level,
        statusColor: color,
        crowdScore: score,
        hour: currentHour,
      };
    });

    return results;
  }
}

module.exports = new CrowdPredictionService();
