import { Response, NextFunction } from 'express';
import { pool } from '../database/connection';
import { AuthRequest } from './auth.middleware';
import { AppError } from './errorHandler';

/**
 * Middleware to check if user has an active subscription
 * Required for both drivers and passengers as per BRD
 */
export const validateSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check for active subscription
    const result = await pool.query(
      `SELECT id, status, end_date 
       FROM subscriptions 
       WHERE user_id = $1 
       AND status = 'active' 
       AND end_date >= CURRENT_DATE
       ORDER BY end_date DESC 
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(403).json({
        error: 'Active subscription required',
        message: 'Please subscribe to continue using the platform (500 PKR/month)',
      });
      return;
    }

    // Attach subscription info to request
    req.subscription = result.rows[0];
    next();
  } catch (error) {
    next(new AppError('Error validating subscription', 500));
  }
};

// Extend AuthRequest interface
declare module './auth.middleware' {
  interface AuthRequest {
    subscription?: {
      id: string;
      status: string;
      end_date: Date;
    };
  }
}

