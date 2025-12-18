#!/bin/bash

# Admin Portal Deployment Script for Vercel

echo "🚀 Deploying Admin Portal to Vercel..."
echo ""

cd "$(dirname "$0")"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Set API URL
API_URL="https://carpooling-api-production-36c8.up.railway.app/api"
echo "🔧 API URL: $API_URL"
echo "VITE_API_URL=$API_URL" > .env.production

echo ""
echo "📋 Make sure you're logged in to Vercel:"
echo "   Run: vercel login"
echo ""
read -p "Press Enter when ready to deploy..."

# Deploy
echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Copy your Vercel URL from above"
    echo "   2. Set in Railway Variables:"
    echo "      FRONTEND_URL=https://your-vercel-url.vercel.app"
    echo "      ADMIN_URL=https://your-vercel-url.vercel.app"
    echo "   3. Test login: admin@carpool.local / admin123"
else
    echo ""
    echo "❌ Deployment failed. Check errors above."
    exit 1
fi

