import api from './api';

export const incidentApi = {
  reportIncident: (data) => api.post('/incidents', data),
  getMyIncidents: (params) => api.get('/incidents/my', { params }),
  getIncidentById: (id) => api.get(`/incidents/${id}`),

  // Admin
  getAllIncidents: (params) => api.get('/incidents', { params }),
  updateIncident: (id, data) => api.put(`/incidents/${id}`, data),
  addResponseLog: (id, note) => api.post(`/incidents/${id}/response`, { note }),
  deleteIncident: (id) => api.delete(`/incidents/${id}`),
};

export default incidentApi;
