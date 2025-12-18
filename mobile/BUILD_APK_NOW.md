# 📱 Build Android APK - Quick Guide

## ✅ Configuration Updated

- ✅ API URL set to: `https://carpooling-api-production-36c8.up.railway.app/api`
- ✅ EAS configuration updated
- ✅ Ready to build

## 🚀 Build APK

### Option 1: Using Build Script (Recommended)

```bash
cd mobile
./build-android.sh
```

### Option 2: Manual Build

```bash
cd mobile

# Make sure you're logged in
eas login

# Build APK
eas build --platform android --profile production
```

## ⏱️ Build Time

- **Expected time:** 10-15 minutes
- Build happens on Expo's servers (cloud build)
- You'll get a notification when complete

## 📥 Download APK

After build completes:

1. **Via Expo Dashboard:**
   - Visit: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds
   - Click on the latest build
   - Download the APK

2. **Via CLI:**
   ```bash
   eas build:list
   # Copy the download URL from the output
   ```

3. **Via Email:**
   - Expo will send you an email with download link

## 📲 Install on Android Device

1. **Transfer APK to device:**
   - Download APK to your computer
   - Transfer via USB, email, or cloud storage

2. **Enable Unknown Sources:**
   - Go to Settings → Security
   - Enable "Install from Unknown Sources" or "Install Unknown Apps"
   - Select the app you'll use to install (Files, Chrome, etc.)

3. **Install:**
   - Open the APK file
   - Tap "Install"
   - Wait for installation
   - Tap "Open" to launch

## 🧪 Test the App

### Test Credentials

**Admin Login:**
- Email: `admin@carpool.local`
- Password: `admin123`

**User Registration:**
- Phone: `+923001234567` (or any valid number)
- Will receive OTP for verification

### Test Features

1. ✅ User Registration
2. ✅ OTP Verification
3. ✅ Login
4. ✅ Search Rides
5. ✅ Create Trip (as driver)
6. ✅ Book Ride (as passenger)
7. ✅ View Profile
8. ✅ KYC Upload (as driver)

## 🔧 Troubleshooting

### Build Fails

1. Check EAS login: `eas whoami`
2. Check project ID in `app.json`
3. Check build logs: `eas build:list`

### APK Won't Install

1. Enable "Unknown Sources" in Android settings
2. Check Android version compatibility (min Android 6.0)
3. Try downloading APK again

### App Can't Connect to API

1. Check internet connection
2. Verify API is online: `curl https://carpooling-api-production-36c8.up.railway.app/health`
3. Check API URL in app settings

## 📋 Quick Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel [BUILD_ID]

# Check login status
eas whoami

# Login
eas login
```

## 🎯 API Endpoints

All endpoints are configured to use:
```
https://carpooling-api-production-36c8.up.railway.app/api
```

---

**Ready to build?** Run `./build-android.sh` in the mobile directory!

