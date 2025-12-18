import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';

const getSubscriptionConfig = async () => {
  const amountResult = await pool.query(
    "SELECT config_value FROM system_config WHERE config_key = 'subscription_amount'"
  );
  const currencyResult = await pool.query(
    "SELECT config_value FROM system_config WHERE config_key = 'subscription_currency'"
  );
  const amount = parseFloat(amountResult.rows[0]?.config_value || '500');
  const currency = currencyResult.rows[0]?.config_value || 'PKR';
  return { amount, currency };
};

export const createSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { paymentMethod, paymentTransactionId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    if (!paymentMethod || !paymentTransactionId) {
      res.status(400).json({
        success: false,
        error: 'paymentMethod and paymentTransactionId are required',
      });
      return;
    }

    const { amount, currency } = await getSubscriptionConfig();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const result = await pool.query(
      `INSERT INTO subscriptions (
         user_id,
         amount,
         currency,
         start_date,
         end_date,
         status,
         auto_renewal,
         payment_method,
         payment_transaction_id
       ) VALUES (
         $1,$2,$3,$4,$5,'active',TRUE,$6,$7
       )
       RETURNING *`,
      [
        userId,
        amount,
        currency,
        startDate,
        endDate,
        paymentMethod,
        paymentTransactionId,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to create subscription', 500));
  }
};

export const getMySubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1
       ORDER BY end_date DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.json({ success: true, data: null });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to fetch subscription', 500));
  }
};

export const updateSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.json({
    success: true,
    message: 'Update subscription endpoint - reserved for future use',
  });
};

export const cancelSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE subscriptions
       SET status = 'cancelled',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Subscription not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to cancel subscription', 500));
  }
};


