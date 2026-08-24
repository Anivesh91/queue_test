import apiClient from './client';

export const ticketApi = {
  track: (publicToken) => apiClient.get(`/tickets/${publicToken}`),
  cancel: (publicToken) => apiClient.post(`/tickets/${publicToken}/cancel`),
  start: (ticketId) => apiClient.post(`/tickets/${ticketId}/start`),
  complete: (ticketId) => apiClient.post(`/tickets/${ticketId}/complete`),
  markNoShow: (ticketId) => apiClient.post(`/tickets/${ticketId}/no-show`),
};
