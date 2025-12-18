# 📱 Android APK Build & Deployment Guide

## 🎨 Design Features

The mobile app already features a **modern Careem/InDrive-inspired design** with:

- ✅ **Color Scheme**: Green primary (#00A859) - Careem style
- ✅ **Modern UI Components**: Cards, gradients, shadows
- ✅ **Professional Typography**: Clean, readable fonts
- ✅ **Smooth Animations**: Transitions and interactions
- ✅ **Responsive Layout**: Works on all screen sizes

## 🚀 Quick Build Steps

### Prerequisites

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

### Build APK

**Option 1: Using the build script (Recommended)**
```bash
cd mobile
./build-android.sh https://your-api.railway.app/api
```

**Option 2: Manual build**
```bash
cd mobile

# Update API URL in eas.json first
eas build --platform android --profile production
```

### Download APK

1. Visit: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds
2. Click on the latest build
3. Download the APK file
4. Transfer to Android device and install

---

## 🌐 Hosting Setup

### Backend API Hosting

**Recommended: Railway (Free tier available)**

1. Sign up: https://railway.app
2. Run: `cd server && ./deploy-railway.sh`
3. Follow prompts to deploy
4. Get your API URL: `https://your-app.railway.app/api`

**Alternative: Render.com**
- Free tier available
- Auto-deploys from GitHub
- PostgreSQL included

### Admin Portal Hosting

**Recommended: Vercel (Free tier)**

1. Sign up: https://vercel.com
2. Run: `cd admin-portal && ./deploy-vercel.sh https://your-api.railway.app/api`
3. Get your admin URL: `https://your-admin.vercel.app`

**Alternative: Netlify**
- Free tier available
- Easy deployment

---

## ⚙️ Configuration

### Update API URL for Production

**Before building APK, update these files:**

1. **`mobile/eas.json`:**
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_API_URL": "https://your-api.railway.app/api"
         }
       }
     }
   }
   ```

2. **`mobile/src/config/api.ts`** (already configured to use environment variable)

3. **`admin-portal/.env.production`:**
   ```
   VITE_API_URL=https://your-api.railway.app/api
   ```

---

## 📋 Complete Feature List

The Android APK includes all features:

### Authentication
- ✅ Phone/Email registration
- ✅ OTP verification
- ✅ Login/Logout
- ✅ Password reset

### Passenger Features
- ✅ Search rides
- ✅ View trip details
- ✅ Book rides
- ✅ My bookings
- ✅ Rate drivers
- ✅ SOS button

### Driver Features
- ✅ KYC document upload
- ✅ Vehicle management
- ✅ Create trips/routes
- ✅ Manage bookings
- ✅ Trip history

### General Features
- ✅ Profile management
- ✅ Subscription management
- ✅ Real-time notifications
- ✅ Location services
- ✅ Modern UI/UX

---

## 🔧 Build Configuration

The app is configured with:

- **Package Name**: `com.carpooling.app`
- **Version**: 1.0.0
- **Build Type**: APK (for direct installation)
- **Min SDK**: Android 6.0+
- **Target SDK**: Latest

---

## 📥 Installation Instructions

1. **Download APK** from EAS build page
2. **Transfer to Android device** (via USB, email, or cloud)
3. **Enable Unknown Sources:**
   - Settings → Security → Unknown Sources (enable)
4. **Install APK:**
   - Tap the APK file
   - Tap "Install"
5. **Open app** and test!

---

## 🎯 Testing Checklist

After installing APK:

- [ ] App opens without crashes
- [ ] Can register new account
- [ ] Can login
- [ ] Can search for rides
- [ ] Can view trip details
- [ ] Can book a ride (passenger)
- [ ] Can create trip (driver)
- [ ] Location services work
- [ ] Profile screen loads
- [ ] All navigation works

---

## 🆘 Common Issues

### Build Fails
- Check EAS account has credits
- Verify `eas.json` is valid JSON
- Check build logs in EAS dashboard

### APK Won't Install
- Enable "Install from Unknown Sources"
- Check Android version (needs 6.0+)
- Verify APK is not corrupted

### App Can't Connect to API
- Verify API URL in `eas.json`
- Check backend is running
- Test API with: `curl https://your-api.railway.app/api/health`

---

## 📞 Support

For issues:
1. Check EAS build logs
2. Check Railway/Vercel logs
3. Test API endpoints directly
4. Review error messages in app

---

**🎉 Your Android APK is ready for distribution!**

