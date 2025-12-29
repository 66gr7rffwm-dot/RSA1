import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { pool } from '../database/connection';
import { AppError } from '../middleware/errorHandler';

interface JwtPayload {
  userId: string | number;
  phoneNumber: string;
  role: string;
}
import { generateOTP, sendOTP } from '../services/otp/otpService';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber, email, password, fullName, role } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'User with this phone number already exists',
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (phone_number, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, phone_number, email, role, full_name, created_at`,
      [phoneNumber, email || null, passwordHash, fullName, role]
    );

    const user = result.rows[0];

    // Generate and send OTP
    const otpCode = generateOTP();
    await sendOTP(phoneNumber, otpCode);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify OTP.',
      data: {
        userId: user.id,
        phoneNumber: user.phone_number,
        requiresOTPVerification: true,
      },
    });
  } catch (error) {
    next(new AppError('Registration failed', 500));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, phone_number, email, password_hash, role, full_name, is_verified, is_active FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid phone number or password',
      });
      return;
    }

    const user = result.rows[0];

    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: 'Account is inactive',
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid phone number or password',
      });
      return;
    }

    // Check if OTP verification is required
    if (!user.is_verified) {
      const otpCode = generateOTP();
      await sendOTP(phoneNumber, otpCode);

      res.status(200).json({
        success: false,
        requiresOTPVerification: true,
        message: 'Please verify your phone number with OTP',
      });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
    };
    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phone_number,
        role: user.role,
      },
      jwtSecret,
      signOptions
    );

    // Check active subscription
    const subscriptionResult = await pool.query(
      `SELECT id, status, end_date FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE
       ORDER BY end_date DESC LIMIT 1`,
      [user.id]
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
          hasActiveSubscription: subscriptionResult.rows.length > 0,
        },
      },
    });
  } catch (error) {
    next(new AppError('Login failed', 500));
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber, otpCode } = req.body;

    // Development bypass: Allow "000000" as universal OTP in development
    const isDevMode = process.env.NODE_ENV !== 'production';
    if (isDevMode && otpCode === '000000') {
      // Find the latest OTP for this phone number (even if expired/used)
      const otpResult = await pool.query(
        `SELECT id FROM otp_verifications 
         WHERE phone_number = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [phoneNumber]
      );

      if (otpResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No OTP found. Please register first.',
        });
        return;
      }

      // Mark as used if not already
      await pool.query('UPDATE otp_verifications SET is_used = TRUE WHERE id = $1', [
        otpResult.rows[0].id,
      ]);
    } else {
      // Normal OTP verification
      const otpResult = await pool.query(
        `SELECT id, otp_code, expires_at, is_used 
         FROM otp_verifications 
         WHERE phone_number = $1 
         AND is_used = FALSE 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [phoneNumber]
      );

      if (otpResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No OTP found or already used',
        });
        return;
      }

      const otpRecord = otpResult.rows[0];

      // Check if expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        res.status(400).json({
          success: false,
          error: 'OTP has expired',
        });
        return;
      }

      // Verify OTP
      if (otpRecord.otp_code !== otpCode) {
        res.status(400).json({
          success: false,
          error: 'Invalid OTP code',
        });
        return;
      }

      // Mark OTP as used
      await pool.query('UPDATE otp_verifications SET is_used = TRUE WHERE id = $1', [
        otpRecord.id,
      ]);
    }

    // Update user verification status
    await pool.query('UPDATE users SET is_verified = TRUE WHERE phone_number = $1', [
      phoneNumber,
    ]);

    // Get user for token generation
    const userResult = await pool.query(
      'SELECT id, phone_number, email, role, full_name FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    const user = userResult.rows[0];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
    };
    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phone_number,
        role: user.role,
      },
      jwtSecret,
      signOptions
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        },
      },
    });
  } catch (error) {
    next(new AppError('OTP verification failed', 500));
  }
};

export const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    const otpCode = generateOTP();
    await sendOTP(phoneNumber, otpCode);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(new AppError('Failed to resend OTP', 500));
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE phone_number = $1', [
      phoneNumber,
    ]);

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists for security
      res.status(200).json({
        success: true,
        message: 'If the phone number exists, an OTP has been sent',
      });
      return;
    }

    // Generate and send OTP
    const otpCode = generateOTP();
    await sendOTP(phoneNumber, otpCode);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone number',
    });
  } catch (error) {
    next(new AppError('Failed to process forgot password request', 500));
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, otpCode, newPassword } = req.body;

    // Verify OTP (similar to verifyOTP)
    const otpResult = await pool.query(
      `SELECT id, expires_at, is_used 
       FROM otp_verifications 
       WHERE phone_number = $1 
       AND otp_code = $2 
       AND is_used = FALSE 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [phoneNumber, otpCode]
    );

    if (otpResult.rows.length === 0 || new Date() > new Date(otpResult.rows[0].expires_at)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
      return;
    }

    // Mark OTP as used
    await pool.query('UPDATE otp_verifications SET is_used = TRUE WHERE id = $1', [
      otpResult.rows[0].id,
    ]);

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE phone_number = $2', [
      passwordHash,
      phoneNumber,
    ]);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(new AppError('Password reset failed', 500));
  }
};

