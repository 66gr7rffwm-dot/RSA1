import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { pool } from '../database/connection';
import { AppError } from '../middleware/errorHandler';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id || req.user?.id;

    const result = await pool.query(
      'SELECT id, phone_number, email, role, full_name, profile_image_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to get profile', 500));
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, profileImageUrl } = req.body;
    const userId = req.user?.id;

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           profile_image_url = COALESCE($3, profile_image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, phone_number, email, role, full_name, profile_image_url`,
      [fullName, email, profileImageUrl, userId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to update profile', 500));
  }
};

