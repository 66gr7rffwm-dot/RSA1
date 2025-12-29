import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api';

interface LogEntry {
  id: number;
  method: string;
  path: string;
  query?: string;
  body?: any;
  headers?: any;
  status_code?: number;
  response_body?: any;
  error_message?: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  duration_ms?: number;
  created_at: string;
}

interface LogStats {
  total_requests: string;
  errors: string;
  success: string;
  avg_duration: string;
  max_duration: string;
  unique_endpoints: string;
  unique_users: string;
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    method: '',
    path: '',
    statusCode: '',
    userId: '',
    search: '',
    level: '',
    startDate: '',
    endDate: '',
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      });

      const [logsRes, statsRes] = await Promise.all([
        api.get(`/admin/logs?${params}`),
        api.get('/admin/logs/stats'),
      ]);

      setLogs(logsRes.data.data.logs || []);
      setTotalPages(logsRes.data.data.pagination?.totalPages || 1);
      setStats(statsRes.data.data.stats);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'gray';
    if (statusCode >= 500) return 'red';
    if (statusCode >= 400) return 'orange';
    if (statusCode >= 300) return 'blue';
    return 'green';
  };

  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      GET: 'blue',
      POST: 'green',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
    };
    return colors[method] || 'gray';
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const clearLogs = async () => {
    if (!confirm('Delete logs older than 30 days? This action cannot be undone.')) return;
    try {
      await api.delete('/admin/logs?olderThan=30');
      toast.success('Logs cleared successfully');
      loadLogs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clear logs');
    }
  };

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading logs...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Application Logs</h2>
          <p className="subtitle">Monitor API requests, errors, and system events</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadLogs}>
            🔄 Refresh
          </button>
          <button className="btn-danger" onClick={clearLogs}>
            🗑️ Clear Old Logs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-value">{parseInt(stats.total_requests).toLocaleString()}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
            <div className="stat-value" style={{ color: '#10B981' }}>
              {parseInt(stats.success).toLocaleString()}
            </div>
            <div className="stat-label">Successful</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
            <div className="stat-value" style={{ color: '#EF4444' }}>
              {parseInt(stats.errors).toLocaleString()}
            </div>
            <div className="stat-label">Errors</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatDuration(parseFloat(stats.avg_duration))}</div>
            <div className="stat-label">Avg Response Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.unique_endpoints}</div>
            <div className="stat-label">Endpoints</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.unique_users || '—'}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar" style={{ marginBottom: '20px' }}>
        <div className="search-group">
          <input
            type="text"
            placeholder="Search logs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="search-input"
          />
        </div>
        <select
          value={filters.method}
          onChange={(e) => setFilters({ ...filters, method: e.target.value, page: 1 })}
          className="filter-select"
        >
          <option value="">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
          className="filter-select"
        >
          <option value="">All Levels</option>
          <option value="success">Success Only</option>
          <option value="error">Errors Only</option>
        </select>
        <input
          type="text"
          placeholder="Status Code"
          value={filters.statusCode}
          onChange={(e) => setFilters({ ...filters, statusCode: e.target.value, page: 1 })}
          className="filter-input"
          style={{ width: '120px' }}
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
          className="filter-input"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
          className="filter-input"
        />
        {(filters.method || filters.level || filters.statusCode || filters.search || filters.startDate || filters.endDate) && (
          <button
            className="btn-secondary"
            onClick={() => setFilters({
              method: '',
              path: '',
              statusCode: '',
              userId: '',
              search: '',
              level: '',
              startDate: '',
              endDate: '',
            })}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Duration</th>
              <th>User</th>
              <th>IP</th>
              <th>Error</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-state">No logs found</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{
                  backgroundColor: log.status_code && log.status_code >= 400 ? '#FEF2F2' : 'transparent'
                }}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                  </td>
                  <td>
                    <span className={`badge badge-${getMethodColor(log.method)}`}>
                      {log.method}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.path}
                  </td>
                  <td>
                    {log.status_code && (
                      <span className={`badge badge-${getStatusColor(log.status_code)}`}>
                        {log.status_code}
                      </span>
                    )}
                  </td>
                  <td>{formatDuration(log.duration_ms)}</td>
                  <td>{log.user_id ? log.user_id.substring(0, 8) + '...' : '—'}</td>
                  <td style={{ fontSize: '12px' }}>{log.ip_address || '—'}</td>
                  <td>
                    {log.error_message && (
                      <span style={{ color: '#EF4444', fontSize: '12px' }}>
                        {log.error_message.substring(0, 50)}
                        {log.error_message.length > 50 ? '...' : ''}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => {
                        const details = {
                          Method: log.method,
                          Path: log.path,
                          'Status Code': log.status_code,
                          'Duration': formatDuration(log.duration_ms),
                          'User ID': log.user_id || 'N/A',
                          'IP Address': log.ip_address || 'N/A',
                          'User Agent': log.user_agent || 'N/A',
                          'Query': log.query || 'N/A',
                          'Request Body': log.body ? JSON.stringify(log.body, null, 2) : 'N/A',
                          'Response Body': log.response_body ? JSON.stringify(log.response_body, null, 2) : 'N/A',
                          'Error': log.error_message || 'N/A',
                          'Timestamp': format(new Date(log.created_at), 'PPpp'),
                        };
                        alert(JSON.stringify(details, null, 2));
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsPage;

