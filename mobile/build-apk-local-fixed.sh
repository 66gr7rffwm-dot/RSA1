#!/bin/bash

echo "📱 Building Android APK Locally (Java 17 + Gradle 7.6.3)"
echo ""

cd "$(dirname "$0")"

# Force Java 17 for React Native 0.72.10 compatibility
export JAVA_HOME=/Users/hafizamjad/.gradle/jdks/eclipse_adoptium-17-aarch64-os_x.2/jdk-17.0.15+6/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo "☕ Java version:"
$JAVA_HOME/bin/java -version
echo ""

# Clear Gradle cache to avoid version conflicts
echo "🧹 Clearing Gradle cache..."
rm -rf ~/.gradle/caches/7.6.3 ~/.gradle/caches/8.*
echo "✅ Cache cleared"
echo ""

# Prebuild if needed
if [ ! -d "android" ]; then
  echo "📦 Running expo prebuild..."
  npx expo prebuild --platform android
fi

# Build APK
echo "🔨 Building APK with Java 17..."
cd android
JAVA_HOME="$JAVA_HOME" PATH="$JAVA_HOME/bin:$PATH" ./gradlew clean assembleRelease --no-daemon

# Check result
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
  echo ""
  echo "✅ APK built successfully!"
  echo ""
  echo "📱 Location:"
  echo "   $(pwd)/app/build/outputs/apk/release/app-release.apk"
  echo ""
  echo "📊 APK Size:"
  ls -lh app/build/outputs/apk/release/app-release.apk
  echo ""
  echo "📥 To install on device:"
  echo "   1. Transfer APK to your Android device"
  echo "   2. Enable 'Install from Unknown Sources' in settings"
  echo "   3. Install the APK"
else
  echo ""
  echo "❌ Build failed. Check errors above."
  exit 1
fi

