/**
 * Yatra Lok Constants
 */
const CATEGORIES = [
  'Tourist Places',
  'Temples',
  'Historical Places',
  'Shopping Areas',
  'Old Towns',
  'Beaches',
  'Airports',
  'Cafes & Restaurants',
  'Hill Stations'
];

const CROWD_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high'
};

const USER_ROLES = {
  TOURIST: 'tourist',
  ADMIN: 'admin'
};

const EMERGENCY_CONTACTS = [
  { name: 'National Emergency', number: '112', type: 'Police/Fire/Ambulance' },
  { name: 'Tourist Helpline', number: '1363', type: 'Tourism Assistance' },
  { name: 'Police Control Room', number: '100', type: 'Police' },
  { name: 'Ambulance Support', number: '108', type: 'Medical' },
  { name: 'Women Safety Helpline', number: '1091', type: 'Safety' },
  { name: 'Disaster Management', number: '1078', type: 'Disaster' }
];

module.exports = {
  CATEGORIES,
  CROWD_LEVELS,
  USER_ROLES,
  EMERGENCY_CONTACTS
};
