/**
 * Logs Controller
 * Handles retrieval of API and application logs
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';

// Public endpoint - log crashes from mobile app
export const logCrash = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      type,
      message,
      stack,
      componentStack,
      timestamp,
      platform,
      appVersion,
      buildNumber,
      deviceInfo,
      userId,
      screenName,
    } = req.body;

    // Ensure crash_logs table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crash_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL DEFAULT 'app_crash',
        message TEXT NOT NULL,
        stack TEXT,
        component_stack TEXT,
        platform VARCHAR(20),
        app_version VARCHAR(20),
        build_number INTEGER,
        device_info JSONB,
        user_id UUID,
        screen_name VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert crash log
    await pool.query(
      `INSERT INTO crash_logs (
        type, message, stack, component_stack, platform,
        app_version, build_number, device_info, user_id,
        screen_name, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        type || 'app_crash',
        message || 'Unknown error',
        stack,
        componentStack,
        platform || 'unknown',
        appVersion,
        buildNumber,
        JSON.stringify(deviceInfo || {}),
        userId,
        screenName,
        req.ip,
        req.headers['user-agent'],
      ]
    );

    console.log(`🚨 CRASH REPORTED: ${message} (${platform} v${appVersion})`);

    res.json({
      success: true,
      message: 'Crash report received',
    });
  } catch (error) {
    console.error('Failed to log crash:', error);
    // Don't fail the request - just acknowledge it
    res.json({
      success: true,
      message: 'Crash report acknowledged',
    });
  }
};

// Get crash logs (admin only)
export const getCrashLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      platform,
      appVersion,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM crash_logs WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (platform) {
      paramCount++;
      query += ` AND platform = $${paramCount}`;
      params.push(platform);
    }

    if (appVersion) {
      paramCount++;
      query += ` AND app_version = $${paramCount}`;
      params.push(appVersion);
    }

    if (startDate) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT $' + (paramCount + 1) + ' OFFSET $' + (paramCount + 2);
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        crashes: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(new AppError('Failed to fetch crash logs', 500));
  }
};

export const getLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      method,
      path,
      statusCode,
      userId,
      startDate,
      endDate,
      search,
      level,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM api_logs WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    // Filters
    if (method) {
      paramCount++;
      query += ` AND method = $${paramCount}`;
      params.push(method);
    }

    if (path) {
      paramCount++;
      query += ` AND path ILIKE $${paramCount}`;
      params.push(`%${path}%`);
    }

    if (statusCode) {
      paramCount++;
      query += ` AND status_code = $${paramCount}`;
      params.push(parseInt(statusCode as string, 10));
    }

    if (userId) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    if (startDate) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        path ILIKE $${paramCount} OR 
        error_message ILIKE $${paramCount} OR
        user_agent ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    if (level) {
      paramCount++;
      if (level === 'error') {
        query += ` AND (status_code >= 400 OR error_message IS NOT NULL)`;
      } else if (level === 'success') {
        query += ` AND status_code < 400 AND error_message IS NULL`;
      }
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT $' + (paramCount + 1) + ' OFFSET $' + (paramCount + 2);
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        logs: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(new AppError('Failed to fetch logs', 500));
  }
};

export const getLogStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: any[] = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at >= $1 AND created_at <= $2';
      params.push(startDate, endDate);
    }

    // Get stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors,
        COUNT(CASE WHEN status_code < 400 THEN 1 END) as success,
        AVG(duration_ms) as avg_duration,
        MAX(duration_ms) as max_duration,
        COUNT(DISTINCT path) as unique_endpoints,
        COUNT(DISTINCT user_id) as unique_users
      FROM api_logs
      ${dateFilter}
    `;

    const statsResult = await pool.query(statsQuery, params);

    // Get top endpoints
    const topEndpointsQuery = `
      SELECT 
        path,
        method,
        COUNT(*) as request_count,
        AVG(duration_ms) as avg_duration,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
      FROM api_logs
      ${dateFilter}
      GROUP BY path, method
      ORDER BY request_count DESC
      LIMIT 10
    `;

    const topEndpointsResult = await pool.query(topEndpointsQuery, params);

    // Get error breakdown
    const errorBreakdownQuery = `
      SELECT 
        status_code,
        COUNT(*) as count
      FROM api_logs
      WHERE status_code >= 400 ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
      GROUP BY status_code
      ORDER BY count DESC
    `;

    const errorBreakdownResult = await pool.query(errorBreakdownQuery, params);

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0],
        topEndpoints: topEndpointsResult.rows,
        errorBreakdown: errorBreakdownResult.rows,
      },
    });
  } catch (error) {
    next(new AppError('Failed to fetch log stats', 500));
  }
};

export const deleteLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { olderThan } = req.query; // Days

    if (!olderThan) {
      res.status(400).json({
        success: false,
        error: 'olderThan parameter is required (in days)',
      });
      return;
    }

    const days = parseInt(olderThan as string, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await pool.query(
      'DELETE FROM api_logs WHERE created_at < $1 RETURNING id',
      [cutoffDate]
    );

    res.json({
      success: true,
      message: `Deleted ${result.rowCount} log entries older than ${days} days`,
      deletedCount: result.rowCount,
    });
  } catch (error) {
    next(new AppError('Failed to delete logs', 500));
  }
};

