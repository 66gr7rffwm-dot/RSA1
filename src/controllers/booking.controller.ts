import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';
import { navigationService } from '../services/navigation/navigationService';
import { pricingEngine } from '../services/pricing/pricingEngine';

interface CreateBookingBody {
  tripId: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
}

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const passengerId = req.user?.id;
    const {
      tripId,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      dropoffAddress,
      dropoffLatitude,
      dropoffLongitude,
    } = req.body as any as CreateBookingBody;

    if (!passengerId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (
      !tripId ||
      !pickupAddress ||
      !dropoffAddress ||
      typeof pickupLatitude !== 'number' ||
      typeof pickupLongitude !== 'number' ||
      typeof dropoffLatitude !== 'number' ||
      typeof dropoffLongitude !== 'number'
    ) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    // Load trip
    const tripResult = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND status = $2',
      [tripId, 'scheduled']
    );
    if (tripResult.rows.length === 0) {
      res.status(400).json({ success: false, error: 'Trip not available' });
      return;
    }
    const trip = tripResult.rows[0];

    if (trip.available_seats <= 0) {
      res.status(400).json({ success: false, error: 'No seats available' });
      return;
    }

    // Check if passenger already booked this trip
    const existingBooking = await pool.query(
      `SELECT id FROM bookings 
       WHERE trip_id = $1 AND passenger_id = $2 
         AND booking_status IN ('confirmed','completed')`,
      [tripId, passengerId]
    );
    if (existingBooking.rows.length > 0) {
      res
        .status(400)
        .json({ success: false, error: 'You already have a booking on this trip' });
      return;
    }

    const fullRouteDistance = parseFloat(trip.total_distance_km || '0');
    if (!fullRouteDistance || fullRouteDistance <= 0) {
      res.status(400).json({ success: false, error: 'Trip distance not available' });
      return;
    }

    // Calculate passenger distance and partial distance factor
    let passengerDistanceKm = 0;
    if (navigationService) {
      const passengerRoute = await navigationService.calculateRoute(
        { latitude: pickupLatitude, longitude: pickupLongitude },
        { latitude: dropoffLatitude, longitude: dropoffLongitude }
      );
      passengerDistanceKm = passengerRoute.distance;
    } else {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(dropoffLatitude - pickupLatitude);
      const dLon = toRad(dropoffLongitude - pickupLongitude);
      const lat1 = toRad(pickupLatitude);
      const lat2 = toRad(dropoffLatitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
          Math.sin(dLon / 2) *
          Math.cos(lat1) *
          Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      passengerDistanceKm = R * c;
    }

    const partialDistanceFactor = Math.max(
      Math.min(passengerDistanceKm / fullRouteDistance, 1),
      0.1
    );

    // Determine new passenger count on this trip
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM bookings
       WHERE trip_id = $1
         AND booking_status IN ('confirmed','completed')`,
      [tripId]
    );
    const currentPassengerCount = countResult.rows[0]?.count || 0;
    const newPassengerCount = currentPassengerCount + 1;

    // Use pricing engine
    const fuelRatePerKm = parseFloat(trip.fuel_rate_per_km || '25');
    const vehicleFactor = parseFloat(trip.vehicle_factor || '1');

    const pricing = pricingEngine.calculatePricing({
      distance: fullRouteDistance,
      fuelRatePerKm,
      vehicleFactor,
      numberOfPassengers: Math.min(newPassengerCount, 3),
      partialDistanceFactor,
    });

    const passengerCost = pricing.costPerPassenger;
    const driverContribution = pricing.driverContribution;

    // Insert booking and update available seats atomically
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Re-check seats inside transaction
      const tripCheck = await client.query(
        'SELECT available_seats FROM trips WHERE id = $1 FOR UPDATE',
        [tripId]
      );
      if (
        tripCheck.rows.length === 0 ||
        tripCheck.rows[0].available_seats <= 0
      ) {
        await client.query('ROLLBACK');
        res.status(400).json({ success: false, error: 'No seats available' });
        return;
      }

      const bookingInsert = await client.query(
        `INSERT INTO bookings (
           trip_id,
           passenger_id,
           pickup_address,
           pickup_latitude,
           pickup_longitude,
           dropoff_address,
           dropoff_latitude,
           dropoff_longitude,
           distance_km,
           partial_distance_factor,
           passenger_cost,
           driver_contribution,
           payment_status,
           booking_status
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending','confirmed'
         )
         RETURNING *`,
        [
          tripId,
          passengerId,
          pickupAddress,
          pickupLatitude,
          pickupLongitude,
          dropoffAddress,
          dropoffLatitude,
          dropoffLongitude,
          passengerDistanceKm,
          partialDistanceFactor,
          passengerCost,
          driverContribution,
        ]
      );

      await client.query(
        `UPDATE trips
         SET available_seats = available_seats - 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [tripId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: {
          booking: bookingInsert.rows[0],
          pricing: {
            passengerCost,
            driverContribution,
            partialDistanceFactor,
          },
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    next(new AppError('Failed to create booking', 500));
  }
};

export const getBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT * FROM bookings
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch bookings', 500));
  }
};

export const getBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [
      id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to fetch booking', 500));
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const bookingResult = await client.query(
        `SELECT * FROM bookings WHERE id = $1 FOR UPDATE`,
        [id]
      );
      if (bookingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ success: false, error: 'Booking not found' });
        return;
      }
      const booking = bookingResult.rows[0];

      if (
        booking.passenger_id !== userId &&
        req.user?.role !== 'driver' &&
        req.user?.role !== 'admin'
      ) {
        await client.query('ROLLBACK');
        res.status(403).json({
          success: false,
          error: 'Not allowed to cancel this booking',
        });
        return;
      }

      if (booking.booking_status === 'cancelled') {
        await client.query('ROLLBACK');
        res.json({ success: true, message: 'Booking already cancelled' });
        return;
      }

      await client.query(
        `UPDATE bookings
         SET booking_status = 'cancelled',
             cancellation_reason = $1,
             cancelled_by = $2,
             cancelled_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [cancellationReason || null, userId, id]
      );

      await client.query(
        `UPDATE trips
         SET available_seats = available_seats + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [booking.trip_id]
      );

      await client.query('COMMIT');
      res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    next(new AppError('Failed to cancel booking', 500));
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT b.*, t.trip_date, t.trip_time
       FROM bookings b
       JOIN trips t ON t.id = b.trip_id
       WHERE b.passenger_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch my bookings', 500));
  }
};


