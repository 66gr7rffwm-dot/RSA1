import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// Production API URL - Railway deployment
const PRODUCTION_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://carpooling-api-production-36c8.up.railway.app/api';
const LOCAL_API_URL = 'http://localhost:5001/api';

// Use production API in all builds for testing
const API_BASE_URL = PRODUCTION_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // Navigate to login (handled by AuthContext)
    }
    return Promise.reject(error);
  }
);

export default api;
