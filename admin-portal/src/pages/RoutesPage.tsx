import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api';

interface Trip {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_phone: string;
  vehicle_id: string;
  trip_date: string;
  trip_time: string;
  origin_address: string;
  destination_address: string;
  total_distance_km: number;
  base_trip_cost: number;
  max_seats: number;
  available_seats: number;
  trip_status: string;
  is_women_only: boolean;
  is_recurring: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  passenger_name: string;
  pickup_address: string;
  dropoff_address: string;
  passenger_cost: number;
  booking_status: string;
  created_at: string;
}

const RoutesPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripBookings, setTripBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/routes');
      setTrips(res.data.data || []);
      toast.success('Trips loaded');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load trips');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTripBookings = async (tripId: string) => {
    setLoadingBookings(true);
    try {
      const res = await api.get(`/admin/trips/${tripId}/bookings`);
      setTripBookings(res.data.data || []);
    } catch {
      setTripBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const cancelTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to cancel this trip? All bookings will be cancelled.')) return;
    try {
      await api.put(`/admin/trips/${tripId}/cancel`);
      toast.success('Trip cancelled');
      load();
      setSelectedTrip(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel trip');
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selectedTrip) {
      loadTripBookings(selectedTrip.id);
    }
  }, [selectedTrip]);

  const filteredTrips = trips.filter(t => {
    const matchesSearch = !search || 
      t.origin_address.toLowerCase().includes(search.toLowerCase()) ||
      t.destination_address.toLowerCase().includes(search.toLowerCase()) ||
      t.driver_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.trip_status === statusFilter;
    const matchesDate = !dateFilter || t.trip_date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: trips.length,
    active: trips.filter(t => t.trip_status === 'active').length,
    completed: trips.filter(t => t.trip_status === 'completed').length,
    cancelled: trips.filter(t => t.trip_status === 'cancelled').length,
    womenOnly: trips.filter(t => t.is_women_only).length,
    recurring: trips.filter(t => t.is_recurring).length,
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'success',
      completed: 'info',
      cancelled: 'danger',
      pending: 'warning'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading trips...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>🗺️ Routes & Trips Management</h2>
          <p className="subtitle">Monitor and manage all trips</p>
        </div>
        <button className="btn-primary" onClick={load}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Trips</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-value">{stats.womenOnly}</div>
          <div className="stat-label">👩 Women Only</div>
        </div>
        <div className="stat-card stat-primary">
          <div className="stat-value">{stats.recurring}</div>
          <div className="stat-label">🔄 Recurring</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by origin, destination, or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Date:</label>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          />
        </div>
        {dateFilter && (
          <button className="btn-secondary btn-sm" onClick={() => setDateFilter('')}>
            Clear Date
          </button>
        )}
      </div>

      {/* Trips Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Driver</th>
              <th>Date & Time</th>
              <th>Distance</th>
              <th>Cost</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  {search || statusFilter !== 'all' || dateFilter ? 'No trips match your criteria' : 'No trips created yet'}
                </td>
              </tr>
            ) : (
              filteredTrips.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="route-info">
                      <div className="route-origin">📍 {t.origin_address}</div>
                      <div className="route-arrow">↓</div>
                      <div className="route-destination">🎯 {t.destination_address}</div>
                      {t.is_women_only && <span className="badge badge-warning" style={{ marginTop: '4px' }}>👩 Women Only</span>}
                    </div>
                  </td>
                  <td>
                    <div>{t.driver_name}</div>
                    <div className="user-email">{t.driver_phone}</div>
                  </td>
                  <td>
                    <div>{format(new Date(t.trip_date), 'MMM dd, yyyy')}</div>
                    <div className="user-email">{t.trip_time}</div>
                  </td>
                  <td>{t.total_distance_km?.toFixed(1) || '—'} km</td>
                  <td>PKR {t.base_trip_cost?.toFixed(0) || '—'}</td>
                  <td>
                    <span className={`seats-badge ${t.available_seats === 0 ? 'full' : ''}`}>
                      {t.available_seats}/{t.max_seats} available
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${getStatusBadge(t.trip_status)}`}>
                      {t.trip_status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => setSelectedTrip(t)}
                      >
                        View
                      </button>
                      {t.trip_status === 'active' && (
                        <button 
                          className="btn-danger btn-sm"
                          onClick={() => cancelTrip(t.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="modal-overlay" onClick={() => setSelectedTrip(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗺️ Trip Details</h3>
              <button className="modal-close" onClick={() => setSelectedTrip(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="trip-route-header">
                <div className="route-visual">
                  <div className="route-point origin">
                    <span className="point-icon">📍</span>
                    <span className="point-label">{selectedTrip.origin_address}</span>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point destination">
                    <span className="point-icon">🎯</span>
                    <span className="point-label">{selectedTrip.destination_address}</span>
                  </div>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Driver:</label>
                  <span>{selectedTrip.driver_name}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{selectedTrip.driver_phone}</span>
                </div>
                <div className="info-item">
                  <label>Date:</label>
                  <span>{format(new Date(selectedTrip.trip_date), 'EEEE, MMMM dd, yyyy')}</span>
                </div>
                <div className="info-item">
                  <label>Time:</label>
                  <span>{selectedTrip.trip_time}</span>
                </div>
                <div className="info-item">
                  <label>Distance:</label>
                  <span>{selectedTrip.total_distance_km?.toFixed(1) || '—'} km</span>
                </div>
                <div className="info-item">
                  <label>Base Cost:</label>
                  <span>PKR {selectedTrip.base_trip_cost?.toFixed(0) || '—'}</span>
                </div>
                <div className="info-item">
                  <label>Seats:</label>
                  <span>{selectedTrip.available_seats}/{selectedTrip.max_seats} available</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`badge badge-${getStatusBadge(selectedTrip.trip_status)}`}>
                    {selectedTrip.trip_status}
                  </span>
                </div>
                {selectedTrip.is_women_only && (
                  <div className="info-item">
                    <label>Type:</label>
                    <span className="badge badge-warning">👩 Women Only</span>
                  </div>
                )}
                {selectedTrip.is_recurring && (
                  <div className="info-item">
                    <label>Recurring:</label>
                    <span className="badge badge-info">🔄 Yes</span>
                  </div>
                )}
              </div>

              <h4 className="section-title">Bookings ({tripBookings.length})</h4>
              {loadingBookings ? (
                <p>Loading bookings...</p>
              ) : tripBookings.length === 0 ? (
                <p className="empty-state-text">No bookings for this trip</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Passenger</th>
                        <th>Pickup</th>
                        <th>Drop-off</th>
                        <th>Cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tripBookings.map((b) => (
                        <tr key={b.id}>
                          <td>{b.passenger_name}</td>
                          <td>{b.pickup_address}</td>
                          <td>{b.dropoff_address}</td>
                          <td>PKR {b.passenger_cost?.toFixed(0)}</td>
                          <td>
                            <span className={`badge badge-${getStatusBadge(b.booking_status)}`}>
                              {b.booking_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setSelectedTrip(null)}>
                  Close
                </button>
                {selectedTrip.trip_status === 'active' && (
                  <button className="btn-danger" onClick={() => cancelTrip(selectedTrip.id)}>
                    Cancel Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
