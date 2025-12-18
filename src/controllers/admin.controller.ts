import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const adminLogin = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1 AND role = $2',
      [email, 'admin']
    );

    if (result.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, fullName: user.full_name } }
    });
  } catch (error) {
    next(new AppError('Login failed', 500));
  }
};

export const verifyAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    next(new AppError('Verification failed', 500));
  }
};

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone_number, role, is_verified, is_active, created_at, last_login
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch users', 500));
  }
};

export const updateUserStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2',
      [is_active, id]
    );

    res.json({ success: true, data: { id, is_active } });
  } catch (error) {
    next(new AppError('Failed to update user status', 500));
  }
};

export const resetUserPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, id]
    );

    // In production, send via SMS/email
    console.log(`Temp password for user ${id}: ${tempPassword}`);

    res.json({ success: true, message: 'Password reset sent' });
  } catch (error) {
    next(new AppError('Failed to reset password', 500));
  }
};

export const getKYCRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT dk.*, u.full_name, u.phone_number, u.email
       FROM driver_kyc dk
       JOIN users u ON u.id = dk.user_id
       WHERE dk.verification_status = 'pending'
       ORDER BY dk.created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch KYC requests', 500));
  }
};

export const approveKYC = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE driver_kyc
       SET verification_status = 'approved',
           rejection_reason = NULL,
           verified_by = $1,
           verified_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [adminId, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'KYC record not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to approve KYC', 500));
  }
};

export const rejectKYC = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    const result = await pool.query(
      `UPDATE driver_kyc
       SET verification_status = 'rejected',
           rejection_reason = $1,
           verified_by = $2,
           verified_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [reason || null, adminId, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'KYC record not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to reject KYC', 500));
  }
};

export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [users, trips, bookings, subscriptions] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM trips').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*)::int AS count FROM bookings').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*)::int AS count FROM subscriptions WHERE status = 'active'").catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    // Additional metrics with error handling for missing tables
    let revenue = { rows: [{ total: 0 }] };
    let avgDistance = { rows: [{ avg: 0 }] };
    let occupancy = { rows: [{ rate: 0 }] };
    let pendingKYC = { rows: [{ count: 0 }] };
    let activeDrivers = { rows: [{ count: 0 }] };

    try {
      revenue = await pool.query("SELECT COALESCE(SUM(amount), 0)::int AS total FROM payments WHERE status = 'completed'");
    } catch {}
    
    try {
      avgDistance = await pool.query('SELECT COALESCE(AVG(distance_km), 0)::float AS avg FROM trips');
    } catch {}
    
    try {
      occupancy = await pool.query(`
        SELECT CASE 
          WHEN COUNT(*) = 0 THEN 0 
          ELSE SUM(seats_filled)::float / SUM(seats_offered) 
        END AS rate
        FROM trips
      `);
    } catch {}
    
    try {
      pendingKYC = await pool.query("SELECT COUNT(*)::int AS count FROM driver_kyc WHERE verification_status = 'pending'");
    } catch {}
    
    try {
      activeDrivers = await pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'driver' AND is_active = true AND is_verified = true");
    } catch {}

    res.json({
      success: true,
      data: {
        totalUsers: users.rows[0].count,
        totalTrips: trips.rows[0].count,
        totalBookings: bookings.rows[0].count,
        activeSubscriptions: subscriptions.rows[0].count,
        totalRevenue: revenue.rows[0].total,
        averageTripDistance: avgDistance.rows[0].avg,
        occupancyRate: occupancy.rows[0].rate,
        pendingKYC: pendingKYC.rows[0].count,
        activeDrivers: activeDrivers.rows[0].count,
      },
    });
  } catch (error) {
    next(new AppError('Failed to fetch analytics', 500));
  }
};

export const getRecentActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Mock recent activity data - in production this would query actual activity logs
    const mockActivity = [
      {
        id: '1',
        type: 'user' as const,
        description: 'New user registration: John Doe',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: '2',
        type: 'kyc' as const,
        description: 'KYC submitted by: Ahmed Ali',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      },
      {
        id: '3',
        type: 'trip' as const,
        description: 'New trip created: Islamabad to Rawalpindi',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: '4',
        type: 'booking' as const,
        description: 'Booking completed: G13 to Blue Area',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }
    ];

    res.json({ success: true, data: mockActivity });
  } catch (error) {
    next(new AppError('Failed to fetch recent activity', 500));
  }
};

export const getDisputes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Placeholder – disputes table not yet modelled. Kept for future use.
  res.json({ success: true, data: [] });
};

export const resolveDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolution_notes } = req.body;
    // Placeholder implementation
    res.json({ success: true, data: { id, status: 'resolved', resolution_notes } });
  } catch (error) {
    next(new AppError('Failed to resolve dispute', 500));
  }
};

export const dismissDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    // Placeholder implementation
    res.json({ success: true, data: { id, status: 'dismissed' } });
  } catch (error) {
    next(new AppError('Failed to dismiss dispute', 500));
  }
};

export const getVehicles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.full_name AS driver_name, u.phone_number AS driver_phone
       FROM vehicles v
       JOIN users u ON u.id = v.user_id
       ORDER BY v.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch vehicles', 500));
  }
};

export const getRoutes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.full_name AS driver_name, u.phone_number AS driver_phone
       FROM trips t
       JOIN users u ON u.id = t.user_id
       ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(new AppError('Failed to fetch routes', 500));
  }
};

export const getPricingConfig = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Return default config; in production this would be stored in a settings table
    res.json({
      success: true,
      data: {
        fuel_rate_per_km: 25,
        vehicle_factors: {
          petrol: 1.0,
          diesel: 0.9,
          cng: 0.7,
          hybrid: 0.8,
          electric: 0.6,
        },
        driver_share_factor_single_passenger: 0.5,
      },
    });
  } catch (error) {
    next(new AppError('Failed to fetch pricing config', 500));
  }
};

export const updatePricingConfig = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Placeholder implementation – would persist to settings table
    res.json({ success: true, data: req.body });
  } catch (error) {
    next(new AppError('Failed to update pricing config', 500));
  }
};

export const getReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [revenue, trips, bookings, avgDistance, occupancy] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(amount), 0)::int AS total FROM payments WHERE status = 'completed'"),
      pool.query('SELECT COUNT(*)::int AS count FROM trips'),
      pool.query('SELECT COUNT(*)::int AS count FROM bookings'),
      pool.query('SELECT COALESCE(AVG(distance_km), 0)::float AS avg FROM trips'),
      pool.query(`
        SELECT CASE 
          WHEN COUNT(*) = 0 THEN 0 
          ELSE SUM(seats_filled)::float / SUM(seats_offered) 
        END AS rate
        FROM trips
      `),
    ]);

    const data = {
      totalRevenue: revenue.rows[0].total,
      totalTrips: trips.rows[0].count,
      totalBookings: bookings.rows[0].count,
      averageTripDistance: avgDistance.rows[0].avg,
      occupancyRate: occupancy.rows[0].rate,
      topRoutes: [], // Placeholder
      subscriptionsByMonth: [], // Placeholder
    };

    res.json({ success: true, data });
  } catch (error) {
    next(new AppError('Failed to fetch reports', 500));
  }
};


