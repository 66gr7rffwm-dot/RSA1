#!/bin/bash

# Simple APK Build Script
# This script downloads the APK from EAS build when ready

echo "📱 APK Build Status Checker"
echo ""

cd "$(dirname "$0")"

# Check EAS build status
echo "🔍 Checking build status..."
BUILD_STATUS=$(eas build:list --platform android --limit 1 --non-interactive 2>&1 | grep -i "status" | head -1)

echo "$BUILD_STATUS"
echo ""

# Get latest build ID
LATEST_BUILD=$(eas build:list --platform android --limit 1 --non-interactive 2>&1 | grep "^ID" | head -1 | awk '{print $2}')

if [ -z "$LATEST_BUILD" ]; then
    echo "❌ No build found. Starting new build..."
    eas build --platform android --profile production --non-interactive
    echo ""
    echo "⏳ Build started. This will take 10-15 minutes."
    echo "📋 Check status: eas build:list"
    echo "📥 Download when ready: eas build:view $LATEST_BUILD"
else
    echo "📋 Latest Build ID: $LATEST_BUILD"
    echo ""
    echo "📥 To download APK:"
    echo "   eas build:view $LATEST_BUILD"
    echo ""
    echo "🌐 Or visit:"
    echo "   https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds/$LATEST_BUILD"
fi

echo ""
echo "💡 Tip: Once build is 'finished', you can download the APK from the Expo dashboard"

