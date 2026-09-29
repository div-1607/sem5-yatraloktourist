import api from './api';

export const geofenceApi = {
  // Get active geofences for map
  getActiveGeofences: () => api.get('/geofencing/active'),

  // Send real-time GPS ping and detect entry/exit
  pingLocation: (latitude, longitude) => api.post('/geofencing/ping', { latitude, longitude }),

  // Discover nearby attractions
  getNearbyAttractions: (lat, lon, radius = 10000) =>
    api.get(`/geofencing/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),

  // Get user's geofence events history
  getMyEvents: () => api.get('/geofencing/events/my'),

  // Record tourist tracking breadcrumb
  recordTracking: (data) => api.post('/tracking/record', data),

  // Get location history
  getLocationHistory: (limit = 50) => api.get(`/tracking/history?limit=${limit}`),

  // Get current breadcrumb trail
  getTrail: () => api.get('/tracking/trail'),

  // Admin: Get all geofences
  adminGetGeofences: () => api.get('/geofencing/admin/list'),

  // Admin: Create geofence
  adminCreateGeofence: (data) => api.post('/geofencing/admin/create', data),

  // Admin: Update geofence
  adminUpdateGeofence: (id, data) => api.put(`/geofencing/admin/${id}`, data),

  // Admin: Delete geofence
  adminDeleteGeofence: (id) => api.delete(`/geofencing/admin/${id}`),

  // Admin: Live active tourists fleet
  adminGetActiveTourists: () => api.get('/tracking/admin/active'),
};

export default geofenceApi;
