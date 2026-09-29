const Location = require('../models/Location');
const Zone = require('../models/Zone');
const Trip = require('../models/Trip');

/**
 * Calculate Haversine distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Check if tourist is inside any geofence zone
 */
async function checkGeofenceZones(latitude, longitude) {
  try {
    const nearbyZones = await Zone.find({
      isActive: true,
      center: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000,
        },
      },
    }).limit(20);

    const insideZones = [];
    const nearbyAlerts = [];

    for (const zone of nearbyZones) {
      const distance = haversineDistance(
        latitude,
        longitude,
        zone.center.coordinates[1],
        zone.center.coordinates[0]
      );

      if (distance <= zone.radius) {
        insideZones.push({
          zone,
          distance: Math.round(distance),
          isInside: true,
        });
      } else if (distance <= zone.radius * 1.5) {
        nearbyAlerts.push({
          zone,
          distance: Math.round(distance),
          isApproaching: true,
        });
      }
    }

    return { insideZones, nearbyAlerts };
  } catch (error) {
    console.error('[GeoService] Zone check error:', error.message);
    return { insideZones: [], nearbyAlerts: [] };
  }
}

/**
 * Update trip distance from location trail
 */
async function updateTripDistance(userId, tripId) {
  try {
    const locations = await Location.find({
      user: userId,
      trip: tripId,
    }).sort({ createdAt: 1 });

    let totalDistanceM = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistanceM += haversineDistance(
        locations[i - 1].latitude,
        locations[i - 1].longitude,
        locations[i].latitude,
        locations[i].longitude
      );
    }

    await Trip.findByIdAndUpdate(tripId, {
      totalDistanceKm: totalDistanceM / 1000,
    });

    return totalDistanceM / 1000;
  } catch (error) {
    console.error('[GeoService] Trip distance error:', error.message);
    return 0;
  }
}

/**
 * Get tourist movement speed analysis
 */
async function analyzeMovementSpeed(userId, minutesBack = 30) {
  try {
    const since = new Date(Date.now() - minutesBack * 60 * 1000);
    const locations = await Location.find({
      user: userId,
      createdAt: { $gte: since },
    }).sort({ createdAt: 1 });

    if (locations.length < 2) {
      return { avgSpeed: 0, maxSpeed: 0, isMoving: false, dataPoints: locations.length };
    }

    let totalSpeed = 0;
    let maxSpeed = 0;
    let speeds = [];

    for (let i = 1; i < locations.length; i++) {
      const dist = haversineDistance(
        locations[i - 1].latitude,
        locations[i - 1].longitude,
        locations[i].latitude,
        locations[i].longitude
      );
      const timeDiffS = (locations[i].createdAt - locations[i - 1].createdAt) / 1000;
      if (timeDiffS > 0) {
        const speedMps = dist / timeDiffS;
        speeds.push(speedMps);
        totalSpeed += speedMps;
        if (speedMps > maxSpeed) maxSpeed = speedMps;
      }
    }

    const avgSpeed = speeds.length > 0 ? totalSpeed / speeds.length : 0;

    return {
      avgSpeedKmh: (avgSpeed * 3.6).toFixed(2),
      maxSpeedKmh: (maxSpeed * 3.6).toFixed(2),
      isMoving: avgSpeed > 0.5, // > 0.5 m/s = moving
      dataPoints: locations.length,
    };
  } catch (error) {
    console.error('[GeoService] Speed analysis error:', error.message);
    return { avgSpeedKmh: 0, maxSpeedKmh: 0, isMoving: false, dataPoints: 0 };
  }
}

module.exports = {
  haversineDistance,
  checkGeofenceZones,
  updateTripDistance,
  analyzeMovementSpeed,
};
