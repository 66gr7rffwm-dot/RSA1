const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'carpooling_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function createTestUsers() {
  try {
    // Hash password: "test123"
    const passwordHash = await bcrypt.hash('test123', 10);

    // Create test passenger
    const passenger = await pool.query(
      `INSERT INTO users (phone_number, email, password_hash, full_name, role, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (phone_number) DO UPDATE 
       SET password_hash = $3, is_verified = $6
       RETURNING id, phone_number, email, role, full_name`,
      ['+923001234567', 'passenger@test.com', passwordHash, 'Test Passenger', 'passenger', true, true]
    );

    // Create test driver
    const driver = await pool.query(
      `INSERT INTO users (phone_number, email, password_hash, full_name, role, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (phone_number) DO UPDATE 
       SET password_hash = $3, is_verified = $6
       RETURNING id, phone_number, email, role, full_name`,
      ['+923009876543', 'driver@test.com', passwordHash, 'Test Driver', 'driver', true, true]
    );

    console.log('\n✅ Test users created successfully!\n');
    console.log('=== PASSENGER ACCOUNT ===');
    console.log('Phone: +923001234567');
    console.log('Password: test123');
    console.log('Role: passenger\n');

    console.log('=== DRIVER ACCOUNT ===');
    console.log('Phone: +923009876543');
    console.log('Password: test123');
    console.log('Role: driver\n');

    await pool.end();
  } catch (error) {
    console.error('Error creating test users:', error);
    await pool.end();
    process.exit(1);
  }
}

createTestUsers();
