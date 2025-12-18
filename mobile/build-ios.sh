#!/bin/bash

# iOS Build Script for Carpooling App
# This script will build the iOS app for installation on your device

echo "🚀 Starting iOS Build Process..."
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

echo ""
echo "📦 Building iOS app..."
echo "This will take 10-20 minutes..."
echo ""

# Build for iOS preview
eas build --platform ios --profile preview --non-interactive

echo ""
echo "✅ Build started!"
echo ""
echo "📱 Next Steps:"
echo "1. Wait for build to complete (check email or EAS dashboard)"
echo "2. Download the .ipa file when ready"
echo "3. Install on your iPhone using one of these methods:"
echo "   - TestFlight (recommended)"
echo "   - Xcode Devices window"
echo "   - AltStore or similar tool"
echo ""
echo "🌐 Make sure your backend is running on: http://11.11.10.194:5001"
echo ""

