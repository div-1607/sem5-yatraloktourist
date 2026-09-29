const Geofence = require('../models/Geofence');
const GeofenceEvent = require('../models/GeofenceEvent');

/**
 * Calculate Haversine distance in meters between two [lat, lng] points
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

class GeofenceService {
  /**
   * Process a tourist location ping and detect zone entries, exits, and breaches
   */
  async processLocationPing(userId, latitude, longitude) {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Valid latitude and longitude numbers are required');
    }

    const activeGeofences = await Geofence.find({ isActive: true });
    const currentInsideGeofenceIds = [];
    const triggeredEvents = [];
    const nearbyAttractions = [];
    let highRiskWarning = null;

    // Fetch the user's latest recorded events to understand previous state
    const recentEvents = await GeofenceEvent.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);

    const previouslyInsideMap = new Map();
    for (const evt of recentEvents) {
      if (!previouslyInsideMap.has(evt.geofenceId.toString())) {
        previouslyInsideMap.set(evt.geofenceId.toString(), evt.eventType === 'ENTRY');
      }
    }

    for (const fence of activeGeofences) {
      const [fenceLon, fenceLat] = fence.center.coordinates;
      const distance = calculateDistanceMeters(lat, lon, fenceLat, fenceLon);
      const isInside = distance <= fence.radiusMeters;

      const wasInside = previouslyInsideMap.get(fence._id.toString()) || false;

      if (isInside) {
        currentInsideGeofenceIds.push(fence);

        if (!wasInside) {
          // Tourist just entered the geofence
          let eventType = 'ENTRY';
          let alertLevel = fence.alertLevel || 'info';

          if (fence.category === 'high-risk' || fence.category === 'restricted') {
            eventType = 'BREACH_RESTRICTED';
            alertLevel = 'danger';
            highRiskWarning = {
              fenceId: fence._id,
              name: fence.name,
              message: fence.highRiskAdvisory || `Warning! You have entered high-risk zone: ${fence.name}`,
              alertLevel,
            };
          }

          const event = await GeofenceEvent.create({
            geofenceId: fence._id,
            userId,
            eventType,
            location: { coordinates: [lon, lat] },
            distanceFromCenterMeters: distance,
            alertLevel,
            notificationSent: true,
            notificationTitle:
              eventType === 'BREACH_RESTRICTED'
                ? `🚨 DANGER: Entered Restricted Zone - ${fence.name}`
                : `📍 Entered Zone: ${fence.name}`,
            notificationBody:
              fence.highRiskAdvisory || fence.entryNotificationMessage || `You entered ${fence.name}`,
          });

          await Geofence.findByIdAndUpdate(fence._id, { $inc: { activeTouristsCount: 1 } });
          triggeredEvents.push(event);
        } else {
          // Tourist continues dwelling inside
          if (fence.category === 'high-risk' || fence.category === 'restricted') {
            highRiskWarning = {
              fenceId: fence._id,
              name: fence.name,
              message: fence.highRiskAdvisory || `Stay alert inside ${fence.name}`,
              alertLevel: 'danger',
            };
          }
        }
      } else {
        if (wasInside) {
          // Tourist exited the geofence
          const event = await GeofenceEvent.create({
            geofenceId: fence._id,
            userId,
            eventType: 'EXIT',
            location: { coordinates: [lon, lat] },
            distanceFromCenterMeters: distance,
            alertLevel: 'info',
            notificationSent: true,
            notificationTitle: `👋 Exited Zone: ${fence.name}`,
            notificationBody: fence.exitNotificationMessage || `You have left ${fence.name}`,
          });

          await Geofence.findByIdAndUpdate(fence._id, {
            $inc: { activeTouristsCount: -1 },
          });
          triggeredEvents.push(event);
        }

        // Proximity detection: within 2.5x radius or 1500m
        if (distance <= Math.max(fence.radiusMeters * 2.5, 1500)) {
          if (fence.category === 'attraction') {
            nearbyAttractions.push({
              geofenceId: fence._id,
              name: fence.name,
              distanceMeters: distance,
              category: fence.category,
              coordinates: [fenceLon, fenceLat],
            });
          } else if (fence.category === 'high-risk' && distance <= fence.radiusMeters + 300) {
            // Approaching high-risk zone
            if (!highRiskWarning) {
              highRiskWarning = {
                fenceId: fence._id,
                name: fence.name,
                message: `Caution: You are within ${distance}m of high-risk zone '${fence.name}'`,
                alertLevel: 'warning',
              };
            }
          }
        }
      }
    }

    // Sort nearby attractions by distance ascending
    nearbyAttractions.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return {
      currentLocation: { latitude: lat, longitude: lon },
      activeZonesInside: currentInsideGeofenceIds.map((f) => ({
        id: f._id,
        name: f.name,
        category: f.category,
        radiusMeters: f.radiusMeters,
        alertLevel: f.alertLevel,
      })),
      triggeredEvents,
      highRiskWarning,
      nearbyAttractions: nearbyAttractions.slice(0, 10),
    };
  }

  /**
   * Find nearby attractions within given search radius (default 10,000m)
   */
  async findNearbyAttractions(lat, lon, maxRadiusMeters = 10000) {
    const geofences = await Geofence.find({
      isActive: true,
      category: 'attraction',
    });

    const results = [];
    for (const fence of geofences) {
      const [fenceLon, fenceLat] = fence.center.coordinates;
      const dist = calculateDistanceMeters(Number(lat), Number(lon), fenceLat, fenceLon);
      if (dist <= maxRadiusMeters) {
        results.push({
          id: fence._id,
          name: fence.name,
          description: fence.description,
          distanceMeters: dist,
          distanceKm: (dist / 1000).toFixed(2),
          coordinates: [fenceLon, fenceLat],
          radiusMeters: fence.radiusMeters,
          activeTouristsCount: fence.activeTouristsCount,
        });
      }
    }

    return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  /**
   * Admin: Get all geofences with active tourist telemetry
   */
  async getAllGeofences(filters = {}) {
    return Geofence.find(filters).sort({ createdAt: -1 });
  }

  /**
   * Admin: Create a new geofence
   */
  async createGeofence(data, creatorUserId) {
    const { name, description, category, latitude, longitude, radiusMeters, alertLevel, entryNotificationMessage, exitNotificationMessage, highRiskAdvisory, maxCapacity } = data;
    return Geofence.create({
      name,
      description,
      category: category || 'attraction',
      center: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
      radiusMeters: Number(radiusMeters) || 500,
      alertLevel: alertLevel || 'info',
      entryNotificationMessage,
      exitNotificationMessage,
      highRiskAdvisory,
      maxCapacity: Number(maxCapacity) || 500,
      createdBy: creatorUserId,
    });
  }

  /**
   * Admin: Update geofence
   */
  async updateGeofence(id, updates) {
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      updates.center = {
        type: 'Point',
        coordinates: [Number(updates.longitude), Number(updates.latitude)],
      };
      delete updates.latitude;
      delete updates.longitude;
    }
    return Geofence.findByIdAndUpdate(id, updates, { new: true });
  }

  /**
   * Admin: Delete geofence
   */
  async deleteGeofence(id) {
    return Geofence.findByIdAndDelete(id);
  }
}

module.exports = new GeofenceService();
