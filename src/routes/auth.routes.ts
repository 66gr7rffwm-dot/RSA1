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

export default router;

