import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';

interface CreateRatingBody {
  bookingId: string;
  rating: number;
  comment?: string;
}

export const createRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { bookingId, rating, comment } = req.body as CreateRatingBody;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    if (!bookingId || !rating) {
      res.status(400).json({ success: false, error: 'bookingId and rating are required' });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
      return;
    }

    // Load booking with trip to identify counterparty
    const bookingResult = await pool.query(
      `SELECT b.passenger_id, t.driver_id
       FROM bookings b
       JOIN trips t ON t.id = b.trip_id
       WHERE b.id = $1`,
      [bookingId]
    );
    if (bookingResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }
    const booking = bookingResult.rows[0];

    // Ensure user participated in this booking
    if (booking.passenger_id !== userId && booking.driver_id !== userId) {
      res.status(403).json({ success: false, error: 'You cannot rate this booking' });
      return;
    }

    let ratedUserId: string;
    if (role === 'driver') {
      ratedUserId = booking.passenger_id;
    } else {
      // passenger rating driver
      ratedUserId = booking.driver_id;
    }

    try {
      const result = await pool.query(
        `INSERT INTO ratings (
           booking_id,
           rated_by,
           rated_user_id,
           rating,
           comment
         ) VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [bookingId, userId, ratedUserId, rating, comment || null]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err: any) {
      if (err.code === '23505') {
        res
          .status(400)
          .json({ success: false, error: 'You have already rated this booking' });
        return;
      }
      throw err;
    }
  } catch (error) {
    next(new AppError('Failed to create rating', 500));
  }
};

export const getMyReceivedRatings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT * FROM ratings
       WHERE rated_user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch ratings', 500));
  }
};

export const getMyGivenRatings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT * FROM ratings
       WHERE rated_by = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch my ratings', 500));
  }
};


