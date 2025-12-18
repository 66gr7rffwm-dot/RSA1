import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';

// Mock payment controller – simulate JazzCash/EasyPaisa/cards.
// Replace with real gateway SDK calls when ready.

export const processPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, currency, paymentMethod, contextType, contextId } = req.body;

    if (!amount || !currency || !paymentMethod) {
      res.status(400).json({
        success: false,
        error: 'amount, currency and paymentMethod are required',
      });
      return;
    }

    const transactionId = `MOCK-${String(paymentMethod).toUpperCase()}-${Date.now()}`;

    res.status(200).json({
      success: true,
      data: {
        transactionId,
        status: 'success',
        provider: paymentMethod,
        amount,
        currency,
        contextType: contextType || null,
        contextId: contextId || null,
      },
    });
  } catch (error) {
    next(new AppError('Failed to process payment', 500));
  }
};

export const getPaymentStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;
    res.json({
      success: true,
      data: {
        transactionId,
        status: 'success', // Always success in mock
      },
    });
  } catch (error) {
    next(new AppError('Failed to get payment status', 500));
  }
};

export const processRefund = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId, amount } = req.body;
    if (!transactionId || !amount) {
      res.status(400).json({
        success: false,
        error: 'transactionId and amount are required',
      });
      return;
    }
    res.json({
      success: true,
      data: {
        transactionId,
        refundedAmount: amount,
        status: 'refunded',
      },
    });
  } catch (error) {
    next(new AppError('Failed to process refund', 500));
  }
};


