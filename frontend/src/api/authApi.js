import apiClient from './client';

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  googleAuth: (data) =>
    apiClient.post('/auth/google', typeof data === 'string' ? { credential: data } : data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
};
