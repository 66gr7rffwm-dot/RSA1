#!/bin/bash

# Script to connect to Railway project
# Usage: ./connect-railway.sh

echo "🚂 Connecting to Railway Project..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login (will open browser)
echo "📝 Step 1: Logging in to Railway..."
echo "   This will open your browser for authentication."
railway login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo ""
echo "✅ Logged in successfully!"
echo ""

# Link to project
echo "🔗 Step 2: Linking to project 9aec112f-8aae-447a-b2d2-bd411b0976ab..."
railway link --project 9aec112f-8aae-447a-b2d2-bd411b0976ab

if [ $? -ne 0 ]; then
    echo "⚠️  Link command failed. Trying interactive link..."
    railway link
fi

echo ""
echo "📋 Step 3: Checking project status..."
railway status

echo ""
echo "🌐 Step 4: Getting API URL..."
railway domain

echo ""
echo "✅ Connection complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run database migrations:"
echo "   railway run psql \$DATABASE_URL -f src/database/schema.sql"
echo "   railway run psql \$DATABASE_URL -f src/database/migrations/001_roles_permissions.sql"
echo "   railway run node create-admin-user.js"
echo ""
echo "2. Check logs:"
echo "   railway logs"
echo ""

