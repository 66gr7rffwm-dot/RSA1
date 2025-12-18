#!/bin/bash

# Local APK Build Script
# Uses EAS local build which builds on your machine (faster than cloud)

echo "📱 Building Android APK Locally..."
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

echo "🚀 Starting LOCAL build (builds on your machine, not cloud)..."
echo "⏳ This will take 5-10 minutes (faster than cloud build)..."
echo ""

# Build locally - this builds on YOUR machine, not Expo's servers
eas build --platform android --profile production --local

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed!"
    echo ""
    
    # Find the APK
    APK_PATH=$(find . -name "*.apk" -type f | grep -E "(release|production)" | head -1)
    
    if [ -n "$APK_PATH" ]; then
        echo "📁 APK Location: $(pwd)/$APK_PATH"
        echo ""
        ls -lh "$APK_PATH"
        echo ""
        echo "📱 Ready to install on Android device!"
    else
        echo "📋 APK should be in the build output directory"
        echo "💡 Check: android/app/build/outputs/apk/release/"
    fi
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi

