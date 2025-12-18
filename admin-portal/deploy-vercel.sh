#!/bin/bash

# Vercel Deployment Script for Admin Portal

echo "▲ Vercel Deployment Script"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to admin-portal directory
cd "$(dirname "$0")"

# Check if API URL is provided
if [ -z "$1" ]; then
    echo "⚠️  Please provide your API URL:"
    echo "   Usage: ./deploy-vercel.sh https://your-api.railway.app/api"
    exit 1
fi

API_URL=$1

echo "🔧 Setting API URL to: $API_URL"
echo ""

# Create .env.production file
echo "VITE_API_URL=$API_URL" > .env.production

echo "🚀 Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Visit your Vercel dashboard to get the URL"
    echo "   2. Update CORS settings in your backend API"
    echo "   3. Test the admin portal login"
else
    echo ""
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi

