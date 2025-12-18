#!/bin/bash

# Database Setup Script for Railway
# Usage: ./setup-database.sh

echo "🗄️  Setting up Railway Database..."
echo ""

# Database connection details
DB_HOST="centerbeam.proxy.rlwy.net"
DB_PORT="55752"
DB_USER="postgres"
DB_NAME="railway"
DB_PASSWORD="AQgFWwcbFyngbFHjDSxZabwRTFLhHOHz"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "📋 Step 1: Creating cube extension (for geospatial queries)..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS cube;" 2>&1 | grep -v "already exists" || echo "✅ Extension ready"

echo ""
echo "📋 Step 2: Running database schema..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -d $DB_NAME -f src/database/schema.sql 2>&1 | tail -5

echo ""
echo "📋 Step 3: Running migrations..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -d $DB_NAME -f src/database/migrations/001_roles_permissions.sql 2>&1 | tail -5

echo ""
echo "📋 Step 4: Creating admin user..."
export DATABASE_URL
node -e "
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    const email = 'admin@carpool.local';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    const existing = await pool.query('SELECT id FROM users WHERE email = \$1 OR phone_number = \$2', [email, '+923000000000']);
    
    if (existing.rows.length > 0) {
      await pool.query('UPDATE users SET password_hash = \$1, role = \$2, is_verified = true, is_active = true WHERE email = \$3', [hash, 'admin', email]);
      console.log('✅ Admin user updated');
    } else {
      await pool.query('INSERT INTO users (phone_number, email, password_hash, full_name, role, is_verified, is_active) VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7)', 
        ['+923000000000', email, hash, 'Admin User', 'admin', true, true]);
      console.log('✅ Admin user created');
    }
    
    console.log('');
    console.log('=== ADMIN CREDENTIALS ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
" 2>&1

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set DATABASE_URL in Railway: $DATABASE_URL"
echo "2. Test API: curl https://carpooling-api-production-36c8.up.railway.app/health"
echo "3. Login to admin portal with: admin@carpool.local / admin123"
echo ""

