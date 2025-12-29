# 📱 App Icon Setup Guide

## Current Status
- ✅ Icon configuration updated
- ✅ Splash screen created with build info
- ⚠️ Need to create actual icon image

## Steps to Add App Icon

### Option 1: Use Online Icon Generator (Recommended)

1. **Create Your Icon Design**:
   - Design a 1024x1024px icon
   - Should represent carpooling/ride-sharing
   - Use brand colors (#00A859 green)
   - Include car/ride icon

2. **Generate Icons**:
   - Visit: https://www.appicon.co/ or https://icon.kitchen/
   - Upload your 1024x1024px PNG
   - Select "Android" platform
   - Download the generated icon set

3. **Replace Files**:
   ```bash
   # Extract downloaded icons
   # Replace files in:
   mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
   mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
   mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
   mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
   mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
   
   # And foreground images:
   mobile/android/app/src/main/res/mipmap-*/ic_launcher_foreground.png
   ```

### Option 2: Use Expo CLI

1. **Place Icon**:
   ```bash
   # Place your 1024x1024 icon at:
   mobile/assets/icon.png
   ```

2. **Generate Icons**:
   ```bash
   cd mobile
   npx expo prebuild --platform android --clean
   ```

### Option 3: Manual Creation

Create icons in these sizes:
- **mdpi**: 48x48px
- **hdpi**: 72x72px
- **xhdpi**: 96x96px
- **xxhdpi**: 144x144px
- **xxxhdpi**: 192x192px

Place in respective `mipmap-*` folders.

---

## Icon Design Tips

1. **Simple & Recognizable**: Should be clear at small sizes
2. **Brand Colors**: Use #00A859 (green) as primary
3. **Car Symbol**: Include car/ride icon
4. **No Text**: Avoid text in icon (hard to read at small sizes)
5. **Square Design**: Will be rounded automatically on Android

---

## Current Icon Location

Icons are located in:
```
mobile/android/app/src/main/res/mipmap-*/
```

---

## After Adding Icon

1. **Rebuild APK**:
   ```bash
   cd mobile/android
   ./gradlew clean assembleRelease
   ```

2. **Test Installation**:
   - Install APK on device
   - Verify icon appears correctly
   - Check all sizes display properly

---

## Splash Screen

Splash screen is already configured and will show:
- App logo
- App name: "Carpool"
- Tagline: "Share Rides, Save Money"
- Build version: 1.0.1
- Build date: Current date
- "Powered by: AFC Solutions"

**Location**: `mobile/src/components/SplashScreen.tsx`

---

## Quick Icon Creation

If you need a quick icon, you can:

1. Use a car emoji (🚗) on colored background
2. Use online tools like Canva
3. Hire a designer on Fiverr/Upwork
4. Use AI image generators

---

**Note**: The app will work without a custom icon, but a professional icon improves user experience and brand recognition.

