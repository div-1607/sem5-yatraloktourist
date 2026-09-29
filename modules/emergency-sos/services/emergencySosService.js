const EmergencyAlert = require('../models/EmergencyAlert');
const Geofence = require('../../geofencing/models/Geofence');
const geofenceService = require('../../geofencing/services/geofenceService');

class EmergencySosService {
  /**
   * Trigger SOS (manual or geofence auto-breach)
   */
  async triggerAlert(userId, data) {
    const { latitude, longitude, alertType = 'MANUAL_PANIC', message, address = '' } = data;
    const lat = Number(latitude);
    const lon = Number(longitude);

    // Identify if the alert happens inside or close to any geofence
    let matchedGeofence = null;
    const geofences = await Geofence.find({ isActive: true });

    for (const fence of geofences) {
      const [fenceLon, fenceLat] = fence.center.coordinates;
      // Use Haversine
      const R = 6371000;
      const dLat = ((lat - fenceLat) * Math.PI) / 180;
      const dLon = ((lon - fenceLon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((fenceLat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

      if (dist <= fence.radiusMeters) {
        matchedGeofence = fence;
        break;
      }
    }

    const severity =
      alertType === 'MEDICAL_EMERGENCY' || alertType === 'GEOFENCE_BREACH' || alertType === 'MANUAL_PANIC'
        ? 'CRITICAL'
        : 'HIGH';

    const responders = [
      { name: 'Local Police Dispatch (112)', role: 'Police Authority' },
      { name: 'YatraLok Emergency Command Center', role: 'HQ Operator' },
      { name: 'Nearest Tourist Police Unit', role: 'Field Patrol' },
    ];

    const alert = await EmergencyAlert.create({
      userId,
      location: {
        type: 'Point',
        coordinates: [lon, lat],
        address: address || (matchedGeofence ? `Near ${matchedGeofence.name}` : `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`),
      },
      geofenceId: matchedGeofence ? matchedGeofence._id : null,
      geofenceName: matchedGeofence ? matchedGeofence.name : null,
      alertType,
      severity,
      status: 'ACTIVE',
      message: message || `EMERGENCY ALERT triggered at ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      respondersNotified: responders,
    });

    return alert;
  }

  /**
   * Get active alerts for admin command center
   */
  async getActiveAlerts() {
    return EmergencyAlert.find({ status: { $in: ['ACTIVE', 'RESPONDER_DISPATCHED'] } })
      .populate('userId', 'name email phone avatar emergencyContact')
      .populate('geofenceId', 'name category alertLevel')
      .sort({ createdAt: -1 });
  }

  /**
   * Get all emergency alerts with filters
   */
  async getAllAlerts(filter = {}) {
    return EmergencyAlert.find(filter)
      .populate('userId', 'name email phone')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
  }

  /**
   * Update SOS status (e.g. dispatch responders or resolve)
   */
  async updateStatus(alertId, status, responderNotes = '', resolvedByUserId = null) {
    const update = { status };
    if (responderNotes) {
      update.resolutionNotes = responderNotes;
    }
    if (status === 'RESOLVED' || status === 'FALSE_ALARM') {
      update.resolvedAt = new Date();
      if (resolvedByUserId) update.resolvedBy = resolvedByUserId;
    }

    return EmergencyAlert.findByIdAndUpdate(alertId, update, { new: true });
  }
}

module.exports = new EmergencySosService();
