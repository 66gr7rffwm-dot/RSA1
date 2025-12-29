/**
 * Get OTP from database for testing
 * Usage: node get-otp.js <phone_number>
 * Example: node get-otp.js +923001234567
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

async function getOTP(phoneNumber) {
  try {
    const result = await pool.query(
      `SELECT otp_code, created_at, expires_at, is_used 
       FROM otp_verifications 
       WHERE phone_number = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      console.log(`❌ No OTP found for ${phoneNumber}`);
      console.log('\n💡 Make sure you have registered with this phone number first.');
      return;
    }

    const otp = result.rows[0];
    const now = new Date();
    const expiresAt = new Date(otp.expires_at);
    const isExpired = now > expiresAt;
    const isUsed = otp.is_used;

    console.log('\n📱 OTP Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Phone Number: ${phoneNumber}`);
    console.log(`OTP Code: ${otp.otp_code}`);
    console.log(`Created: ${otp.created_at}`);
    console.log(`Expires: ${otp.expires_at}`);
    console.log(`Status: ${isUsed ? '❌ USED' : isExpired ? '⏰ EXPIRED' : '✅ VALID'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (isUsed) {
      console.log('⚠️  This OTP has already been used.');
      console.log('💡 Try registering again to get a new OTP.\n');
    } else if (isExpired) {
      console.log('⚠️  This OTP has expired.');
      console.log('💡 Try registering again to get a new OTP.\n');
    } else {
      console.log('✅ Use this OTP code in the app to verify your phone number!\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Get phone number from command line
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('❌ Please provide a phone number');
  console.log('Usage: node get-otp.js <phone_number>');
  console.log('Example: node get-otp.js +923001234567');
  process.exit(1);
}

getOTP(phoneNumber);

