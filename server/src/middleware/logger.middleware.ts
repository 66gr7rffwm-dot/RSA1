/**
 * API Logging Middleware
 * Logs all API requests and responses for debugging and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { pool } from '../database/connection';

export interface LogEntry {
  id?: string;
  method: string;
  path: string;
  query?: string;
  body?: any;
  headers?: any;
  status_code?: number;
  response_body?: any;
  error_message?: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  duration_ms?: number;
  created_at?: Date;
}

// In-memory log buffer for performance (flushes to DB periodically)
const logBuffer: LogEntry[] = [];
const BUFFER_SIZE = 50;
const FLUSH_INTERVAL = 10000; // 10 seconds

// Initialize log table if it doesn't exist
export const initializeLogTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id SERIAL PRIMARY KEY,
        method VARCHAR(10) NOT NULL,
        path TEXT NOT NULL,
        query TEXT,
        body JSONB,
        headers JSONB,
        status_code INTEGER,
        response_body JSONB,
        error_message TEXT,
        user_id VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        duration_ms INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_api_logs_path ON api_logs(path);
      CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);
      CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
    `);

    console.log('✅ API logs table initialized');
  } catch (error) {
    console.error('❌ Failed to initialize logs table:', error);
  }
};

// Flush logs to database
const flushLogs = async () => {
  if (logBuffer.length === 0) return;

  const logsToInsert = [...logBuffer];
  logBuffer.length = 0;

  try {
    // Insert logs one by one to avoid SQL injection and parameter issues
    for (const log of logsToInsert) {
      await pool.query(
        `INSERT INTO api_logs (
          method, path, query, body, headers, status_code, 
          response_body, error_message, user_id, ip_address, 
          user_agent, duration_ms, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          log.method,
          log.path,
          log.query || null,
          log.body ? JSON.stringify(log.body) : null,
          log.headers ? JSON.stringify(log.headers) : null,
          log.status_code || null,
          log.response_body ? JSON.stringify(log.response_body) : null,
          log.error_message || null,
          log.user_id || null,
          log.ip_address || null,
          log.user_agent || null,
          log.duration_ms || null,
          log.created_at || new Date()
        ]
      );
    }
  } catch (error) {
    console.error('❌ Failed to flush logs to database:', error);
    // Re-add logs to buffer if flush failed
    logBuffer.unshift(...logsToInsert);
  }
};

// Start periodic flush
setInterval(flushLogs, FLUSH_INTERVAL);

// Logging middleware
export const apiLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  const logEntry: LogEntry = {
    method: req.method,
    path: req.path,
    query: req.query && Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : undefined,
    body: req.body && Object.keys(req.body).length > 0 ? sanitizeBody(req.body) : undefined,
    headers: sanitizeHeaders(req.headers),
    ip_address: req.ip || req.socket.remoteAddress || undefined,
    user_agent: req.get('user-agent') || undefined,
    user_id: (req as any).user?.userId || undefined,
    created_at: new Date(),
  };

  // Capture response
  const originalSend = res.send;
  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    
    logEntry.status_code = res.statusCode;
    logEntry.duration_ms = duration;
    
    // Only log response body for errors or if it's small
    if (res.statusCode >= 400 || (body && typeof body === 'string' && body.length < 1000)) {
      try {
        logEntry.response_body = typeof body === 'string' ? JSON.parse(body) : body;
      } catch {
        logEntry.response_body = { message: 'Non-JSON response' };
      }
    }

    // Add to buffer
    if (logBuffer.length >= BUFFER_SIZE) {
      flushLogs(); // Force flush if buffer is full
    } else {
      logBuffer.push({ ...logEntry });
    }

    return originalSend.call(this, body);
  };

  // Capture errors
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logEntry.error_message = `HTTP ${res.statusCode}`;
    }
  });

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const logEntry: LogEntry = {
    method: req.method,
    path: req.path,
    status_code: (res as any).statusCode || 500,
    error_message: error.message,
    user_id: (req as any).user?.userId || undefined,
    ip_address: req.ip || req.socket.remoteAddress || undefined,
    user_agent: req.get('user-agent') || undefined,
    created_at: new Date(),
  };

  // Add to buffer immediately for errors
  logBuffer.push(logEntry);
  if (logBuffer.length >= BUFFER_SIZE) {
    flushLogs();
  }

  next(error);
};

// Sanitize sensitive data from request body
const sanitizeBody = (body: any): any => {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
};

// Sanitize sensitive headers
const sanitizeHeaders = (headers: any): any => {
  const sanitized: any = {};
  const allowedHeaders = ['content-type', 'user-agent', 'accept', 'content-length'];
  
  for (const [key, value] of Object.entries(headers)) {
    if (allowedHeaders.includes(key.toLowerCase()) || !key.toLowerCase().includes('auth')) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Manual log function for application logs
export const logApplicationEvent = async (
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  metadata?: any
) => {
  const logEntry: LogEntry = {
    method: 'APP',
    path: `/logs/${level}`,
    body: { level, message, ...metadata },
    status_code: level === 'error' ? 500 : 200,
    created_at: new Date(),
  };

  logBuffer.push(logEntry);
  if (logBuffer.length >= BUFFER_SIZE) {
    await flushLogs();
  }
};

