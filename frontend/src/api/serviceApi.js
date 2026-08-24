import apiClient from './client';

export const serviceApi = {
  getByOrg: (organizationId) => apiClient.get(`/organizations/${organizationId}/services`),
  getById: (serviceId) => apiClient.get(`/services/${serviceId}`),
  create: (organizationId, data) => apiClient.post(`/organizations/${organizationId}/services`, data),
  update: (serviceId, data) => apiClient.patch(`/services/${serviceId}`, data),
  deactivate: (serviceId) => apiClient.delete(`/services/${serviceId}`),
};
