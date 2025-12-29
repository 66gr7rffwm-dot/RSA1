#!/bin/bash

# Build APK with correct Java version
# This script sets Java 17 and builds the APK

cd "$(dirname "$0")"

echo "🔧 Setting up Java 17..."
export JAVA_HOME=/Users/hafizamjad/.gradle/jdks/eclipse_adoptium-17-aarch64-os_x.2/jdk-17.0.15+6/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo "✅ Using Java:"
$JAVA_HOME/bin/java -version

echo ""
echo "🏗️  Building APK..."
echo "⏳ This will take 5-10 minutes..."
echo ""

./gradlew clean assembleRelease --no-daemon

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        echo "📁 APK Location: $(pwd)/$APK_PATH"
        echo ""
        ls -lh "$APK_PATH"
        echo ""
        echo "📱 Ready to install on Android device!"
        echo ""
        echo "💡 To copy to desktop:"
        echo "   cp $APK_PATH ~/Desktop/carpooling-app.apk"
    else
        echo "⚠️  APK not found at expected location"
        echo "🔍 Searching for APK..."
        find . -name "*.apk" -type f
    fi
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi

