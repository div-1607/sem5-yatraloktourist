import api from './api';

export const contactApi = {
  // Public
  getSystemContacts: () => api.get('/contacts/system'),
  getZoneContacts: (zoneId) => api.get(`/contacts/zone/${zoneId}`),

  // Tourist
  getMyContacts: () => api.get('/contacts/my'),
  addContact: (data) => api.post('/contacts', data),
  updateContact: (id, data) => api.put(`/contacts/${id}`, data),
  deleteContact: (id) => api.delete(`/contacts/${id}`),

  // Admin
  createAdminContact: (data) => api.post('/contacts/admin', data),
  getAllContactsAdmin: (params) => api.get('/contacts/admin/all', { params }),
};

export default contactApi;
