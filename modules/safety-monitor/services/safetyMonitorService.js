const SafetyMetric = require('../models/SafetyMetric');
const HighRiskZone = require('../models/HighRiskZone');
const Destination = require('../../../backend/src/models/Destination');
const mlBridge = require('../../machine-learning/services/mlBridge');

class SafetyMonitorService {
  /**
   * Calculate real-time safety score for a destination or location
   */
  async calculateSafetyScore({ destinationId, crowdLevel = 'MEDIUM', localIncidents = 0, hour = null, lat = null, lon = null }) {
    const currentHour = hour !== null ? hour : new Date().getHours();
    
    // Check if we can delegate to ML engine or use algorithmic formula
    try {
      const mlResult = await mlBridge.predictSafetyScore({
        crowdLevel,
        localIncidents,
        hour: currentHour,
        lat: lat || 28.6139,
        lon: lon || 77.2090,
      });

      if (mlResult && mlResult.safetyScore !== undefined) {
        return mlResult;
      }
    } catch (err) {
      // Fallback to internal scoring algorithm
    }

    // Formula:
    // Base 95
    let score = 95;

    // Crowd factor:
    // Low crowd (night) = slight risk of isolation (-10 if hour < 6 or > 21)
    // High crowd = risk of stampede/theft (-18)
    // Medium crowd = safest crowd state (+0)
    let crowdScore = 90;
    if (crowdLevel === 'HIGH' || crowdLevel === 'Red') {
      crowdScore = 72;
      score -= 15;
    } else if (crowdLevel === 'LOW' && (currentHour >= 22 || currentHour <= 5)) {
      crowdScore = 75;
      score -= 12;
    } else {
      crowdScore = 92;
    }

    // Incident history impact
    const incidentPenalty = Math.min(localIncidents * 7, 30);
    score -= incidentPenalty;
    const incidentScore = Math.max(100 - incidentPenalty * 2, 40);

    // Time/lighting factor (late night 22:00 - 05:00 reduces safety)
    let timeLightingScore = 95;
    if (currentHour >= 23 || currentHour <= 4) {
      timeLightingScore = 65;
      score -= 14;
    } else if (currentHour >= 20 || currentHour <= 6) {
      timeLightingScore = 78;
      score -= 7;
    }

    const finalScore = Math.max(25, Math.min(100, Math.round(score)));

    let tier = 'OPTIMAL';
    if (finalScore < 50) tier = 'HAZARDOUS';
    else if (finalScore < 70) tier = 'CAUTION';
    else if (finalScore < 85) tier = 'MODERATE';

    return {
      safetyScore: finalScore,
      safetyTier: tier,
      metricsBreakdown: {
        crowdSafetyScore: crowdScore,
        incidentRiskScore: incidentScore,
        timeLightingScore: timeLightingScore,
        policeEmergencyAccessScore: 84,
        terrainWeatherRiskScore: 88,
      },
      evaluationHour: currentHour,
      recommendations: this.generateSafetyAdvisories(tier, currentHour, crowdLevel),
    };
  }

  generateSafetyAdvisories(tier, hour, crowd) {
    const advisories = [];
    if (tier === 'HAZARDOUS') {
      advisories.push('High-risk alert: Travel in verified tourist groups and stay on illuminated main walkways.');
      advisories.push('Keep emergency SOS quick-trigger ready in the app.');
    } else if (tier === 'CAUTION') {
      advisories.push('Moderate caution: Watch personal belongings in dense crowd corridors.');
    }

    if (hour >= 21 || hour <= 5) {
      advisories.push('Night Advisory: Prefer registered taxi pickups and avoid unlit shortcut alleys.');
    }

    if (crowd === 'HIGH') {
      advisories.push('Crowd Alert: Bottlenecks reported near main entrance gate.');
    }

    if (advisories.length === 0) {
      advisories.push('Safe environment: Normal tourist vigilance recommended.');
    }

    return advisories;
  }

  /**
   * Get safety heatmap points for map visualization
   */
  async getSafetyHeatmap() {
    const destinations = await Destination.find().select('title location state city currentSafetyScore currentCrowdStatus').limit(60);
    const zones = await HighRiskZone.find({ isActive: true });

    const heatmap = [];

    for (const d of destinations) {
      const lat = d.location && d.location.coordinates ? d.location.coordinates[1] : 28.6139;
      const lon = d.location && d.location.coordinates ? d.location.coordinates[0] : 77.2090;
      
      const evalData = await this.calculateSafetyScore({
        destinationId: d._id,
        crowdLevel: d.currentCrowdStatus || 'MEDIUM',
        lat,
        lon,
      });

      heatmap.push({
        id: d._id,
        name: d.title,
        city: d.city,
        state: d.state,
        coordinates: [lon, lat],
        safetyScore: evalData.safetyScore,
        safetyTier: evalData.safetyTier,
        crowdLevel: d.currentCrowdStatus || 'MEDIUM',
        type: 'destination',
      });
    }

    for (const z of zones) {
      heatmap.push({
        id: z._id,
        name: z.title,
        coordinates: z.center.coordinates,
        radiusMeters: z.radiusMeters,
        safetyScore: z.riskLevel === 'SEVERE' ? 25 : z.riskLevel === 'HIGH' ? 40 : 60,
        safetyTier: 'HAZARDOUS',
        riskType: z.riskType,
        advisory: z.advisoryMessage,
        type: 'high_risk_zone',
      });
    }

    return heatmap;
  }

  /**
   * Get all high-risk hazard zones
   */
  async getHighRiskZones() {
    return HighRiskZone.find({ isActive: true });
  }

  /**
   * Create a high-risk zone
   */
  async createHighRiskZone(data) {
    return HighRiskZone.create(data);
  }
}

module.exports = new SafetyMonitorService();
