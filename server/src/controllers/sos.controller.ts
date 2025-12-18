import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';

interface CreateSOSBody {
  tripId?: string;
  bookingId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export const createSOS = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { tripId, bookingId, latitude, longitude, address } =
      req.body as any as CreateSOSBody;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO sos_incidents (
         user_id,
         trip_id,
         booking_id,
         location_latitude,
         location_longitude,
         location_address,
         status
       ) VALUES (
         $1,$2,$3,$4,$5,$6,'active'
       )
       RETURNING *`,
      [
        userId,
        tripId || null,
        bookingId || null,
        typeof latitude === 'number' ? latitude : null,
        typeof longitude === 'number' ? longitude : null,
        address || null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to create SOS incident', 500));
  }
};

export const getMySOSIncidents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT * FROM sos_incidents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch SOS incidents', 500));
  }
};


