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
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
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
    console.log('Toggle user status clicked:', { userId, isActive });
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { is_active: !isActive });
      console.log('Toggle status response:', response.data);
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      await loadUsers();
    } catch (error: any) {
      console.error('Toggle status error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update user status';
      toast.error(errorMsg);
      console.error('Toggle Status Error Details:', {
        userId,
        isActive,
        error: error.response?.data || error.message,
        status: error.response?.status
      });
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

  const handleDeleteClick = (user: User) => {
    console.log('Delete button clicked for user:', user);
    if (user.role === 'admin') {
      toast.error('Cannot delete admin users');
      return;
    }
    setUserToDelete({ id: user.id, name: user.full_name });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    const { id, name } = userToDelete;
    console.log('Confirming delete for user:', { id, name });
    
    try {
      console.log('Sending delete request to:', `/admin/users/${id}`);
      const response = await api.delete(`/admin/users/${id}`);
      console.log('Delete response:', response);
      console.log('Delete response data:', response.data);
      
      toast.success(`User "${name}" deleted successfully`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (error: any) {
      console.error('Delete error:', error);
      console.error('Delete error response:', error.response);
      console.error('Delete error data:', error.response?.data);
      
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      'Failed to delete user';
      
      toast.error(errorMsg);
      
      console.error('Delete Error Details:', {
        userId: id,
        userName: name,
        error: error.response?.data || error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Don't close modal on error so user can try again
    }
  };

  const cancelDelete = () => {
    console.log('Delete cancelled');
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const [viewingOTP, setViewingOTP] = useState<{ [key: string]: string | null }>({});
  const [loadingOTP, setLoadingOTP] = useState<{ [key: string]: boolean }>({});

  const viewOTP = async (phoneNumber: string, userId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Toggle hide/show
    if (viewingOTP[userId]) {
      setViewingOTP({ ...viewingOTP, [userId]: null });
      return;
    }

    setLoadingOTP({ ...loadingOTP, [userId]: true });
    try {
      // Encode phone number for URL (handle + and special characters)
      const encodedPhone = encodeURIComponent(phoneNumber);
      const res = await api.get(`/admin/users/otp/${encodedPhone}`);
      
      if (res.data.success && res.data.data) {
        const otp = res.data.data;
        setViewingOTP({ ...viewingOTP, [userId]: otp.otpCode });
        if (otp.isValid) {
          toast.success('OTP retrieved successfully');
        } else {
          toast.error('OTP expired or already used');
        }
      } else {
        toast.error('No OTP found for this user');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to get OTP';
      toast.error(errorMsg);
      console.error('OTP Error Details:', {
        phoneNumber,
        userId,
        error: error.response?.data || error.message,
        url: `/admin/users/otp/${encodeURIComponent(phoneNumber)}`
      });
    } finally {
      setLoadingOTP({ ...loadingOTP, [userId]: false });
    }
  };

  const handleEditUser = (user: User) => {
    console.log('Edit user clicked:', user);
    setEditingUser({ ...user }); // Create a copy to avoid direct mutation
    setShowEditUser(true);
  };

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData: any = {};
      if (editingUser.full_name) updateData.full_name = editingUser.full_name;
      if (editingUser.email !== undefined) updateData.email = editingUser.email;
      if (editingUser.phone_number) updateData.phone_number = editingUser.phone_number;
      if (editingUser.role) updateData.role = editingUser.role;
      updateData.is_active = editingUser.is_active;
      updateData.is_verified = editingUser.is_verified;

      await api.put(`/admin/users/${editingUser.id}`, updateData);
      toast.success('User updated successfully');
      setShowEditUser(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user');
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
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="page-header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        color: 'white'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'white' }}>👥 User Management</h2>
          <p className="subtitle" style={{ margin: '8px 0 0 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-secondary" 
            onClick={load}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            🔄 Refresh
          </button>
          {activeTab === 'users' && (
            <button 
              className="btn-primary" 
              onClick={() => setShowCreateUser(true)}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              ➕ Create User
            </button>
          )}
          {activeTab === 'roles' && (
            <button 
              className="btn-primary" 
              onClick={() => setShowRoles(true)}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              ➕ Create Role
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {activeTab === 'users' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Total Users</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{stats.total}</div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>🚗 Drivers</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.drivers}</div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>👤 Passengers</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{stats.passengers}</div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>✅ Active</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.active}</div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>✓ Verified</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.verified}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: 'white',
        padding: '8px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'users' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'users' ? 'white' : '#64748b',
            fontWeight: activeTab === 'users' ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '15px'
          }}
        >
          👥 Users ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'roles' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'roles' ? 'white' : '#64748b',
            fontWeight: activeTab === 'roles' ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '15px'
          }}
        >
          🛡️ Roles & Permissions ({roles.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* Filters */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <input
                type="text"
                placeholder="🔍 Search by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Filter:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)} 
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '150px'
                }}
              >
                <option value="all">All Users</option>
                <option value="drivers">🚗 Drivers</option>
                <option value="passengers">👤 Passengers</option>
                <option value="admins">👑 Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>User</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Contact</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Role</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Status</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Verified</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Joined</th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: '48px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '16px'
                    }}>
                      {search ? '🔍 No users match your search' : '👥 No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr 
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.2s',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
                            {user.full_name}
                          </strong>
                          <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>{user.phone_number}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                viewOTP(user.phone_number, user.id, e);
                              }}
                              disabled={loadingOTP[user.id]}
                              title="View OTP (Development Only) - Click to toggle"
                              style={{
                                background: viewingOTP[user.id] ? '#dbeafe' : '#f1f5f9',
                                border: viewingOTP[user.id] ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                                borderRadius: '4px',
                                cursor: loadingOTP[user.id] ? 'not-allowed' : 'pointer',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '500',
                                opacity: loadingOTP[user.id] ? 0.6 : 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                minWidth: '75px',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                color: viewingOTP[user.id] ? '#1e40af' : '#475569'
                              }}
                              onMouseEnter={(e) => {
                                if (!loadingOTP[user.id]) {
                                  e.currentTarget.style.background = viewingOTP[user.id] ? '#bfdbfe' : '#e2e8f0';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!loadingOTP[user.id]) {
                                  e.currentTarget.style.background = viewingOTP[user.id] ? '#dbeafe' : '#f1f5f9';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                            >
                              {loadingOTP[user.id] ? (
                                <span>⏳ Loading...</span>
                              ) : viewingOTP[user.id] ? (
                                <span>👁️ Hide OTP</span>
                              ) : (
                                <span>👁️‍🗨️ View OTP</span>
                              )}
                            </button>
                          </div>
                          {viewingOTP[user.id] && (
                            <div style={{
                              padding: '6px 8px',
                              background: '#dcfce7',
                              border: '1px solid #86efac',
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              color: '#166534',
                              marginTop: '4px'
                            }}>
                              🔐 OTP: {viewingOTP[user.id]}
                            </div>
                          )}
                          {user.email && <div className="user-email" style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>{user.email}</div>}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          background: user.role === 'admin' ? '#dbeafe' : 
                                     user.role === 'driver' ? '#d1fae5' : '#fef3c7',
                          color: user.role === 'admin' ? '#1e40af' : 
                                 user.role === 'driver' ? '#065f46' : '#92400e'
                        }}>
                          {user.role === 'admin' ? '👑 ' : user.role === 'driver' ? '🚗 ' : '👤 '}
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: user.is_active ? '#d1fae5' : '#fee2e2',
                          color: user.is_active ? '#065f46' : '#991b1b'
                        }}>
                          {user.is_active ? '✅ Active' : '⏸️ Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: user.is_verified ? '#d1fae5' : '#fef3c7',
                          color: user.is_verified ? '#065f46' : '#92400e'
                        }}>
                          {user.is_verified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditUser(user);
                            }}
                            title="Edit User"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#667eea',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#5568d3';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#667eea';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                            title="View Details"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: 'white',
                              color: '#475569',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f1f5f9';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                          >
                            👁️ View
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleUserStatus(user.id, user.is_active);
                            }}
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: user.is_active ? '#f1f5f9' : '#d1fae5',
                              color: user.is_active ? '#64748b' : '#065f46',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            {user.is_active ? '⏸️' : '▶️'}
                          </button>
                          {user.role !== 'admin' && (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Delete button clicked, user:', user);
                                handleDeleteClick(user);
                              }}
                              title="Delete User (Cannot be undone)"
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#fee2e2',
                                color: '#991b1b',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fecaca';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fee2e2';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              🗑️ Delete
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

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="modal-overlay" onClick={() => { setShowEditUser(false); setEditingUser(null); }}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => { setShowEditUser(false); setEditingUser(null); }}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={updateUser}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={editingUser.full_name}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={editingUser.phone_number}
                    onChange={(e) => setEditingUser({ ...editingUser, phone_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    required
                    disabled={editingUser.role === 'admin'}
                  >
                    <option value="passenger">Passenger</option>
                    <option value="driver">Driver</option>
                    {editingUser.role === 'admin' && <option value="admin">Admin</option>}
                  </select>
                  {editingUser.role === 'admin' && (
                    <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                      Admin role cannot be changed
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingUser.is_verified}
                      onChange={(e) => setEditingUser({ ...editingUser, is_verified: e.target.checked })}
                    />
                    Verified
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingUser.is_active}
                      onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => { setShowEditUser(false); setEditingUser(null); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update User
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ background: '#fee2e2', borderBottom: '2px solid #fecaca' }}>
              <h3 style={{ color: '#991b1b', margin: 0 }}>⚠️ Delete User</h3>
              <button className="modal-close" onClick={cancelDelete} style={{ color: '#991b1b' }}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ fontSize: '16px', marginBottom: '16px', color: '#1e293b' }}>
                Are you sure you want to delete user <strong>"{userToDelete.name}"</strong>?
              </p>
              <p style={{ fontSize: '14px', color: '#ef4444', marginBottom: '24px', fontWeight: '600' }}>
                ⚠️ This action cannot be undone. All user data will be permanently deleted.
              </p>
              <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn-secondary" 
                  onClick={cancelDelete}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn-danger" 
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🗑️ Delete User
                </button>
              </div>
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
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setEditingUser(selectedUser);
                    setShowEditUser(true);
                    setSelectedUser(null);
                  }}
                >
                  ✏️ Edit User
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
                  className="btn-secondary"
                  onClick={() => {
                    resetPassword(selectedUser.id, selectedUser.phone_number);
                  }}
                >
                  Reset Password
                </button>
                <button className="btn-secondary" onClick={() => setSelectedUser(null)}>
                  Close
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
