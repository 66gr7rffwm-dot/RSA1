import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { 
  adminLogin,
  verifyAdmin,
  getUsers,
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
  getPricingConfig,
  updatePricingConfig,
  getReports
} from '../controllers/admin.controller';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.use(authenticate);
router.use(authorize('admin'));

router.get('/verify', verifyAdmin);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);
router.get('/kyc-requests', getKYCRequests);
router.put('/kyc/:id/approve', approveKYC);
router.put('/kyc/:id/reject', rejectKYC);
router.get('/analytics', getAnalytics);
router.get('/recent-activity', getRecentActivity);
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', resolveDispute);
router.put('/disputes/:id/dismiss', dismissDispute);
router.get('/vehicles', getVehicles);
router.get('/routes', getRoutes);
router.get('/pricing-config', getPricingConfig);
router.put('/pricing-config', updatePricingConfig);
router.get('/reports', getReports);

export default router;

