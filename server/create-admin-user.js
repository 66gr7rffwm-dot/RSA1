const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'carpooling_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function createAdminUser() {
  try {
    // Default admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@carpool.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const adminPhone = process.env.ADMIN_PHONE || '+923000000000';

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if user exists by email or phone
    const existingUser = await pool.query(
      'SELECT id, email, phone_number, role FROM users WHERE email = $1 OR phone_number = $2',
      [adminEmail, adminPhone]
    );

    let result;
    if (existingUser.rows.length > 0) {
      // Update existing user to admin - ensure it's active and verified
      result = await pool.query(
        `UPDATE users 
         SET password_hash = $1, role = $2, full_name = $3, is_verified = $4, is_active = $5, email = $6
         WHERE email = $7 OR phone_number = $8
         RETURNING id, phone_number, email, role, full_name, is_active, is_verified`,
        [passwordHash, 'admin', adminName, true, true, adminEmail, adminEmail, adminPhone]
      );
      console.log('Updated existing admin user');
    } else {
      // Create new admin user
      result = await pool.query(
        `INSERT INTO users (phone_number, email, password_hash, full_name, role, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, phone_number, email, role, full_name`,
        [adminPhone, adminEmail, passwordHash, adminName, 'admin', true, true]
      );
    }

    console.log('\n✅ Admin user created/updated successfully!\n');
    console.log('=== ADMIN CREDENTIALS ===');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    console.log('Status: Active & Verified\n');
    console.log('You can now login to the admin portal at: http://localhost:5173\n');

    await pool.end();
  } catch (error) {
    console.error('Error creating admin user:', error);
    await pool.end();
    process.exit(1);
  }
}

createAdminUser();

