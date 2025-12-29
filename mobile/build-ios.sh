#!/bin/bash

# iOS Build Script
# Builds iOS app using EAS Build

echo "🍎 Building iOS App..."
echo ""

cd "$(dirname "$0")"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if logged in
if ! eas whoami &> /dev/null; then
    echo "🔐 Please login to Expo:"
    eas login
fi

echo "🚀 Starting iOS build..."
echo "⏳ This will take 15-20 minutes..."
echo ""

# Build iOS app
eas build --platform ios --profile preview

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed!"
    echo ""
    echo "📥 Next steps:"
    echo "   1. Check build status: eas build:list --platform ios"
    echo "   2. Download IPA from Expo dashboard"
    echo "   3. Install via TestFlight or Xcode"
    echo ""
    echo "🌐 Dashboard: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds"
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi
