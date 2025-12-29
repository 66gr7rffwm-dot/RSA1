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
    // Enhanced error handling with better messages
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // Navigate to login (handled by AuthContext)
    }
    
    // Format error message for better user experience
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message ||
                        error.message ||
                        'An unexpected error occurred. Please try again.';
    
    // Create enhanced error object
    const enhancedError = {
      ...error,
      userMessage: getErrorMessage(error.response?.status, errorMessage),
      originalMessage: errorMessage,
    };
    
    return Promise.reject(enhancedError);
  }
);

// Helper function to provide user-friendly error messages
const getErrorMessage = (statusCode?: number, originalMessage?: string): string => {
  if (!statusCode) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  switch (statusCode) {
    case 400:
      return originalMessage || 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Your session has expired. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with existing data. Please try again.';
    case 422:
      return originalMessage || 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Our team has been notified. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again in a few moments.';
    default:
      return originalMessage || 'An error occurred. Please try again.';
  }
};

export default api;
