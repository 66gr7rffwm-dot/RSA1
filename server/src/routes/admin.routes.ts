import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { 
  adminLogin,
  verifyAdmin,
  getUsers,
  createUser,
  updateUserStatus,
  resetUserPassword,
  getKYCRequests,
  approveKYC,
  rejectKYC,
  getAnalytics,
  getRecentActivity,
  getDisputes,
  resolveDispute,
  dismissDispute,
  getVehicles,
  getRoutes,
  getTripBookings,
  cancelTrip,
  getSOSIncidents,
  respondToSOS,
  resolveSOS,
  getRatings,
  getPricingConfig,
  updatePricingConfig,
  getReports,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  getRolePermissions,
  getUserRoles,
  assignUserRole,
  removeUserRole
} from '../controllers/admin.controller';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard & Analytics
router.get('/verify', verifyAdmin);
router.get('/analytics', getAnalytics);
router.get('/recent-activity', getRecentActivity);
router.get('/reports', getReports);

// User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/status', updateUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);
router.get('/users/:userId/roles', getUserRoles);
router.post('/users/:userId/roles', assignUserRole);
router.delete('/users/:userId/roles/:roleId', removeUserRole);

// KYC Management
router.get('/kyc-requests', getKYCRequests);
router.put('/kyc/:id/approve', approveKYC);
router.put('/kyc/:id/reject', rejectKYC);

// Vehicle Management
router.get('/vehicles', getVehicles);

// Route & Trip Management
router.get('/routes', getRoutes);
router.get('/trips/:tripId/bookings', getTripBookings);
router.put('/trips/:tripId/cancel', cancelTrip);

// Dispute & Safety Management
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', resolveDispute);
router.put('/disputes/:id/dismiss', dismissDispute);
router.get('/sos-incidents', getSOSIncidents);
router.put('/sos-incidents/:id/respond', respondToSOS);
router.put('/sos-incidents/:id/resolve', resolveSOS);
router.get('/ratings', getRatings);

// Pricing Configuration
router.get('/pricing-config', getPricingConfig);
router.put('/pricing-config', updatePricingConfig);

// Roles & Permissions Management
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);
router.get('/permissions', getPermissions);
router.get('/roles/:roleId/permissions', getRolePermissions);

export default router;
