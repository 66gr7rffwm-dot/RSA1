/**
 * OTP Service
 * Handles OTP generation and sending via SMS/Email
 */

import { pool } from '../../database/connection';
import twilio from 'twilio';

// Initialize Twilio client only if credentials are provided
const hasTwilioCreds = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
const client = hasTwilioCreds
  ? twilio(
      process.env.TWILIO_ACCOUNT_SID as string,
      process.env.TWILIO_AUTH_TOKEN as string
    )
  : null;

/**
 * Generate 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via SMS using Twilio
 */
export async function sendOTP(phoneNumber: string, otpCode: string): Promise<void> {
  try {
    // Save OTP to database
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    await pool.query(
      `INSERT INTO otp_verifications (phone_number, otp_code, expires_at)
       VALUES ($1, $2, $3)`,
      [phoneNumber, otpCode, expiresAt]
    );

    // Send SMS via Twilio when credentials exist; otherwise log for dev
    if (client && hasTwilioCreds) {
      await client.messages.create({
        body: `Your Carpooling App verification code is: ${otpCode}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    } else {
      // Development mode - just log the OTP
      console.log(`[DEV] OTP for ${phoneNumber}: ${otpCode}`);
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT id, expires_at, is_used 
     FROM otp_verifications 
     WHERE phone_number = $1 
     AND otp_code = $2 
     AND is_used = FALSE 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [phoneNumber, otpCode]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const otpRecord = result.rows[0];

  if (new Date() > new Date(otpRecord.expires_at)) {
    return false;
  }

  // Mark as used
  await pool.query('UPDATE otp_verifications SET is_used = TRUE WHERE id = $1', [
    otpRecord.id,
  ]);

  return true;
}

