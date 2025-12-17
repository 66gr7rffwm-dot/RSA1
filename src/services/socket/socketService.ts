/**
 * Socket.io Service
 * Handles real-time notifications and updates
 */

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { pool } from '../../database/connection';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export function initializeSocket(io: Server): void {
  // Authentication middleware for Socket.io
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
        userId: string;
        role: string;
      };

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    // Handle trip updates
    socket.on('join_trip', (tripId: string) => {
      socket.join(`trip_${tripId}`);
      console.log(`User ${socket.userId} joined trip ${tripId}`);
    });

    socket.on('leave_trip', (tripId: string) => {
      socket.leave(`trip_${tripId}`);
      console.log(`User ${socket.userId} left trip ${tripId}`);
    });

    // Handle SOS alerts
    socket.on('sos_alert', async (data: { tripId?: string; location: any }) => {
      // Broadcast SOS to admin and relevant users
      io.to('admin').emit('sos_alert', {
        userId: socket.userId,
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
}

/**
 * Send notification to user
 */
export function sendNotificationToUser(
  io: Server,
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }
): void {
  // Save to database
  pool.query(
    `INSERT INTO notifications (user_id, type, title, message, data)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, notification.type, notification.title, notification.message, JSON.stringify(notification.data || {})]
  );

  // Send via socket
  io.to(`user_${userId}`).emit('notification', notification);
}

/**
 * Broadcast trip update
 */
export function broadcastTripUpdate(io: Server, tripId: string, update: any): void {
  io.to(`trip_${tripId}`).emit('trip_update', update);
}

