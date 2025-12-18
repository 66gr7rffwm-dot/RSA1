import axios from 'axios';

// Use relative path to leverage Vite's proxy in development
// This avoids CORS issues by proxying through the same origin
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      // Only redirect if not on login page
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
