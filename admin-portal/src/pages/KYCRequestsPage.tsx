import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api';

interface KYCRequest {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  cnic_number: string;
  cnic_front_url: string;
  cnic_back_url: string;
  driving_license_number: string;
  driving_license_url: string;
  vehicle_registration_url: string;
  token_tax_url: string;
  selfie_url: string;
  verification_status: string;
  rejection_reason?: string;
  created_at: string;
}

const KYCRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/kyc-requests');
      setRequests(res.data.data || []);
      toast.success('KYC requests loaded');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load KYC requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    if (!confirm('Approve this KYC request? The driver will be able to create trips.')) return;
    try {
      await api.put(`/admin/kyc/${id}/approve`);
      toast.success('KYC approved successfully');
      await load();
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve KYC');
    }
  };

  const reject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    if (!confirm('Reject this KYC request? The driver will need to resubmit.')) return;
    try {
      await api.put(`/admin/kyc/${id}/reject`, { reason: rejectionReason });
      toast.success('KYC rejected');
      await load();
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject KYC');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'all' || r.verification_status === filter;
    const matchesSearch = !searchTerm || 
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone_number.includes(searchTerm) ||
      r.cnic_number.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading KYC requests...</p>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="page-header">
        <div>
          <h2>Driver KYC Requests</h2>
          <p className="subtitle">Review and verify driver documents</p>
        </div>
        <button className="btn-primary" onClick={load}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="filter-select">
            <option value="pending">Pending Only</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Requests</option>
          </select>
        </div>
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by name, phone, or CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{requests.filter(r => r.verification_status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">{requests.filter(r => r.verification_status === 'approved').length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-value">{requests.filter(r => r.verification_status === 'rejected').length}</div>
          <div className="stat-label">Rejected</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-value">{requests.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Contact</th>
              <th>CNIC</th>
              <th>License</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  {searchTerm ? 'No requests match your search' : 'No KYC requests found'}
                </td>
              </tr>
            ) : (
              filteredRequests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="user-info">
                      <strong>{r.full_name}</strong>
                      {r.email && <div className="user-email">{r.email}</div>}
                    </div>
                  </td>
                  <td>{r.phone_number}</td>
                  <td>{r.cnic_number}</td>
                  <td>{r.driving_license_number}</td>
                  <td>
                    <span className={`badge badge-${
                      r.verification_status === 'approved' ? 'success' : 
                      r.verification_status === 'rejected' ? 'danger' : 
                      'warning'
                    }`}>
                      {r.verification_status}
                    </span>
                    {r.rejection_reason && (
                      <div className="rejection-note" title={r.rejection_reason}>
                        {r.rejection_reason.substring(0, 30)}...
                      </div>
                    )}
                  </td>
                  <td>{format(new Date(r.created_at), 'MMM dd, yyyy')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => setSelectedRequest(r)}
                      >
                        View
                      </button>
                      {r.verification_status === 'pending' && (
                        <>
                          <button 
                            className="btn-success btn-sm"
                            onClick={() => approve(r.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn-danger btn-sm"
                            onClick={() => {
                              setSelectedRequest(r);
                              setRejectionReason('');
                            }}
                          >
                            Reject
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

      {/* KYC Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>KYC Details - {selectedRequest.full_name}</h3>
              <button className="modal-close" onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Phone Number:</label>
                  <span>{selectedRequest.phone_number}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{selectedRequest.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>CNIC Number:</label>
                  <span>{selectedRequest.cnic_number}</span>
                </div>
                <div className="info-item">
                  <label>Driving License:</label>
                  <span>{selectedRequest.driving_license_number}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`badge badge-${
                    selectedRequest.verification_status === 'approved' ? 'success' : 
                    selectedRequest.verification_status === 'rejected' ? 'danger' : 
                    'warning'
                  }`}>
                    {selectedRequest.verification_status}
                  </span>
                </div>
                <div className="info-item">
                  <label>Submitted:</label>
                  <span>{format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>

              {selectedRequest.rejection_reason && (
                <div className="alert alert-error">
                  <strong>Rejection Reason:</strong> {selectedRequest.rejection_reason}
                </div>
              )}

              <h4 className="section-title">Documents</h4>
              <div className="documents-grid">
                {[
                  { label: 'CNIC Front', url: selectedRequest.cnic_front_url },
                  { label: 'CNIC Back', url: selectedRequest.cnic_back_url },
                  { label: 'Driving License', url: selectedRequest.driving_license_url },
                  { label: 'Vehicle Registration', url: selectedRequest.vehicle_registration_url },
                  { label: 'Token Tax', url: selectedRequest.token_tax_url },
                  { label: 'Selfie', url: selectedRequest.selfie_url }
                ].map((doc) => (
                  <div key={doc.label} className="document-card">
                    <div className="document-label">{doc.label}</div>
                    {doc.url ? (
                      <img 
                        src={doc.url} 
                        alt={doc.label}
                        className="document-image"
                        onClick={() => window.open(doc.url, '_blank')}
                      />
                    ) : (
                      <div className="document-placeholder">
                        No Document
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedRequest.verification_status === 'pending' && (
                <div className="modal-actions">
                  <div className="rejection-section">
                    <label>Rejection Reason (if rejecting):</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows={3}
                      className="rejection-textarea"
                    />
                  </div>
                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={() => setSelectedRequest(null)}>
                      Cancel
                    </button>
                    <button 
                      className="btn-success"
                      onClick={() => approve(selectedRequest.id)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => reject(selectedRequest.id)}
                      disabled={!rejectionReason.trim()}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCRequestsPage;
