#!/bin/bash

# Android APK Build Script
# This script builds the Android APK using EAS Build

echo "🚀 Starting Android APK Build Process..."
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if logged in
echo "📋 Checking EAS login status..."
if ! eas whoami &> /dev/null; then
    echo "🔐 Please login to Expo:"
    eas login
fi

# Navigate to mobile directory
cd "$(dirname "$0")"

# Update API URL if provided
if [ ! -z "$1" ]; then
    echo "🔧 Updating API URL to: $1"
    # Update eas.json with provided API URL
    sed -i.bak "s|https://your-api.railway.app/api|$1|g" eas.json
fi

# Build APK
echo ""
echo "🏗️  Building Android APK..."
echo "This may take 10-15 minutes..."
echo ""

eas build --platform android --profile production --non-interactive

# Check build status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📥 To download your APK:"
    echo "   1. Visit: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds"
    echo "   2. Or run: eas build:list"
    echo ""
    echo "📱 To install on device:"
    echo "   - Download the APK from the link above"
    echo "   - Transfer to your Android device"
    echo "   - Enable 'Install from Unknown Sources' in settings"
    echo "   - Install the APK"
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi

