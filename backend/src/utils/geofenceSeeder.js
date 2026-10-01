const mongoose = require('mongoose');
const Geofence = require('../../../modules/geofencing/models/Geofence');
const HighRiskZone = require('../../../modules/safety-monitor/models/HighRiskZone');

const initialGeofences = [
  {
    name: 'Taj Mahal Monument Heritage Safe Zone',
    description: 'Protected UNESCO World Heritage perimeter with tourist assistance booths, strict security, and golf carts.',
    category: 'attraction',
    center: { type: 'Point', coordinates: [78.0421, 27.1751] },
    radiusMeters: 650,
    alertLevel: 'info',
    entryNotificationMessage: 'Welcome to Taj Mahal! Please have your entry QR code and photo ID ready.',
    exitNotificationMessage: 'You have exited the Taj Mahal monument perimeter.',
    maxCapacity: 1200,
    activeTouristsCount: 142,
  },
  {
    name: 'Varanasi Dashashwamedh Ghat Ganga Aarti Zone',
    description: 'High footfall cultural riverfront ghat with evening ceremonial gathering and boat boarding.',
    category: 'attraction',
    center: { type: 'Point', coordinates: [83.0107, 25.3076] },
    radiusMeters: 450,
    alertLevel: 'info',
    entryNotificationMessage: 'Welcome to Dashashwamedh Ghat. The Maha Aarti begins at 6:45 PM.',
    exitNotificationMessage: 'You have left Dashashwamedh Ghat.',
    maxCapacity: 2500,
    activeTouristsCount: 380,
  },
  {
    name: 'Baga Beach High-Risk Rip Current Zone',
    description: 'Hazardous coastal sector prone to undertow currents and sudden drop-offs. No swimming permitted.',
    category: 'high-risk',
    center: { type: 'Point', coordinates: [73.7517, 15.5553] },
    radiusMeters: 380,
    alertLevel: 'danger',
    entryNotificationMessage: 'DANGER: You entered the Baga Beach Rip-Current Zone! Swimming is strictly prohibited.',
    exitNotificationMessage: 'You are now clear of the coastal hazard zone.',
    highRiskAdvisory: 'Life-threatening rip currents observed. Please retreat to patrolled lifeguard zones immediately.',
    maxCapacity: 100,
    activeTouristsCount: 12,
  },
  {
    name: 'Rohtang Pass Steep Cliff & Avalanche Corridor',
    description: 'High-altitude Himalayan pass with extreme weather swings and sheer cliff drops.',
    category: 'restricted',
    center: { type: 'Point', coordinates: [77.2466, 32.3716] },
    radiusMeters: 1200,
    alertLevel: 'critical',
    entryNotificationMessage: 'RESTRICTED ZONE: Active landslide / icy road advisory on Rohtang pass route.',
    exitNotificationMessage: 'Exited Rohtang Pass risk corridor.',
    highRiskAdvisory: 'Check weather conditions and follow local safety instructions.',
    maxCapacity: 300,
    activeTouristsCount: 45,
  },
  {
    name: 'Amber Palace Royal Courtyard Safe Buffer',
    description: 'Hilltop fort complex in Amer, Jaipur with verified audio guides and shuttle connectivity.',
    category: 'safe-zone',
    center: { type: 'Point', coordinates: [75.8513, 26.9855] },
    radiusMeters: 800,
    alertLevel: 'info',
    entryNotificationMessage: 'Welcome to Amber Palace. Emergency tourist kiosk is active at the Suraj Pol gate.',
    exitNotificationMessage: 'You have exited Amber Palace grounds.',
    maxCapacity: 1800,
    activeTouristsCount: 220,
  },
  {
    name: 'Old Delhi Chandni Chowk Dense Transit Corridor',
    description: 'Busy historic market corridor with intense pedestrian density and vibrant street food.',
    category: 'transit-hub',
    center: { type: 'Point', coordinates: [77.2309, 28.6562] },
    radiusMeters: 700,
    alertLevel: 'warning',
    entryNotificationMessage: 'Entering Chandni Chowk. Keep valuables secure in crowded pedestrian corridors.',
    exitNotificationMessage: 'Left Chandni Chowk corridor.',
    maxCapacity: 4000,
    activeTouristsCount: 790,
  },
  {
    name: 'Noida Sector 18 Tourism & Smart Corridor Safe Zone',
    description: 'Smart urban tourism and cultural hub in Noida, Uttar Pradesh with 24x7 surveillance and rapid SOS response.',
    category: 'safe-zone',
    center: { type: 'Point', coordinates: [77.3345, 28.5759] },
    radiusMeters: 1400,
    alertLevel: 'info',
    entryNotificationMessage: 'Welcome to Noida Sector 18 Smart Corridor! YatraLok GPS Geofence is active.',
    exitNotificationMessage: 'You have exited the Noida Sector 18 Smart Corridor perimeter.',
    maxCapacity: 3000,
    activeTouristsCount: 168,
  },
];

const initialHazards = [
  {
    title: 'Baga Beach Undertow Rip-Currents',
    riskType: 'RIP_CURRENT',
    center: { type: 'Point', coordinates: [73.7517, 15.5553] },
    radiusMeters: 380,
    riskLevel: 'SEVERE',
    advisoryMessage: 'Strong rip currents reported. Red flags deployed by lifeguards.',
    recommendedAction: 'Stay at least 50 meters away from the water edge.',
  },
  {
    title: 'Manali Solang Valley Steep Ridge',
    riskType: 'STEEP_CLIFF',
    center: { type: 'Point', coordinates: [77.1575, 32.3166] },
    radiusMeters: 500,
    riskLevel: 'HIGH',
    advisoryMessage: 'Unmarked cliff edges beyond viewing deck. Loose shale hazard.',
    recommendedAction: 'Do not hike without licensed mountain guide.',
  },
  {
    title: 'Sundarbans Estuary Wildlife Corridor',
    riskType: 'WILDLIFE_CORRIDOR',
    center: { type: 'Point', coordinates: [88.8535, 21.9497] },
    radiusMeters: 1500,
    riskLevel: 'HIGH',
    advisoryMessage: 'Tiger reserve buffer zone. Strict riverboat curfew enforced from sunset.',
    recommendedAction: 'Never step onto unbarricaded mudflats.',
  },
];

async function seedGeofencesAndHazards() {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error(
        `MongoDB connection is not ready. State: ${mongoose.connection.readyState}`
      );
    }

    console.log('[Geofence Seeder] MongoDB connection ready');

    const existingFences = 0;
    console.log(`[Geofence Seeder] Existing geofences: ${existingFences}`);

    if (existingFences === 0) {
      await Geofence.insertMany(initialGeofences);
      console.log(
        `[Geofence Seeder] Seeded ${initialGeofences.length} geofences.`
      );
    }

    const existingHazards = await HighRiskZone.countDocuments();
    console.log(`[Hazard Seeder] Existing hazards: ${existingHazards}`);

    if (existingHazards === 0) {
      await HighRiskZone.insertMany(initialHazards);
      console.log(
        `[Hazard Seeder] Seeded ${initialHazards.length} high-risk zones.`
      );
    }
  } catch (err) {
    console.error('[Geofence Seeder Error]:', err.message);
  }
}

module.exports = { seedGeofencesAndHazards };