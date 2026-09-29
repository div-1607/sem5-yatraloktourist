const LocationLog = require('../models/LocationLog');
const TouristMovement = require('../models/TouristMovement');
const geofenceService = require('../../geofencing/services/geofenceService');

class TrackingService {
  /**
   * Record tourist real-time GPS coordinate ping, evaluate geofences, and store trail
   */
  async recordLocation(userId, data) {
    const { latitude, longitude, speed = 0, heading = 0, accuracy = 10, batteryLevel = 100 } = data;
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Valid latitude and longitude are required');
    }

    // 1. Process geofencing detection
    const geofenceResult = await geofenceService.processLocationPing(userId, lat, lon);
    const activeZone = geofenceResult.activeZonesInside[0] || null;

    // 2. Save granular location log
    const log = await LocationLog.create({
      userId,
      location: { type: 'Point', coordinates: [lon, lat] },
      accuracy,
      speed,
      heading,
      batteryLevel,
      currentGeofenceName: activeZone ? activeZone.name : null,
      recordedAt: new Date(),
    });

    // 3. Update or create TouristMovement state and breadcrumb trail
    let movement = await TouristMovement.findOne({ userId });
    if (!movement) {
      movement = new TouristMovement({
        userId,
        lastCoordinates: [lon, lat],
        currentSpeed: speed,
        heading,
        isOnline: true,
        totalDistanceTraveledKm: 0,
        currentGeofenceId: activeZone ? activeZone.id : null,
        currentGeofenceName: activeZone ? activeZone.name : null,
        breadcrumbs: [{ coordinates: [lon, lat], timestamp: new Date(), speed }],
        lastPingAt: new Date(),
      });
    } else {
      // Calculate incremental distance if last coordinates exist
      const [prevLon, prevLat] = movement.lastCoordinates;
      const R = 6371; // km
      const dLat = ((lat - prevLat) * Math.PI) / 180;
      const dLon = ((lon - prevLon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prevLat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const deltaKm = R * c;

      movement.lastCoordinates = [lon, lat];
      movement.currentSpeed = speed;
      movement.heading = heading;
      movement.isOnline = true;
      if (deltaKm > 0.005 && deltaKm < 150) {
        movement.totalDistanceTraveledKm = +(movement.totalDistanceTraveledKm + deltaKm).toFixed(3);
      }
      movement.currentGeofenceId = activeZone ? activeZone.id : null;
      movement.currentGeofenceName = activeZone ? activeZone.name : null;
      movement.lastPingAt = new Date();

      // Keep recent breadcrumbs (limit to last 60 points)
      movement.breadcrumbs.push({
        coordinates: [lon, lat],
        timestamp: new Date(),
        speed,
      });
      if (movement.breadcrumbs.length > 60) {
        movement.breadcrumbs.shift();
      }
    }
    await movement.save();

    return {
      logId: log._id,
      movement: {
        lastCoordinates: movement.lastCoordinates,
        speed: movement.currentSpeed,
        totalDistanceKm: movement.totalDistanceTraveledKm,
        currentZone: movement.currentGeofenceName,
      },
      geofenceAlerts: geofenceResult.triggeredEvents,
      highRiskWarning: geofenceResult.highRiskWarning,
      nearbyAttractions: geofenceResult.nearbyAttractions,
    };
  }

  /**
   * Get location history for a specific user
   */
  async getLocationHistory(userId, limit = 50) {
    return LocationLog.find({ userId })
      .sort({ recordedAt: -1 })
      .limit(Number(limit));
  }

  /**
   * Get current movement breadcrumb trail for a user
   */
  async getMovementTrail(userId) {
    const movement = await TouristMovement.findOne({ userId });
    return movement ? movement.breadcrumbs : [];
  }

  /**
   * Admin: Get all currently active tourists in real-time
   */
  async getActiveTourists() {
    // Active within last 30 minutes
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    return TouristMovement.find({ lastPingAt: { $gte: cutoff } })
      .populate('userId', 'name email phone avatar role')
      .sort({ lastPingAt: -1 });
  }
}

module.exports = new TrackingService();
