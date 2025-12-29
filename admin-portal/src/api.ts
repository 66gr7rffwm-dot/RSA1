import axios from 'axios';

// Use environment variable for API URL, or default to deployed API
const API_URL = import.meta.env.VITE_API_URL || 'https://carpooling-api-production-36c8.up.railway.app/api';

// Log API URL in development to help debug
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
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
    // Log full error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      message: error.message,
    });
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection and API URL.'));
    }
    
    // Handle 405 Method Not Allowed
    if (error.response?.status === 405) {
      console.error('405 Method Not Allowed - Check API URL and endpoint:', {
        url: error.config?.url,
        fullURL: error.config?.baseURL + error.config?.url,
        method: error.config?.method,
      });
      return Promise.reject(new Error('Method not allowed. Please check API configuration.'));
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
