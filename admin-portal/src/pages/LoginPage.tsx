import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyAndRedirect(token);
    }
  }, []);

  const verifyAndRedirect = async (token: string) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await api.get('/admin/verify');
      // If already authenticated, trigger success callback
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch {
      localStorage.removeItem('adminToken');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/admin/login', { email, password });
      const { token, user } = res.data.data;
      
      if (token) {
        // Store token
        localStorage.setItem('adminToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Login successful! Redirecting...', {
          duration: 1000,
          style: {
            background: '#059669',
            color: '#fff',
          }
        });
        
        // Force page reload to trigger App component auth check
        // This is the most reliable way to ensure state updates
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#dc2626',
          color: '#fff',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('admin@carpool.local');
    setPassword('admin123');
    toast.success('Credentials filled!', { duration: 1000 });
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="visual-content">
          <div className="visual-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.1"/>
              <path d="M36 28H39V26H36V28Z" fill="white"/>
              <path d="M13 28C13 29.1 12.1 30 11 30C9.9 30 9 29.1 9 28C9 26.9 9.9 26 11 26C12.1 26 13 26.9 13 28Z" fill="white"/>
              <path d="M29 28C29 29.1 28.1 30 27 30C25.9 30 25 29.1 25 28C25 26.9 25.9 26 27 26C28.1 26 29 26.9 29 28Z" fill="white"/>
              <path d="M35 18H32L29 22H13L10 18H7C6.45 18 6 18.45 6 19V25C6 25.55 6.45 26 7 26H8.05C8.28 24.28 9.75 23 11.5 23C13.25 23 14.72 24.28 14.95 26H23.05C23.28 24.28 24.75 23 26.5 23C28.25 23 29.72 24.28 29.95 26H35C35.55 26 36 25.55 36 25V19C36 18.45 35.55 18 35 18Z" fill="white"/>
            </svg>
          </div>
          <h1>Carpool Admin</h1>
          <p>Manage your carpooling platform with powerful admin tools</p>
          
          <div className="visual-features">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Real-time Analytics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>User Management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>KYC Verification</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span>Revenue Tracking</span>
            </div>
          </div>
        </div>
        
        <div className="visual-pattern">
          <div className="pattern-circle c1"></div>
          <div className="pattern-circle c2"></div>
          <div className="pattern-circle c3"></div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-form-container">
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your admin account</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@carpool.local"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="credentials-helper">
            <button 
              type="button" 
              onClick={fillDefaultCredentials}
              className="fill-credentials"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              Use demo credentials
            </button>
            <p className="credentials-info">
              <strong>Email:</strong> admin@carpool.local<br/>
              <strong>Password:</strong> admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
