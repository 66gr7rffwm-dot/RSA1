import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api';

interface User {
  id: string;
  full_name: string;
  email?: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  user_count?: number;
  permission_count?: number;
}

interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'drivers' | 'passengers' | 'admins'>('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Create user form state
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'passenger',
    is_verified: false,
    is_active: true,
  });

  // Create role form state
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load users');
      setUsers([]);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await api.get('/admin/roles');
      setRoles(res.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load roles');
      setRoles([]);
    }
  };

  const loadPermissions = async () => {
    try {
      const res = await api.get('/admin/permissions');
      setPermissions(res.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load permissions');
      setPermissions([]);
    }
  };

  const load = async () => {
    setLoading(true);
    await Promise.all([loadUsers(), loadRoles(), loadPermissions()]);
    setLoading(false);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      toast.success('User created successfully');
      setShowCreateUser(false);
      setNewUser({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        role: 'passenger',
        is_verified: false,
        is_active: true,
      });
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/roles', newRole);
      toast.success('Role created successfully');
      setShowRoles(false);
      setNewRole({ name: '', description: '', permissions: [] });
      await loadRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create role');
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`/admin/roles/${roleId}`);
      toast.success('Role deleted successfully');
      await loadRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete role');
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    }
  };

  const resetPassword = async (userId: string, phone: string) => {
    if (!confirm(`Send password reset to ${phone}?`)) return;
    try {
      await api.post(`/admin/users/${userId}/reset-password`);
      toast.success('Password reset sent');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send password reset');
    }
  };

  const loadUserRoles = async (userId: string) => {
    try {
      const res = await api.get(`/admin/users/${userId}/roles`);
      return res.data.data || [];
    } catch (error) {
      return [];
    }
  };

  const assignRoleToUser = async (userId: string, roleId: string) => {
    try {
      await api.post(`/admin/users/${userId}/roles`, { roleId });
      toast.success('Role assigned successfully');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign role');
    }
  };

  const removeRoleFromUser = async (userId: string, roleId: string) => {
    try {
      await api.delete(`/admin/users/${userId}/roles/${roleId}`);
      toast.success('Role removed successfully');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove role');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter.slice(0, -1);
    const matchesSearch = search === '' || 
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.phone_number.includes(search) ||
      (user.email && user.email.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: users.length,
    drivers: users.filter(u => u.role === 'driver').length,
    passengers: users.filter(u => u.role === 'passenger').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.is_active).length,
    verified: users.filter(u => u.is_verified).length,
  };

  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User Management</h2>
          <p className="subtitle">Manage users, roles, and permissions</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={load}>
            🔄 Refresh
          </button>
          {activeTab === 'users' && (
            <button className="btn-primary" onClick={() => setShowCreateUser(true)}>
              ➕ Create User
            </button>
          )}
          {activeTab === 'roles' && (
            <button className="btn-primary" onClick={() => setShowRoles(true)}>
              ➕ Create Role
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({stats.total})
        </button>
        <button
          className={`tab-button ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          🛡️ Roles & Permissions ({roles.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-value">{stats.drivers}</div>
              <div className="stat-label">Drivers</div>
            </div>
            <div className="stat-card stat-info">
              <div className="stat-value">{stats.passengers}</div>
              <div className="stat-label">Passengers</div>
            </div>
            <div className="stat-card stat-primary">
              <div className="stat-value">{stats.admins}</div>
              <div className="stat-label">Admins</div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card stat-primary">
              <div className="stat-value">{stats.verified}</div>
              <div className="stat-label">Verified</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-group">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label>Filter:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="filter-select">
                <option value="all">All Users</option>
                <option value="drivers">Drivers</option>
                <option value="passengers">Passengers</option>
                <option value="admins">Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {search ? 'No users match your search' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <strong>{user.full_name}</strong>
                          <div className="user-id">ID: {user.id.substring(0, 8)}...</div>
                        </div>
                      </td>
                      <td>
                        <div>{user.phone_number}</div>
                        {user.email && <div className="user-email">{user.email}</div>}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          user.role === 'admin' ? 'info' : 
                          user.role === 'driver' ? 'success' : 
                          'warning'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${user.is_active ? 'success' : 'danger'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${user.is_verified ? 'success' : 'warning'}`}>
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>{format(new Date(user.created_at), 'MMM dd, yyyy')}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className={`btn-${user.is_active ? 'secondary' : 'success'} btn-sm`}
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            className="btn-primary btn-sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            Manage
                          </button>
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

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Users</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">No roles found</td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id}>
                    <td><strong>{role.name}</strong></td>
                    <td>{role.description || '—'}</td>
                    <td>
                      <span className={`badge ${role.is_system_role ? 'badge-info' : 'badge-secondary'}`}>
                        {role.is_system_role ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td>{role.user_count || 0}</td>
                    <td>{role.permission_count || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-primary btn-sm"
                          onClick={() => setSelectedRole(role)}
                        >
                          View/Edit
                        </button>
                        {!role.is_system_role && (
                          <button 
                            className="btn-danger btn-sm"
                            onClick={() => deleteRole(role.id)}
                          >
                            Delete
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

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal-overlay" onClick={() => setShowCreateUser(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="modal-close" onClick={() => setShowCreateUser(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={createUser}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    required
                  >
                    <option value="passenger">Passenger</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newUser.is_verified}
                      onChange={(e) => setNewUser({ ...newUser, is_verified: e.target.checked })}
                    />
                    Verified
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newUser.is_active}
                      onChange={(e) => setNewUser({ ...newUser, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateUser(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showRoles && (
        <div className="modal-overlay" onClick={() => setShowRoles(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Role</h3>
              <button className="modal-close" onClick={() => setShowRoles(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={createRole}>
                <div className="form-group">
                  <label>Role Name *</label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    required
                    placeholder="e.g., Moderator, Support Agent"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Permissions</label>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                    {Object.entries(permissionsByCategory).map(([category, perms]) => (
                      <div key={category} style={{ marginBottom: '16px' }}>
                        <strong style={{ display: 'block', marginBottom: '8px', color: '#475569' }}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </strong>
                        {perms.map((perm) => (
                          <label key={perm.id} style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                            <input
                              type="checkbox"
                              checked={newRole.permissions.includes(perm.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewRole({ ...newRole, permissions: [...newRole.permissions, perm.id] });
                                } else {
                                  setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== perm.id) });
                                }
                              }}
                            />
                            <span style={{ marginLeft: '8px' }}>{perm.name}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowRoles(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Details & Role Management Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage User - {selectedUser.full_name}</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="section-title">User Information</div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name:</label>
                  <span>{selectedUser.full_name}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{selectedUser.phone_number}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{selectedUser.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Role:</label>
                  <span className={`badge badge-${
                    selectedUser.role === 'admin' ? 'info' : 
                    selectedUser.role === 'driver' ? 'success' : 
                    'warning'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`badge badge-${selectedUser.is_active ? 'success' : 'danger'}`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Verified:</label>
                  <span className={`badge badge-${selectedUser.is_verified ? 'success' : 'warning'}`}>
                    {selectedUser.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="section-title">Assign Roles</div>
              <div style={{ marginBottom: '16px' }}>
                <select
                  className="filter-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      assignRoleToUser(selectedUser.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  <option value="">Select a role to assign...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.is_system_role ? '(System)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setSelectedUser(null)}>
                  Close
                </button>
                <button 
                  className={`btn-${selectedUser.is_active ? 'secondary' : 'success'}`}
                  onClick={() => {
                    toggleUserStatus(selectedUser.id, selectedUser.is_active);
                    setSelectedUser(null);
                  }}
                >
                  {selectedUser.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    resetPassword(selectedUser.id, selectedUser.phone_number);
                    setSelectedUser(null);
                  }}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Details Modal */}
      {selectedRole && (
        <div className="modal-overlay" onClick={() => setSelectedRole(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Role Details - {selectedRole.name}</h3>
              <button className="modal-close" onClick={() => setSelectedRole(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>Description:</label>
                  <span>{selectedRole.description || '—'}</span>
                </div>
                <div className="info-item">
                  <label>Type:</label>
                  <span className={`badge ${selectedRole.is_system_role ? 'badge-info' : 'badge-secondary'}`}>
                    {selectedRole.is_system_role ? 'System Role' : 'Custom Role'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Users with this role:</label>
                  <span>{selectedRole.user_count || 0}</span>
                </div>
                <div className="info-item">
                  <label>Permissions:</label>
                  <span>{selectedRole.permission_count || 0}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setSelectedRole(null)}>
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

export default UsersPage;
