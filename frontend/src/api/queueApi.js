import apiClient from './client';

export const queueApi = {
  getPublic: (serviceId) => apiClient.get(`/services/${serviceId}/queue`),
  join: (serviceId, data) => apiClient.post(`/services/${serviceId}/queue/join`, data),
  getManage: (serviceId) => apiClient.get(`/services/${serviceId}/queue/manage`),
  open: (serviceId) => apiClient.post(`/services/${serviceId}/queue/open`),
  close: (serviceId) => apiClient.post(`/services/${serviceId}/queue/close`),
  callNext: (serviceId) => apiClient.post(`/services/${serviceId}/queue/call-next`),
};
