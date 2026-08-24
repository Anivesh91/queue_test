import apiClient from './client';

export const ownerApi = {
  getDashboard: () => apiClient.get('/owner/dashboard'),
};
