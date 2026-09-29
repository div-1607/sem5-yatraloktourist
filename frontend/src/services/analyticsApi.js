import api from './api';

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  logEvent: (eventType, metadata = {}, destinationId = null) =>
    api.post('/analytics/event', { eventType, metadata, destinationId }),
};

export default analyticsApi;
