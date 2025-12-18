# 📱 Build iOS App for Testing

## ✅ Configuration Ready

- ✅ API URL: `https://carpooling-api-production-36c8.up.railway.app/api`
- ✅ iOS build profile configured
- ✅ Ready to build

---

## 🚀 Quick Build (EAS Cloud Build)

### Step 1: Build iOS App

```bash
cd mobile
eas build --platform ios --profile preview
```

**This will:**
- Build on Expo's servers (requires Apple Developer account)
- Generate `.ipa` file
- Take 15-20 minutes
- Provide download link when ready

### Step 2: Install on iPhone

After build completes, you have several options:

#### Option A: TestFlight (Easiest - Recommended)

```bash
# Submit to TestFlight
eas submit --platform ios
```

Then:
1. Install **TestFlight** app from App Store
2. Accept invitation email
3. Install app from TestFlight

#### Option B: Direct Install via Xcode

1. Download the `.ipa` file from EAS
2. Open **Xcode**
3. **Window** → **Devices and Simulators**
4. Connect your iPhone via USB
5. Drag and drop `.ipa` file to install

#### Option C: Ad-Hoc Installation

Use tools like:
- **AltStore** (free, no jailbreak)
- **3uTools** (Windows/Mac)
- **iMazing** (Mac/Windows)

---

## 🎯 Alternative: Development Build (Faster Testing)

### Using Expo Go (Quickest)

1. **Install Expo Go** from App Store on your iPhone

2. **Start Expo:**
   ```bash
   cd mobile
   npx expo start
   ```

3. **Scan QR code** with Expo Go app

4. **App loads** on your device instantly!

**Note:** Some native features may be limited in Expo Go.

---

## 📋 Prerequisites

### For EAS Build:

1. **Apple Developer Account**
   - Free account works for development
   - Sign up: https://developer.apple.com
   - Or use existing Apple ID

2. **EAS CLI** (already installed ✅)
   ```bash
   eas login
   ```

3. **Configure Apple Credentials:**
   ```bash
   eas credentials
   ```
   Follow prompts to set up:
   - Apple ID
   - Distribution certificate
   - Provisioning profile

### For Local Build:

1. **Xcode** (Mac only)
   - Download from App Store
   - Install Command Line Tools

2. **iOS Simulator** (for testing on Mac)
   - Included with Xcode

---

## 🔧 Build Options

### Preview Build (Recommended for Testing)

```bash
cd mobile
eas build --platform ios --profile preview
```

- ✅ Works on physical devices
- ✅ No App Store submission needed
- ✅ Ad-hoc distribution
- ✅ 15-20 minutes build time

### Production Build (For App Store)

```bash
cd mobile
eas build --platform ios --profile production
```

- ✅ App Store ready
- ✅ Requires full Apple Developer account ($99/year)
- ✅ Can submit to App Store

### Development Build (For Development)

```bash
cd mobile
eas build --platform ios --profile development
```

- ✅ Development features enabled
- ✅ Faster iteration
- ✅ Hot reload support

---

## 📥 Download & Install

### After Build Completes:

1. **Check Status:**
   ```bash
   eas build:list --platform ios
   ```

2. **Download IPA:**
   - Visit: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds
   - Find your iOS build
   - Click "Download"

3. **Install on Device:**
   - Use TestFlight (easiest)
   - Or Xcode Devices window
   - Or third-party tools

---

## 🧪 Test the App

### Test Credentials

**Admin Login:**
- Email: `admin@carpool.local`
- Password: `admin123`

**User Registration:**
- Phone: `+923001234567` (or any valid number)
- OTP verification required

### Features to Test

1. ✅ User Registration
2. ✅ OTP Verification
3. ✅ Login
4. ✅ Search Rides
5. ✅ Create Trip (driver)
6. ✅ Book Ride (passenger)
7. ✅ Profile Management
8. ✅ KYC Upload (driver)

---

## 🐛 Troubleshooting

### Build Fails

1. **Check Apple Credentials:**
   ```bash
   eas credentials
   ```

2. **Clear Cache:**
   ```bash
   eas build --platform ios --profile preview --clear-cache
   ```

3. **Check Logs:**
   - Visit build page in Expo dashboard
   - Check error messages

### Can't Install on Device

1. **Trust Developer:**
   - Settings → General → VPN & Device Management
   - Trust your developer certificate

2. **Check Device UDID:**
   - Make sure device is registered
   - Check in Apple Developer portal

### App Can't Connect to API

1. **Check API Status:**
   ```bash
   curl https://carpooling-api-production-36c8.up.railway.app/health
   ```

2. **Verify API URL:**
   - Should be: `https://carpooling-api-production-36c8.up.railway.app/api`
   - Check in `mobile/src/config/api.ts`

---

## 🎯 Quick Start Commands

```bash
# 1. Build iOS app
cd mobile
eas build --platform ios --profile preview

# 2. Wait for build (15-20 min)
# Check status: eas build:list

# 3. Submit to TestFlight (optional)
eas submit --platform ios

# 4. Install TestFlight app on iPhone
# 5. Accept invitation and install
```

---

## 📱 Alternative: iOS Simulator (Mac Only)

If you have a Mac and want to test quickly:

```bash
cd mobile
npx expo start
# Press 'i' to open in iOS simulator
```

This opens the app in iOS Simulator instantly (no build needed).

---

## ✅ What's Configured

- ✅ API URL: Railway production endpoint
- ✅ All endpoints connected
- ✅ iOS build profiles ready
- ✅ Ready for testing

---

**Ready to build?** Run `eas build --platform ios --profile preview` in the mobile directory! 🚀

