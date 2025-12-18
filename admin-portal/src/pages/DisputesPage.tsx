import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api';

interface Dispute {
  id: string;
  booking_id: string;
  reporter_user_id: string;
  reporter_name: string;
  reporter_phone: string;
  reported_user_id: string;
  reported_name: string;
  reported_phone: string;
  reason: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

interface SOSIncident {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  booking_id?: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'responded' | 'resolved';
  created_at: string;
  responded_at?: string;
  resolved_at?: string;
}

interface Rating {
  id: string;
  booking_id: string;
  from_user_name: string;
  to_user_name: string;
  rating: number;
  review: string;
  created_at: string;
  is_flagged: boolean;
}

const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [sosIncidents, setSOSIncidents] = useState<SOSIncident[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'disputes' | 'sos' | 'ratings'>('disputes');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadDisputes = async () => {
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data.data || []);
    } catch {
      setDisputes([]);
    }
  };

  const loadSOSIncidents = async () => {
    try {
      const res = await api.get('/admin/sos-incidents');
      setSOSIncidents(res.data.data || []);
    } catch {
      // Mock data for demo
      setSOSIncidents([
        {
          id: '1',
          user_id: 'u1',
          user_name: 'Fatima Ali',
          user_phone: '+923001234567',
          booking_id: 'b1',
          latitude: 33.6844,
          longitude: 73.0479,
          status: 'active',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          user_id: 'u2',
          user_name: 'Ahmed Khan',
          user_phone: '+923009876543',
          latitude: 33.7294,
          longitude: 73.0931,
          status: 'responded',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          responded_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        }
      ]);
    }
  };

  const loadRatings = async () => {
    try {
      const res = await api.get('/admin/ratings');
      setRatings(res.data.data || []);
    } catch {
      // Mock data for demo
      setRatings([
        {
          id: '1',
          booking_id: 'b1',
          from_user_name: 'Sarah Ahmed',
          to_user_name: 'Ali Hassan',
          rating: 2,
          review: 'Driver was late and vehicle was not clean',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          is_flagged: true,
        },
        {
          id: '2',
          booking_id: 'b2',
          from_user_name: 'Omar Malik',
          to_user_name: 'Fatima Ali',
          rating: 5,
          review: 'Excellent ride, very professional!',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          is_flagged: false,
        }
      ]);
    }
  };

  const load = async () => {
    setLoading(true);
    await Promise.all([loadDisputes(), loadSOSIncidents(), loadRatings()]);
    setLoading(false);
  };

  const resolveDispute = async (id: string) => {
    if (!resolutionNotes.trim()) {
      toast.error('Please enter resolution notes');
      return;
    }
    try {
      await api.put(`/admin/disputes/${id}/resolve`, { resolution_notes: resolutionNotes });
      toast.success('Dispute resolved');
      setSelectedDispute(null);
      setResolutionNotes('');
      await loadDisputes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resolve dispute');
    }
  };

  const dismissDispute = async (id: string) => {
    if (!confirm('Are you sure you want to dismiss this dispute?')) return;
    try {
      await api.put(`/admin/disputes/${id}/dismiss`);
      toast.success('Dispute dismissed');
      setSelectedDispute(null);
      await loadDisputes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to dismiss dispute');
    }
  };

  const respondToSOS = async (id: string) => {
    try {
      await api.put(`/admin/sos-incidents/${id}/respond`);
      toast.success('SOS marked as responded');
      await loadSOSIncidents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update SOS');
    }
  };

  const resolveSOS = async (id: string) => {
    try {
      await api.put(`/admin/sos-incidents/${id}/resolve`);
      toast.success('SOS incident resolved');
      await loadSOSIncidents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resolve SOS');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: 'warning',
      in_progress: 'info',
      resolved: 'success',
      dismissed: 'secondary',
      active: 'danger',
      responded: 'info'
    };
    return colors[status] || 'secondary';
  };

  const filteredDisputes = disputes.filter(d => 
    statusFilter === 'all' || d.status === statusFilter
  );

  const stats = {
    openDisputes: disputes.filter(d => d.status === 'open').length,
    resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
    activeSOSCount: sosIncidents.filter(s => s.status === 'active').length,
    flaggedRatings: ratings.filter(r => r.is_flagged).length,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading disputes...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
    <div>
          <h2>⚠️ Disputes & Safety</h2>
          <p className="subtitle">Manage complaints, SOS incidents, and user ratings</p>
        </div>
        <button className="btn-primary" onClick={load}>
          🔄 Refresh
        </button>
      </div>

      {/* Alert Banner for Active SOS */}
      {stats.activeSOSCount > 0 && (
        <div className="alert-banner danger">
          <span className="alert-icon">🚨</span>
          <span className="alert-text">
            <strong>{stats.activeSOSCount} Active SOS Incident(s)</strong> - Immediate attention required!
          </span>
          <button className="btn-danger btn-sm" onClick={() => setActiveTab('sos')}>
            View SOS
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card stat-warning">
          <div className="stat-value">{stats.openDisputes}</div>
          <div className="stat-label">Open Disputes</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">{stats.resolvedDisputes}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-value">{stats.activeSOSCount}</div>
          <div className="stat-label">🚨 Active SOS</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-value">{stats.flaggedRatings}</div>
          <div className="stat-label">⚠️ Flagged Ratings</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'disputes' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          📋 Disputes ({disputes.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'sos' ? 'active' : ''} ${stats.activeSOSCount > 0 ? 'alert' : ''}`}
          onClick={() => setActiveTab('sos')}
        >
          🚨 SOS Incidents ({sosIncidents.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          ⭐ Ratings ({ratings.length})
        </button>
      </div>

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <>
          <div className="filters-bar">
            <div className="filter-group">
              <label>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Reporter</th>
                  <th>Reported User</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
                {filteredDisputes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      {statusFilter !== 'all' ? 'No disputes match your filter' : 'No disputes reported yet'}
                    </td>
                  </tr>
                ) : (
                  filteredDisputes.map((d) => (
            <tr key={d.id}>
                      <td>
                        <div>{d.reporter_name}</div>
                        <div className="user-email">{d.reporter_phone}</div>
                      </td>
                      <td>
                        <div>{d.reported_name}</div>
                        <div className="user-email">{d.reported_phone}</div>
                      </td>
                      <td>
                        <span className="reason-badge">{d.reason}</span>
                        <div className="description-preview">{d.description?.slice(0, 50)}...</div>
                      </td>
                      <td>
                        <span className={`badge badge-${getStatusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>{format(new Date(d.created_at), 'MMM dd, yyyy')}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-primary btn-sm"
                            onClick={() => setSelectedDispute(d)}
                          >
                            View
                          </button>
                {d.status === 'open' && (
                            <>
                              <button 
                                className="btn-success btn-sm"
                                onClick={() => setSelectedDispute(d)}
                              >
                                Resolve
                              </button>
                              <button 
                                className="btn-secondary btn-sm"
                                onClick={() => dismissDispute(d.id)}
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SOS Tab */}
      {activeTab === 'sos' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Location</th>
                <th>Status</th>
                <th>Reported</th>
                <th>Responded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sosIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No SOS incidents reported
                  </td>
                </tr>
              ) : (
                sosIncidents.map((s) => (
                  <tr key={s.id} className={s.status === 'active' ? 'row-alert' : ''}>
                    <td>
                      <div>{s.user_name}</div>
                      <div className="user-email">{s.user_phone}</div>
                    </td>
                    <td>
                      <a 
                        href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="location-link"
                      >
                        📍 View on Map
                      </a>
                    </td>
                    <td>
                      <span className={`badge badge-${getStatusBadge(s.status)}`}>
                        {s.status === 'active' ? '🚨 ' : ''}{s.status}
                      </span>
                    </td>
                    <td>{format(new Date(s.created_at), 'MMM dd, HH:mm')}</td>
                    <td>{s.responded_at ? format(new Date(s.responded_at), 'MMM dd, HH:mm') : '—'}</td>
                    <td>
                      <div className="action-buttons">
                        {s.status === 'active' && (
                          <button 
                            className="btn-warning btn-sm"
                            onClick={() => respondToSOS(s.id)}
                          >
                            📞 Respond
                          </button>
                        )}
                        {(s.status === 'active' || s.status === 'responded') && (
                          <button 
                            className="btn-success btn-sm"
                            onClick={() => resolveSOS(s.id)}
                          >
                            ✓ Resolve
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
      )}

      {/* Ratings Tab */}
      {activeTab === 'ratings' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ratings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No ratings submitted yet
                  </td>
                </tr>
              ) : (
                ratings.map((r) => (
                  <tr key={r.id} className={r.is_flagged ? 'row-warning' : ''}>
                    <td>{r.from_user_name}</td>
                    <td>{r.to_user_name}</td>
                    <td>
                      <div className="rating-stars">
                        {'⭐'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                      <span className="rating-number">({r.rating}/5)</span>
                    </td>
                    <td className="review-cell">{r.review}</td>
                    <td>{format(new Date(r.created_at), 'MMM dd, yyyy')}</td>
                    <td>
                      {r.is_flagged && (
                        <span className="badge badge-warning">⚠️ Flagged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Dispute Details Modal */}
      {selectedDispute && (
        <div className="modal-overlay" onClick={() => setSelectedDispute(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Dispute Details</h3>
              <button className="modal-close" onClick={() => setSelectedDispute(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="dispute-parties">
                <div className="party-card reporter">
                  <h5>Reporter</h5>
                  <div>{selectedDispute.reporter_name}</div>
                  <div className="user-email">{selectedDispute.reporter_phone}</div>
                </div>
                <div className="vs-divider">VS</div>
                <div className="party-card reported">
                  <h5>Reported User</h5>
                  <div>{selectedDispute.reported_name}</div>
                  <div className="user-email">{selectedDispute.reported_phone}</div>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Reason:</label>
                  <span className="reason-badge">{selectedDispute.reason}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`badge badge-${getStatusBadge(selectedDispute.status)}`}>
                    {selectedDispute.status}
                  </span>
                </div>
                <div className="info-item full-width">
                  <label>Description:</label>
                  <p className="description-text">{selectedDispute.description}</p>
                </div>
                <div className="info-item">
                  <label>Created:</label>
                  <span>{format(new Date(selectedDispute.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>

              {selectedDispute.status === 'open' && (
                <div className="resolution-form">
                  <h4>Resolution Notes</h4>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter resolution notes..."
                    rows={4}
                  />
                </div>
              )}

              {selectedDispute.resolution_notes && (
                <div className="info-item full-width">
                  <label>Resolution Notes:</label>
                  <p className="description-text">{selectedDispute.resolution_notes}</p>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setSelectedDispute(null)}>
                  Close
                </button>
                {selectedDispute.status === 'open' && (
                  <>
                    <button className="btn-danger" onClick={() => dismissDispute(selectedDispute.id)}>
                      Dismiss
                    </button>
                    <button className="btn-success" onClick={() => resolveDispute(selectedDispute.id)}>
                      Resolve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputesPage;
