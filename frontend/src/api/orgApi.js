import apiClient from './client';

export const orgApi = {
  search: (params) => apiClient.get('/organizations', { params }),
  getBySlug: (slug) => apiClient.get(`/organizations/${slug}`),
  getMe: () => apiClient.get('/organizations/me'),
  create: (data) => apiClient.post('/organizations', data),
  update: (organizationId, data) => apiClient.patch(`/organizations/${organizationId}`, data),
};
