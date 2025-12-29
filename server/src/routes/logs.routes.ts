import express from 'express';
import { logCrash, getCrashLogs } from '../controllers/logs.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public route - receive crash reports from mobile app
router.post('/crash', logCrash);

// Protected routes - admin only
router.get('/crashes', authenticate, authorize('admin'), getCrashLogs);

export default router;

