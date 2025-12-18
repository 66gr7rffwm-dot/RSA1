import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';
import KYCRequestsPage from './pages/KYCRequestsPage';
import VehiclesPage from './pages/VehiclesPage';
import RoutesPage from './pages/RoutesPage';
import PricingPage from './pages/PricingPage';
import DisputesPage from './pages/DisputesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import api from './api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const res = await api.get('/admin/verify');
        setIsAuthenticated(true);
        setUser(res.data.data?.user);
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('adminToken');
        delete api.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Listen for storage changes (for login from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminToken') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleTokenUpdate = () => {
      checkAuth();
    };
    window.addEventListener('tokenUpdated', handleTokenUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenUpdated', handleTokenUpdate);
    };
  }, [checkAuth]);

  const handleLoginSuccess = useCallback(() => {
    // Dispatch custom event to trigger auth check
    window.dispatchEvent(new Event('tokenUpdated'));
    // Also directly check auth
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="url(#gradient)"/>
              <path d="M36 28H39V26H36V28Z" fill="white"/>
              <path d="M13 28C13 29.1 12.1 30 11 30C9.9 30 9 29.1 9 28C9 26.9 9.9 26 11 26C12.1 26 13 26.9 13 28Z" fill="white"/>
              <path d="M29 28C29 29.1 28.1 30 27 30C25.9 30 25 29.1 25 28C25 26.9 25.9 26 27 26C28.1 26 29 26.9 29 28Z" fill="white"/>
              <path d="M35 18H32L29 22H13L10 18H7C6.45 18 6 18.45 6 19V25C6 25.55 6.45 26 7 26H8.05C8.28 24.28 9.75 23 11.5 23C13.25 23 14.72 24.28 14.95 26H23.05C23.28 24.28 24.75 23 26.5 23C28.25 23 29.72 24.28 29.95 26H35C35.55 26 36 25.55 36 25V19C36 18.45 35.55 18 35 18Z" fill="white"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0ea5e9"/>
                  <stop offset="1" stopColor="#0284c7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="loading-spinner"></div>
          <p>Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            background: '#1e293b',
            color: '#fff',
          }
        }}
      />
      
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 18.67H26V17.33H24V18.67Z" fill="currentColor"/>
                <path d="M8.67 18.67C8.67 19.4 8.07 20 7.33 20C6.6 20 6 19.4 6 18.67C6 17.93 6.6 17.33 7.33 17.33C8.07 17.33 8.67 17.93 8.67 18.67Z" fill="currentColor"/>
                <path d="M19.33 18.67C19.33 19.4 18.73 20 18 20C17.27 20 16.67 19.4 16.67 18.67C16.67 17.93 17.27 17.33 18 17.33C18.73 17.33 19.33 17.93 19.33 18.67Z" fill="currentColor"/>
                <path d="M23.33 12H21.33L19.33 14.67H8.67L6.67 12H4.67C4.3 12 4 12.3 4 12.67V16.67C4 17.03 4.3 17.33 4.67 17.33H5.37C5.52 16.19 6.5 15.33 7.67 15.33C8.83 15.33 9.82 16.19 9.97 17.33H15.37C15.52 16.19 16.5 15.33 17.67 15.33C18.83 15.33 19.82 16.19 19.97 17.33H23.33C23.7 17.33 24 17.03 24 16.67V12.67C24 12.3 23.7 12 23.33 12Z" fill="currentColor"/>
              </svg>
            </div>
            <span className="brand-name">Carpool</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Overview</span>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span>Reports</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Management</span>
            <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>Users</span>
            </NavLink>
            <NavLink to="/kyc-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>KYC Requests</span>
            </NavLink>
            <NavLink to="/vehicles" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <span>Vehicles</span>
            </NavLink>
            <NavLink to="/routes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
              </svg>
              <span>Routes & Trips</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Operations</span>
            <NavLink to="/pricing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span>Pricing</span>
            </NavLink>
            <NavLink to="/disputes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Disputes</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-card">
              <div className="user-avatar">
                {user.fullName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.fullName || 'Admin'}</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/kyc-requests" element={<KYCRequestsPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
