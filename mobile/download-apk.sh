#!/bin/bash

# Auto-download APK when build completes
# This script monitors the build and downloads the APK automatically

echo "📱 APK Auto-Download Script"
echo ""

cd "$(dirname "$0")"

# Start a new build
echo "🚀 Starting new build..."
BUILD_OUTPUT=$(eas build --platform android --profile production --non-interactive 2>&1)
BUILD_ID=$(echo "$BUILD_OUTPUT" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)

if [ -z "$BUILD_ID" ]; then
    echo "❌ Failed to start build. Checking existing builds..."
    BUILD_ID=$(eas build:list --platform android --limit 1 2>&1 | grep "^ID" | head -1 | awk '{print $2}')
fi

if [ -z "$BUILD_ID" ]; then
    echo "❌ No build found. Please run: eas build --platform android --profile production"
    exit 1
fi

echo "✅ Build ID: $BUILD_ID"
echo ""
echo "⏳ Waiting for build to complete (this may take 10-15 minutes)..."
echo "💡 You can check status at: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds/$BUILD_ID"
echo ""

# Poll for build completion
MAX_WAIT=1800  # 30 minutes
ELAPSED=0
INTERVAL=30    # Check every 30 seconds

while [ $ELAPSED -lt $MAX_WAIT ]; do
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    
    STATUS=$(eas build:list --platform android --limit 1 2>&1 | grep -i "status" | head -1 | awk '{print $2}')
    
    echo "[$((ELAPSED/60))m] Status: $STATUS"
    
    if [ "$STATUS" = "finished" ] || [ "$STATUS" = "Finished" ]; then
        echo ""
        echo "✅ Build completed! Downloading APK..."
        echo ""
        
        # Try to download
        eas build:download $BUILD_ID --output ./carpooling-app.apk 2>&1
        
        if [ -f "./carpooling-app.apk" ]; then
            echo ""
            echo "✅ APK downloaded successfully!"
            echo "📁 Location: $(pwd)/carpooling-app.apk"
            echo ""
            ls -lh ./carpooling-app.apk
            echo ""
            echo "📱 Ready to install on Android device!"
        else
            echo ""
            echo "⚠️  Download via CLI failed. Please download manually:"
            echo "   Visit: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds/$BUILD_ID"
        fi
        
        exit 0
    elif [ "$STATUS" = "error" ] || [ "$STATUS" = "Error" ] || [ "$STATUS" = "canceled" ] || [ "$STATUS" = "Canceled" ]; then
        echo ""
        echo "❌ Build failed or was canceled."
        echo "📋 Check logs: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds/$BUILD_ID"
        exit 1
    fi
done

echo ""
echo "⏰ Timeout reached. Build may still be in progress."
echo "📋 Check status: eas build:list"
echo "📥 Download manually: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds/$BUILD_ID"

