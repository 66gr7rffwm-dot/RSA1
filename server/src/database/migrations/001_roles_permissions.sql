-- Migration: Add Roles and Permissions System
-- This migration adds support for custom roles and page-level permissions

-- First, update users table to support custom roles (remove the CHECK constraint temporarily)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE, -- System roles (admin, driver, passenger) cannot be deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table (Page-level permissions)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'dashboard.view', 'users.create', 'kyc.approve'
    description TEXT,
    category VARCHAR(50), -- e.g., 'dashboard', 'users', 'kyc', 'vehicles', 'routes', 'pricing', 'disputes', 'reports'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- User Roles (Many-to-Many relationship - users can have multiple roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Insert default system roles
INSERT INTO roles (name, description, is_system_role) VALUES
    ('admin', 'System Administrator - Full access', TRUE),
    ('driver', 'Driver - Can create trips and manage vehicles', TRUE),
    ('passenger', 'Passenger - Can book rides', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions for admin portal pages
INSERT INTO permissions (name, code, description, category) VALUES
    -- Dashboard
    ('View Dashboard', 'dashboard.view', 'View dashboard analytics and statistics', 'dashboard'),
    
    -- Users
    ('View Users', 'users.view', 'View user list and details', 'users'),
    ('Create Users', 'users.create', 'Create new users', 'users'),
    ('Edit Users', 'users.edit', 'Edit user information', 'users'),
    ('Delete Users', 'users.delete', 'Delete users', 'users'),
    ('Activate/Deactivate Users', 'users.manage_status', 'Activate or deactivate users', 'users'),
    ('Reset User Password', 'users.reset_password', 'Reset user passwords', 'users'),
    ('Manage User Roles', 'users.manage_roles', 'Assign or remove roles from users', 'users'),
    
    -- KYC
    ('View KYC Requests', 'kyc.view', 'View KYC verification requests', 'kyc'),
    ('Approve KYC', 'kyc.approve', 'Approve KYC verification requests', 'kyc'),
    ('Reject KYC', 'kyc.reject', 'Reject KYC verification requests', 'kyc'),
    
    -- Vehicles
    ('View Vehicles', 'vehicles.view', 'View vehicle list and details', 'vehicles'),
    ('Edit Vehicles', 'vehicles.edit', 'Edit vehicle information', 'vehicles'),
    ('Delete Vehicles', 'vehicles.delete', 'Delete vehicles', 'vehicles'),
    
    -- Routes & Trips
    ('View Routes', 'routes.view', 'View routes and trips', 'routes'),
    ('Edit Routes', 'routes.edit', 'Edit routes and trips', 'routes'),
    ('Delete Routes', 'routes.delete', 'Delete routes and trips', 'routes'),
    
    -- Pricing
    ('View Pricing', 'pricing.view', 'View pricing configuration', 'pricing'),
    ('Edit Pricing', 'pricing.edit', 'Edit pricing configuration', 'pricing'),
    
    -- Disputes
    ('View Disputes', 'disputes.view', 'View dispute reports', 'disputes'),
    ('Resolve Disputes', 'disputes.resolve', 'Resolve dispute reports', 'disputes'),
    
    -- Reports
    ('View Reports', 'reports.view', 'View system reports', 'reports'),
    ('Export Reports', 'reports.export', 'Export reports data', 'reports'),
    
    -- Roles & Permissions
    ('View Roles', 'roles.view', 'View roles and permissions', 'roles'),
    ('Create Roles', 'roles.create', 'Create new roles', 'roles'),
    ('Edit Roles', 'roles.edit', 'Edit roles and permissions', 'roles'),
    ('Delete Roles', 'roles.delete', 'Delete roles', 'roles')
ON CONFLICT (code) DO NOTHING;

-- Assign all permissions to admin role by default
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);

