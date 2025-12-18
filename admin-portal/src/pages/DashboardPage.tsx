import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import api from '../api';
import toast, { Toaster } from 'react-hot-toast';

interface Analytics {
  totalUsers: number;
  totalTrips: number;
  totalBookings: number;
  activeSubscriptions: number;
  totalRevenue: number;
  averageTripDistance: number;
  occupancyRate: number;
  pendingKYC: number;
  activeDrivers: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'trip' | 'booking' | 'kyc';
  description: string;
  timestamp: string;
  status?: string;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      const [analyticsRes, activityRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/recent-activity')
      ]);
      setAnalytics(analyticsRes.data.data);
      setRecentActivity(activityRes.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data - in production, fetch from API
  const userGrowthData = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MMM dd'),
    users: Math.floor(Math.random() * 50) + 10,
    trips: Math.floor(Math.random() * 30) + 5,
  }));

  const revenueData = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MMM dd'),
    revenue: Math.floor(Math.random() * 50000) + 10000,
  }));

  const tripStatusData = [
    { name: 'Completed', value: analytics?.totalTrips ? Math.floor(analytics.totalTrips * 0.8) : 0 },
    { name: 'Active', value: analytics?.totalTrips ? Math.floor(analytics.totalTrips * 0.15) : 0 },
    { name: 'Cancelled', value: analytics?.totalTrips ? Math.floor(analytics.totalTrips * 0.05) : 0 },
  ];

  const userRoleData = [
    { name: 'Drivers', value: analytics?.activeDrivers || 0 },
    { name: 'Passengers', value: (analytics?.totalUsers || 0) - (analytics?.activeDrivers || 0) },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="error-container">
        <h3>Failed to load analytics</h3>
        <button className="btn-primary" onClick={loadData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="time-range-selector">
          <button 
            className={timeRange === '7d' ? 'btn-time-active' : 'btn-time'}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={timeRange === '30d' ? 'btn-time-active' : 'btn-time'}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button 
            className={timeRange === '90d' ? 'btn-time-active' : 'btn-time'}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card metric-primary">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <p className="metric-value">{analytics.totalUsers.toLocaleString()}</p>
            <div className="metric-footer">
              <span className="metric-label">Active drivers: {analytics.activeDrivers}</span>
            </div>
          </div>
        </div>

        <div className="metric-card metric-success">
          <div className="metric-icon">🚗</div>
          <div className="metric-content">
            <h3>Total Trips</h3>
            <p className="metric-value">{analytics.totalTrips.toLocaleString()}</p>
            <div className="metric-footer">
              <span className="metric-label">Avg distance: {analytics.averageTripDistance.toFixed(1)} km</span>
            </div>
          </div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>Total Bookings</h3>
            <p className="metric-value">{analytics.totalBookings.toLocaleString()}</p>
            <div className="metric-footer">
              <span className="metric-label">Occupancy: {(analytics.occupancyRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="metric-card metric-info">
          <div className="metric-icon">💳</div>
          <div className="metric-content">
            <h3>Active Subscriptions</h3>
            <p className="metric-value">{analytics.activeSubscriptions.toLocaleString()}</p>
            <div className="metric-footer">
              <span className="metric-label">Revenue: PKR {analytics.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {analytics.pendingKYC > 0 && (
          <div className="metric-card metric-danger">
            <div className="metric-icon">⚠️</div>
            <div className="metric-content">
              <h3>Pending KYC</h3>
              <p className="metric-value">{analytics.pendingKYC}</p>
              <div className="metric-footer">
                <a href="/kyc-requests" className="metric-link">Review Now →</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>User & Trip Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} name="New Users" />
              <Line type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={2} name="New Trips" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `PKR ${value.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Trip Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tripStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tripStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>User Roles</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {analytics.pendingKYC > 0 && (
            <a href="/kyc-requests" className="action-card action-warning">
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h4>{analytics.pendingKYC} Pending KYC</h4>
                <p>Review driver verification requests</p>
              </div>
            </a>
          )}
          <a href="/users" className="action-card action-primary">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h4>User Management</h4>
              <p>View and manage all users</p>
            </div>
          </a>
          <a href="/vehicles" className="action-card action-success">
            <div className="action-icon">🚗</div>
            <div className="action-content">
              <h4>Manage Vehicles</h4>
              <p>View registered vehicles</p>
            </div>
          </a>
          <a href="/reports" className="action-card action-info">
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h4>System Reports</h4>
              <p>View detailed analytics</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="section-header">
          <h3>Recent Activity</h3>
          <button className="btn-secondary" onClick={loadData}>Refresh</button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Type</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No recent activity
                  </td>
                </tr>
              ) : (
                recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.description}</td>
                    <td>
                      <span className={`badge badge-${
                        activity.type === 'user' ? 'info' :
                        activity.type === 'trip' ? 'success' :
                        activity.type === 'booking' ? 'warning' :
                        'danger'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td>
                      {activity.status && (
                        <span className={`badge badge-${
                          activity.status === 'completed' ? 'success' :
                          activity.status === 'pending' ? 'warning' :
                          activity.status === 'approved' ? 'success' :
                          activity.status === 'rejected' ? 'danger' :
                          'info'
                        }`}>
                          {activity.status}
                        </span>
                      )}
                    </td>
                    <td>{format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
