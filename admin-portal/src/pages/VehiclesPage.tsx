import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api';

interface Vehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  seating_capacity: number;
  registration_number: string;
  color?: string;
  vehicle_images?: string[];
  is_active: boolean;
  driver_name: string;
  driver_phone: string;
  created_at: string;
}

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/vehicles');
      setVehicles(res.data.data || []);
      toast.success('Vehicles loaded');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = !search || 
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      v.driver_name.toLowerCase().includes(search.toLowerCase());
    const matchesFuel = fuelFilter === 'all' || v.fuel_type === fuelFilter;
    return matchesSearch && matchesFuel;
  });

  const stats = {
    total: vehicles.length,
    petrol: vehicles.filter(v => v.fuel_type === 'petrol').length,
    diesel: vehicles.filter(v => v.fuel_type === 'diesel').length,
    cng: vehicles.filter(v => v.fuel_type === 'cng').length,
    hybrid: vehicles.filter(v => v.fuel_type === 'hybrid').length,
    electric: vehicles.filter(v => v.fuel_type === 'electric').length,
    active: vehicles.filter(v => v.is_active).length,
  };

  const fuelTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      petrol: '⛽',
      diesel: '🛢️',
      cng: '💨',
      hybrid: '🔋',
      electric: '⚡'
    };
    return emojis[type] || '🚗';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>🚗 Vehicle Management</h2>
          <p className="subtitle">Manage all registered vehicles</p>
        </div>
        <button className="btn-primary" onClick={load}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Vehicles</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-value">{stats.petrol}</div>
          <div className="stat-label">⛽ Petrol</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-value">{stats.diesel}</div>
          <div className="stat-label">🛢️ Diesel</div>
        </div>
        <div className="stat-card stat-primary">
          <div className="stat-value">{stats.cng}</div>
          <div className="stat-label">💨 CNG</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#10b981' }}>
          <div className="stat-value">{stats.hybrid + stats.electric}</div>
          <div className="stat-label">⚡ Hybrid/Electric</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by make, model, registration, or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Fuel Type:</label>
          <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            <option value="petrol">⛽ Petrol</option>
            <option value="diesel">🛢️ Diesel</option>
            <option value="cng">💨 CNG</option>
            <option value="hybrid">🔋 Hybrid</option>
            <option value="electric">⚡ Electric</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Registration</th>
              <th>Fuel Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  {search || fuelFilter !== 'all' ? 'No vehicles match your criteria' : 'No vehicles registered yet'}
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="vehicle-info">
                      <strong>{v.make} {v.model}</strong>
                      <div className="vehicle-year">({v.year}) {v.color && `• ${v.color}`}</div>
                    </div>
                  </td>
                  <td>
                    <div>{v.driver_name}</div>
                    <div className="user-email">{v.driver_phone}</div>
                  </td>
                  <td>
                    <span className="registration-badge">{v.registration_number}</span>
                  </td>
                  <td>
                    <span className="fuel-badge">
                      {fuelTypeEmoji(v.fuel_type)} {v.fuel_type}
                    </span>
                  </td>
                  <td>
                    <span className="seats-badge">{v.seating_capacity} seats</span>
                  </td>
                  <td>
                    <span className={`badge badge-${v.is_active ? 'success' : 'danger'}`}>
                      {v.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{format(new Date(v.created_at), 'MMM dd, yyyy')}</td>
                  <td>
                    <button 
                      className="btn-primary btn-sm"
                      onClick={() => setSelectedVehicle(v)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚗 {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</h3>
              <button className="modal-close" onClick={() => setSelectedVehicle(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Registration Number:</label>
                  <span className="registration-badge">{selectedVehicle.registration_number}</span>
                </div>
                <div className="info-item">
                  <label>Color:</label>
                  <span>{selectedVehicle.color || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Fuel Type:</label>
                  <span>{fuelTypeEmoji(selectedVehicle.fuel_type)} {selectedVehicle.fuel_type}</span>
                </div>
                <div className="info-item">
                  <label>Seating Capacity:</label>
                  <span>{selectedVehicle.seating_capacity} seats</span>
                </div>
                <div className="info-item">
                  <label>Driver:</label>
                  <span>{selectedVehicle.driver_name}</span>
                </div>
                <div className="info-item">
                  <label>Driver Phone:</label>
                  <span>{selectedVehicle.driver_phone}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`badge badge-${selectedVehicle.is_active ? 'success' : 'danger'}`}>
                    {selectedVehicle.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Registered:</label>
                  <span>{format(new Date(selectedVehicle.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>

              {selectedVehicle.vehicle_images && selectedVehicle.vehicle_images.length > 0 && (
                <>
                  <h4 className="section-title">Vehicle Images</h4>
                  <div className="documents-grid">
                    {selectedVehicle.vehicle_images.map((img, idx) => (
                      <div key={idx} className="document-card">
                        <img 
                          src={img} 
                          alt={`Vehicle ${idx + 1}`}
                          className="document-image"
                          onClick={() => window.open(img, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setSelectedVehicle(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
