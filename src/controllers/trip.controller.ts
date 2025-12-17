import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';
import { navigationService } from '../services/navigation/navigationService';

interface CreateTripBody {
  vehicleId: string;
  tripDate: string; // YYYY-MM-DD
  tripTime: string; // HH:mm
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  intermediatePoints?: Array<{
    address: string;
    latitude: number;
    longitude: number;
    order: number;
  }>;
  maxSeats: number;
  isWomenOnly?: boolean;
}

const getFuelRatePerKm = async (): Promise<number> => {
  const result = await pool.query(
    "SELECT config_value FROM system_config WHERE config_key = 'fuel_rate_per_km'"
  );
  const value = result.rows[0]?.config_value;
  const parsed = parseFloat(value || '25');
  return isNaN(parsed) ? 25 : parsed;
};

export const createTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const {
      vehicleId,
      tripDate,
      tripTime,
      originAddress,
      originLatitude,
      originLongitude,
      destinationAddress,
      destinationLatitude,
      destinationLongitude,
      intermediatePoints = [],
      maxSeats,
      isWomenOnly = false,
    } = req.body as any as CreateTripBody;

    if (!driverId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (
      !vehicleId ||
      !tripDate ||
      !tripTime ||
      !originAddress ||
      !destinationAddress ||
      !maxSeats
    ) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    if (maxSeats < 1 || maxSeats > 3) {
      res
        .status(400)
        .json({ success: false, error: 'maxSeats must be between 1 and 3' });
      return;
    }

    // Validate vehicle belongs to driver
    const vehicleResult = await pool.query(
      'SELECT id FROM vehicles WHERE id = $1 AND driver_id = $2 AND is_active = TRUE',
      [vehicleId, driverId]
    );
    if (vehicleResult.rows.length === 0) {
      res
        .status(400)
        .json({ success: false, error: 'Invalid or inactive vehicle' });
      return;
    }

    // Calculate route distance using navigation service (if available)
    let totalDistanceKm = 0;
    if (navigationService) {
      const route = await navigationService.calculateRoute(
        { latitude: originLatitude, longitude: originLongitude },
        { latitude: destinationLatitude, longitude: destinationLongitude }
      );
      totalDistanceKm = route.distance;
    } else {
      // Fallback: simple straight-line distance (approximation)
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(destinationLatitude - originLatitude);
      const dLon = toRad(destinationLongitude - originLongitude);
      const lat1 = toRad(originLatitude);
      const lat2 = toRad(destinationLatitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
          Math.sin(dLon / 2) *
          Math.cos(lat1) *
          Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistanceKm = R * c;
    }

    const fuelRatePerKm = await getFuelRatePerKm();
    const vehicleFactor = 1.0; // Could be adjusted based on vehicle type in future
    const baseTripCost = totalDistanceKm * fuelRatePerKm * vehicleFactor;

    const result = await pool.query(
      `INSERT INTO trips (
        driver_id,
        route_id,
        vehicle_id,
        trip_date,
        trip_time,
        origin_address,
        origin_latitude,
        origin_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        intermediate_points,
        total_distance_km,
        max_seats,
        available_seats,
        base_trip_cost,
        fuel_rate_per_km,
        vehicle_factor,
        status,
        is_women_only
      ) VALUES (
        $1, NULL, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, 'scheduled', $18
      )
      RETURNING *`,
      [
        driverId,
        vehicleId,
        tripDate,
        tripTime,
        originAddress,
        originLatitude,
        originLongitude,
        destinationAddress,
        destinationLatitude,
        destinationLongitude,
        intermediatePoints && intermediatePoints.length
          ? JSON.stringify(intermediatePoints)
          : null,
        totalDistanceKm,
        maxSeats,
        maxSeats,
        baseTripCost,
        fuelRatePerKm,
        vehicleFactor,
        isWomenOnly,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    next(new AppError('Failed to create trip', 500));
  }
};

export const getTrips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT * FROM trips
       WHERE trip_date >= CURRENT_DATE
       ORDER BY trip_date, trip_time`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch trips', 500));
  }
};

export const getTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to fetch trip', 500));
  }
};

export const updateTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const { id } = req.params;
    const { tripDate, tripTime, maxSeats, status } = req.body;

    const existing = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND driver_id = $2',
      [id, driverId]
    );
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    const result = await pool.query(
      `UPDATE trips
       SET trip_date = COALESCE($1, trip_date),
           trip_time = COALESCE($2, trip_time),
           max_seats = COALESCE($3, max_seats),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND driver_id = $6
       RETURNING *`,
      [
        tripDate || null,
        tripTime || null,
        maxSeats || null,
        status || null,
        id,
        driverId,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to update trip', 500));
  }
};

export const cancelTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE trips
       SET status = 'cancelled',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND driver_id = $2`,
      [id, driverId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    res.json({ success: true, message: 'Trip cancelled successfully' });
  } catch (error) {
    next(new AppError('Failed to cancel trip', 500));
  }
};

export const getMyTrips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const driverId = req.user?.id;
    const result = await pool.query(
      `SELECT * FROM trips
       WHERE driver_id = $1
       ORDER BY trip_date DESC, trip_time DESC`,
      [driverId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch my trips', 500));
  }
};

export const searchTrips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      tripDate,
      originLatitude,
      originLongitude,
      maxDistanceKm = 5,
    } = req.query as any;

    if (!tripDate) {
      res
        .status(400)
        .json({ success: false, error: 'tripDate query param is required' });
      return;
    }

    const result = await pool.query(
      `SELECT *
       FROM trips
       WHERE trip_date = $1
         AND status = 'scheduled'
         AND available_seats > 0
       ORDER BY trip_time`,
      [tripDate]
    );

    // TODO: add geo-distance filtering using originLatitude/originLongitude and maxDistanceKm

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to search trips', 500));
  }
};


