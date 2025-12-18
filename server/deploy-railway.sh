#!/bin/bash

# Railway Deployment Script
# This script helps deploy the backend to Railway

echo "🚂 Railway Deployment Script"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

# Navigate to server directory
cd "$(dirname "$0")"

echo "📋 Current Railway status:"
railway status

echo ""
echo "🚀 To deploy:"
echo "   1. Run: railway up"
echo "   2. Set environment variables in Railway dashboard"
echo "   3. Add PostgreSQL database service"
echo ""
echo "📝 Required Environment Variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=5001"
echo "   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
echo "   - JWT_SECRET (generate a strong secret)"
echo "   - FRONTEND_URL (your admin portal URL)"
echo "   - ADMIN_URL (your admin portal URL)"
echo ""
echo "🔧 To run migrations:"
echo "   railway run psql \$DATABASE_URL -f src/database/schema.sql"
echo "   railway run psql \$DATABASE_URL -f src/database/migrations/001_roles_permissions.sql"
echo "   railway run node create-admin-user.js"
echo ""

