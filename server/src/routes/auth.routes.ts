import express from 'express';
import { register, login, verifyOTP, resendOTP, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('phoneNumber').isMobilePhone('en-PK').withMessage('Valid Pakistani phone number required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('role').isIn(['driver', 'passenger']).withMessage('Role must be driver or passenger'),
  ],
  validateRequest,
  register
);

// Login
router.post(
  '/login',
  [
    body('phoneNumber').isMobilePhone('en-PK').withMessage('Valid Pakistani phone number required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('phoneNumber').isMobilePhone('en-PK').withMessage('Valid Pakistani phone number required'),
    body('otpCode').isLength({ min: 4, max: 6 }).withMessage('OTP code is required'),
  ],
  validateRequest,
  verifyOTP
);

// Resend OTP
router.post(
  '/resend-otp',
  [
    body('phoneNumber').isMobilePhone('en-PK').withMessage('Valid Pakistani phone number required'),
  ],
  validateRequest,
  resendOTP
);

// Forgot Password
router.post(
  '/forgot-password',
  [
    body('phoneNumber').isMobilePhone('en-PK').withMessage('Valid Pakistani phone number required'),
  ],
  validateRequest,
  forgotPassword
);

// Reset Password
router.post(
  '/reset-password',
  [
    body('phoneNumber').isMobilePhone('en-PK').withMessage('Valid Pakistani phone number required'),
    body('otpCode').notEmpty().withMessage('OTP code is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validateRequest,
  resetPassword
);

// Get OTP (Development only - for testing)
router.get('/get-otp/:phoneNumber', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, error: 'Not available in production' });
  }

  const { phoneNumber } = req.params;
  const { pool } = require('../database/connection');

  try {
    const result = await pool.query(
      `SELECT otp_code, created_at, expires_at, is_used 
       FROM otp_verifications 
       WHERE phone_number = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No OTP found for this phone number',
      });
    }

    const otp = result.rows[0];
    res.json({
      success: true,
      data: {
        otpCode: otp.otp_code,
        createdAt: otp.created_at,
        expiresAt: otp.expires_at,
        isUsed: otp.is_used,
        isValid: !otp.is_used && new Date() < new Date(otp.expires_at),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

