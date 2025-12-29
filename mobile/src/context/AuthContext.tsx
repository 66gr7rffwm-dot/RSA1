import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  role: 'driver' | 'passenger';
  fullName: string;
  hasActiveSubscription?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (phoneNumber: string, otpCode: string) => Promise<void>;
}

interface RegisterData {
  phoneNumber: string;
  email?: string;
  password: string;
  fullName: string;
  role: 'driver' | 'passenger';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        setUser(JSON.parse(userData));
        // Verify token is still valid
        try {
          await api.get('/users/me');
        } catch (error) {
          // Token invalid, clear storage
          await AsyncStorage.multiRemove(['authToken', 'user']);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { phoneNumber, password });
      const { token, user: userData, requiresOTPVerification } = response.data.data;

      if (requiresOTPVerification) {
        // Handle OTP verification flow
        throw new Error('OTP_VERIFICATION_REQUIRED');
      }

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      if (error.message === 'OTP_VERIFICATION_REQUIRED') {
        throw error;
      }
      const errorMessage = error.userMessage || error.response?.data?.error || 'Login failed. Please check your credentials and try again.';
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      // Registration successful, OTP will be sent
      return response.data;
    } catch (error: any) {
      const errorMessage = error.userMessage || error.response?.data?.error || 'Registration failed. Please check your information and try again.';
      throw new Error(errorMessage);
    }
  };

  const verifyOTP = async (phoneNumber: string, otpCode: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { phoneNumber, otpCode });
      const { token, user: userData } = response.data.data;

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.response?.data?.error || 'OTP verification failed. Please check the code and try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, verifyOTP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

