import api from './api';

export const touristApi = {
  // Tourist profile
  getProfile: () => api.get('/tourists/profile'),
  updateProfile: (data) => api.put('/tourists/profile', data),
  getDigitalId: () => api.get('/tourists/digital-id'),
  toggleFavorite: (destinationId) => api.post(`/tourists/favorites/${destinationId}`),
  getTravelHistory: () => api.get('/tourists/travel-history'),

  // Trips
  createTrip: (tripData) => api.post('/trips', tripData),
  getUserTrips: (params) => api.get('/trips', { params }),
  getTripById: (id) => api.get(`/trips/${id}`),
  updateTrip: (id, tripData) => api.put(`/trips/${id}`, tripData),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  updateTripStatus: (id, status) => api.patch(`/trips/${id}/status`, { status }),
  updateWaypointStatus: (tripId, waypointId, isCompleted) =>
    api.patch(`/trips/${tripId}/waypoints/${waypointId}`, { isCompleted }),

  // Location
  recordPing: (locationData) => api.post('/locations/ping', locationData),
  getLocationHistory: (params) => api.get('/locations/history', { params }),
  getLastKnownLocation: () => api.get('/locations/last'),
  getLocationTrail: (params) => api.get('/locations/trail', { params }),

  // Admin Tourist & Tracking queries
  getNearbyTourists: (params) => api.get('/tourists/nearby', { params }),
  getActiveTouristLocations: (params) => api.get('/locations/admin/active', { params }),
  getAllTripsAdmin: (params) => api.get('/trips/admin/all', { params }),
};

export default touristApi;
