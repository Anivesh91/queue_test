import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add bearer token header if token is stored in localStorage as fallback
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('queueless_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response.data.data or handle error format { success: false, message: ... }
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    const customError = new Error(message);
    customError.status = error.response?.status || 500;
    customError.errors = error.response?.data?.errors || [];
    return Promise.reject(customError);
  }
);

export default apiClient;
