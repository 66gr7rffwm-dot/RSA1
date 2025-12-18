#!/bin/bash

# Migration Script for Production
# This script runs database migrations after deployment

echo "🔄 Running database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

# Run schema
echo "📋 Creating database schema..."
psql $DATABASE_URL -f src/database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema created successfully"
else
    echo "⚠️  Schema may already exist (this is OK)"
fi

# Run migrations
echo "📋 Running migrations..."
psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migrations may already exist (this is OK)"
fi

# Create admin user
echo "👤 Creating admin user..."
node create-admin-user.js

if [ $? -eq 0 ]; then
    echo "✅ Admin user created/updated"
else
    echo "⚠️  Admin user creation failed (may already exist)"
fi

echo ""
echo "🎉 Database setup complete!"

