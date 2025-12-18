#!/bin/bash

# Interactive Deployment Script for Railway
# This script guides you through deploying to Railway

echo "🚂 Railway Deployment Assistant"
echo "================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    echo "This will open your browser for authentication."
    railway login
fi

echo ""
echo "✅ Logged in as: $(railway whoami)"
echo ""

# Navigate to server directory
cd "$(dirname "$0")"

# Check if project is linked
if [ ! -f ".railway/project.json" ]; then
    echo "📋 Setting up Railway project..."
    echo ""
    echo "Choose an option:"
    echo "1. Create a new Railway project"
    echo "2. Link to existing project"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        railway init
    else
        railway link
    fi
fi

echo ""
echo "🗄️  Adding PostgreSQL database..."
railway add postgresql

echo ""
echo "⚙️  Setting up environment variables..."
echo ""
echo "Please provide the following:"
read -p "Admin Portal URL (e.g., https://your-admin.vercel.app): " ADMIN_URL
read -p "Frontend URL (same as admin or your mobile app URL): " FRONTEND_URL

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe(32))")

echo ""
echo "🔧 Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set FRONTEND_URL="$FRONTEND_URL"
railway variables set ADMIN_URL="$ADMIN_URL"

echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get the service URL
SERVICE_URL=$(railway domain 2>/dev/null || railway status 2>/dev/null | grep -o 'https://[^ ]*' | head -1)

if [ -z "$SERVICE_URL" ]; then
    echo ""
    echo "📋 Getting service URL from Railway dashboard..."
    echo "Please check your Railway dashboard for the service URL"
    echo "Visit: https://railway.app/dashboard"
else
    echo ""
    echo "✅ Service deployed at: $SERVICE_URL"
    echo "🌐 API URL: $SERVICE_URL/api"
fi

echo ""
echo "📋 Next steps:"
echo "1. Run database migrations:"
echo "   railway run psql \$DATABASE_URL -f src/database/schema.sql"
echo "   railway run psql \$DATABASE_URL -f src/database/migrations/001_roles_permissions.sql"
echo "   railway run node create-admin-user.js"
echo ""
echo "2. Test your API:"
echo "   curl $SERVICE_URL/health"
echo ""
echo "3. Update mobile app and admin portal with API URL: $SERVICE_URL/api"
echo ""

