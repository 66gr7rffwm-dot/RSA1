import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';

type UploadedFiles = Express.Multer.File[];

const toPublicUrl = (filePath: string): string =>
  filePath.startsWith('/') ? filePath : `/${filePath.replace(/\\/g, '/')}`;

export const getVehicles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const result = await pool.query(
      `SELECT id, make, model, year, fuel_type, seating_capacity, registration_number, color, vehicle_images, is_active
       FROM vehicles
       WHERE driver_id = $1
       ORDER BY created_at DESC`,
      [driverId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch vehicles', 500));
  }
};

export const addVehicle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const { make, model, year, fuelType, seatingCapacity, registrationNumber, color } = req.body;
    const files = (req.files as UploadedFiles) || [];

    if (!make || !model || !year || !fuelType || !seatingCapacity || !registrationNumber) {
      res.status(400).json({ success: false, error: 'Missing required vehicle fields' });
      return;
    }

    const images = files.map((f) => toPublicUrl(f.path));

    const result = await pool.query(
      `INSERT INTO vehicles (
         driver_id, make, model, year, fuel_type, seating_capacity,
         registration_number, color, vehicle_images
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        driverId,
        make,
        model,
        parseInt(year, 10),
        fuelType,
        parseInt(seatingCapacity, 10),
        registrationNumber,
        color || null,
        images.length ? images : null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ success: false, error: 'Vehicle with this registration already exists' });
      return;
    }
    next(new AppError('Failed to add vehicle', 500));
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const { id } = req.params;
    const { make, model, year, fuelType, seatingCapacity, registrationNumber, color, isActive } = req.body;
    const files = (req.files as UploadedFiles) || [];

    // Ensure vehicle belongs to driver
    const existing = await pool.query('SELECT * FROM vehicles WHERE id = $1 AND driver_id = $2', [id, driverId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Vehicle not found' });
      return;
    }

    const newImages = files.map((f) => toPublicUrl(f.path));
    const currentImages: string[] = existing.rows[0].vehicle_images || [];
    const vehicleImages = newImages.length ? newImages : currentImages;

    const result = await pool.query(
      `UPDATE vehicles
       SET make = COALESCE($1, make),
           model = COALESCE($2, model),
           year = COALESCE($3, year),
           fuel_type = COALESCE($4, fuel_type),
           seating_capacity = COALESCE($5, seating_capacity),
           registration_number = COALESCE($6, registration_number),
           color = COALESCE($7, color),
           vehicle_images = $8,
           is_active = COALESCE($9, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND driver_id = $11
       RETURNING *`,
      [
        make || null,
        model || null,
        year ? parseInt(year, 10) : null,
        fuelType || null,
        seatingCapacity ? parseInt(seatingCapacity, 10) : null,
        registrationNumber || null,
        color || null,
        vehicleImages,
        typeof isActive !== 'undefined' ? isActive === 'true' || isActive === true : null,
        id,
        driverId,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to update vehicle', 500));
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 AND driver_id = $2', [id, driverId]);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Vehicle not found' });
      return;
    }

    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(new AppError('Failed to delete vehicle', 500));
  }
};

