import api from './api';

export const mlApi = {
  // Smart recommendations
  getSmartRecommendations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.age) query.append('age', params.age);
    if (params.interests && params.interests.length) query.append('interests', params.interests.join(','));
    if (params.budgetTier) query.append('budgetTier', params.budgetTier);
    if (params.latitude) query.append('latitude', params.latitude);
    if (params.longitude) query.append('longitude', params.longitude);
    return api.get(`/recommendations/smart?${query.toString()}`);
  },

  // Dynamic personalized feed
  getPersonalizedFeed: () => api.get('/recommendations/feed'),

  // Similar tourists recommendations
  getSimilarTourists: () => api.get('/recommendations/similar-tourists'),

  // Weather-based recommendations
  getWeatherRecommendations: (weather = 'Sunny') =>
    api.get(`/recommendations/weather?weather=${weather}`),

  // User travel preferences
  getPreferences: () => api.get('/recommendations/preferences'),
  updatePreferences: (data) => api.put('/recommendations/preferences', data),

  // Crowd Prediction
  predictDestinationCrowd: (destinationId, data = {}) =>
    api.post(`/crowd-prediction/destination/${destinationId}`, data),

  getCrowdOverview: () => api.get('/crowd-prediction/overview'),

  // Safety Prediction & Heatmap
  getSafetyScore: (data) => api.post('/safety/score', data),
  getSafetyHeatmap: () => api.get('/safety/heatmap'),
  getHighRiskZones: () => api.get('/safety/high-risk-zones'),

  // Direct ML microservice endpoints
  runMLCrowdPredict: (data) => api.post('/ml/predict-crowd', data),
  runMLSafetyPredict: (data) => api.post('/ml/predict-safety', data),
};

export default mlApi;
