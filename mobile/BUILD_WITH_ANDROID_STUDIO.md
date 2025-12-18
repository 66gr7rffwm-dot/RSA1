# 📱 Build APK with Android Studio

Yes! You can build the APK using Android Studio. Here's how:

## 🎯 Two Options

### Option 1: Using Expo Prebuild (Recommended)
This generates the native Android project that you can open in Android Studio.

### Option 2: Using EAS Build Locally
Build on your machine instead of Expo's servers.

---

## 🚀 Option 1: Expo Prebuild + Android Studio

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Generate Android Project

```bash
# Install Expo CLI if not already installed
npm install -g expo-cli

# Generate native Android project
npx expo prebuild --platform android
```

This creates an `android/` folder with the native Android project.

### Step 3: Open in Android Studio

1. **Open Android Studio**
2. **File** → **Open**
3. **Navigate to:** `mobile/android/`
4. **Click OK**

Android Studio will:
- Sync Gradle files
- Download dependencies
- Index the project

### Step 4: Build APK

1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. **Click "locate"** when build finishes
4. APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Step 5: Generate Signed APK (For Production)

1. **Build** → **Generate Signed Bundle / APK**
2. Select **APK**
3. Create or select a keystore
4. Fill in keystore details
5. Select **release** build variant
6. Click **Finish**

---

## 🚀 Option 2: EAS Build Locally

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Build Locally

```bash
cd mobile

# Build APK locally (requires Android SDK)
eas build --platform android --profile production --local
```

**Requirements:**
- Android SDK installed
- Java JDK installed
- Environment variables set

---

## ⚙️ Prerequisites

### For Android Studio Method:

1. **Android Studio** (latest version)
   - Download: https://developer.android.com/studio

2. **Android SDK**
   - Installed via Android Studio SDK Manager
   - API Level 33+ recommended

3. **Java JDK**
   - JDK 17 or 11
   - Can be installed via Android Studio

4. **Node.js & npm**
   - Already installed ✅

### For EAS Local Build:

1. **Android SDK** (via Android Studio)
2. **Java JDK**
3. **Environment Variables:**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

---

## 🔧 Configure API URL

Before building, make sure API URL is set:

**File:** `mobile/src/config/api.ts`
```typescript
const PRODUCTION_API_URL = 'https://carpooling-api-production-36c8.up.railway.app/api';
```

**Or set environment variable:**
```bash
export EXPO_PUBLIC_API_URL=https://carpooling-api-production-36c8.up.railway.app/api
```

---

## 📋 Quick Steps Summary

### Using Android Studio:

```bash
# 1. Generate Android project
cd mobile
npx expo prebuild --platform android

# 2. Open Android Studio
# File → Open → mobile/android/

# 3. Build APK
# Build → Build Bundle(s) / APK(s) → Build APK(s)

# 4. Find APK
# android/app/build/outputs/apk/release/app-release.apk
```

### Using EAS Local:

```bash
cd mobile
eas build --platform android --profile production --local
```

---

## 🐛 Troubleshooting

### "Gradle sync failed"

1. **Check Android SDK:**
   - File → Project Structure → SDK Location
   - Verify Android SDK path

2. **Update Gradle:**
   - Android Studio will prompt to update
   - Click "Sync Now"

3. **Invalidate Caches:**
   - File → Invalidate Caches / Restart

### "SDK not found"

1. **Install SDK:**
   - Tools → SDK Manager
   - Install Android SDK Platform 33+
   - Install Build Tools

### "Java version error"

1. **Set JDK:**
   - File → Project Structure → SDK Location
   - Set JDK location (usually bundled with Android Studio)

### Build fails with "expo" errors

1. **Run prebuild again:**
   ```bash
   npx expo prebuild --clean
   ```

---

## ✅ Advantages of Android Studio

- ✅ **Faster builds** (local machine)
- ✅ **More control** over build process
- ✅ **Debug native code** if needed
- ✅ **Custom signing** configuration
- ✅ **No build queue** waiting

---

## 📱 After Building

1. **Transfer APK to device:**
   - USB, email, or cloud storage

2. **Install:**
   - Enable "Unknown Sources"
   - Open APK and install

3. **Test:**
   - All features connected to Railway API
   - Ready for end-to-end testing

---

## 🎯 Recommended Approach

**For quick testing:** Use EAS Build (cloud) - already started ✅

**For production/custom builds:** Use Android Studio method

Both will produce the same APK with your Railway API configured!

---

**Need help?** Check Android Studio logs or run `npx expo prebuild --help`

