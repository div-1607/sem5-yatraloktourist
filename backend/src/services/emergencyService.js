const SOSRequest = require('../models/SOSRequest');
const Incident = require('../models/Incident');
const EmergencyContact = require('../models/EmergencyContact');
const AuditLog = require('../models/AuditLog');
const { EMERGENCY_CONTACTS } = require('../config/constants');

/**
 * Process SOS alert and create related records
 */
async function processSOSAlert(sosData) {
  try {
    const sos = await SOSRequest.create(sosData);

    // Auto-create incident for high-severity SOS
    if (sosData.emergencyType && sosData.emergencyType !== 'General Safety') {
      await Incident.create({
        title: `SOS Alert: ${sosData.emergencyType}`,
        description: sosData.message || 'Emergency SOS triggered by tourist',
        type: mapSOSToIncidentType(sosData.emergencyType),
        severity: 'high',
        location: sosData.location,
        reportedBy: sosData.user,
        relatedSOS: sos._id,
      });
    }

    await AuditLog.log({
      user: sosData.user,
      action: 'sos_triggered',
      category: 'sos',
      description: `SOS Alert: ${sosData.emergencyType} at (${sosData.location?.lat}, ${sosData.location?.lng})`,
      resourceType: 'SOSRequest',
      resourceId: sos._id,
    });

    return sos;
  } catch (error) {
    console.error('[EmergencyService] SOS processing error:', error.message);
    throw error;
  }
}

/**
 * Get relevant emergency contacts for a location
 */
async function getEmergencyContactsForLocation(lat, lng) {
  try {
    // Get system contacts
    const systemContacts = await EmergencyContact.find({
      category: 'system',
      isActive: true,
    }).sort({ isPriority: -1 });

    // Fallback to constants
    if (systemContacts.length === 0) {
      return EMERGENCY_CONTACTS.map((c) => ({
        name: c.name,
        phone: c.number,
        type: c.type,
        category: 'system',
      }));
    }

    return systemContacts;
  } catch (error) {
    console.error('[EmergencyService] Contact fetch error:', error.message);
    return EMERGENCY_CONTACTS;
  }
}

/**
 * Map SOS type to incident type
 */
function mapSOSToIncidentType(emergencyType) {
  const mapping = {
    'Medical Emergency': 'medical',
    'Safety Threat': 'harassment',
    'Natural Disaster': 'natural-disaster',
    'Lost/Stranded': 'lost-tourist',
    'Theft/Crime': 'theft',
    'Fire': 'fire',
    'Accident': 'accident',
  };
  return mapping[emergencyType] || 'other';
}

/**
 * Get SOS statistics
 */
async function getSOSStats() {
  try {
    const stats = await SOSRequest.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          byType: [
            { $group: { _id: '$emergencyType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                emergencyType: 1,
                status: 1,
                location: 1,
                createdAt: 1,
                userName: 1,
              },
            },
          ],
        },
      },
    ]);

    return stats[0];
  } catch (error) {
    console.error('[EmergencyService] Stats error:', error.message);
    return { byStatus: [], byType: [], recent: [] };
  }
}

module.exports = {
  processSOSAlert,
  getEmergencyContactsForLocation,
  getSOSStats,
  mapSOSToIncidentType,
};
