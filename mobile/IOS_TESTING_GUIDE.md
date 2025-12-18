# 📱 iOS Testing Guide - Carpooling App

## 🚀 Quick Start with Expo Go (Fastest Method)

### Step 1: Install Expo Go on Your iPhone
1. Open the **App Store** on your iOS device
2. Search for "**Expo Go**"
3. Download and install the app (free)

### Step 2: Connect to the Development Server
Your development server is now running. Use one of these methods:

#### Method A: Direct URL Entry
1. Open **Expo Go** on your iPhone
2. Tap the "**Enter URL manually**" option
3. Enter: `exp://11.11.10.194:8081`
4. Tap "Connect"

#### Method B: Scan QR Code
Open your iPhone camera and scan this URL (or type in Safari):

```
exp://11.11.10.194:8081
```

### Important Requirements:
- ✅ Your iPhone must be on the **same WiFi network** as your Mac
- ✅ The backend server must be running (port 5001)
- ✅ The admin portal should be running (port 5173)

---

## 🔧 Backend & Admin Portal Status

### Backend Server: `http://11.11.10.194:5001`
- The mobile app connects to this for all API calls
- Make sure it's running with: `cd server && npm run dev`

### Admin Portal: `http://localhost:5173`
- Access on your Mac browser
- Credentials: `admin@carpool.local` / `admin123`

---

## 📋 Testing Checklist

### As a Passenger:
- [ ] Sign up with phone number
- [ ] Complete profile
- [ ] Search for rides
- [ ] Book a ride
- [ ] Rate the driver

### As a Driver:
- [ ] Sign up with phone number
- [ ] Complete KYC verification (upload documents)
- [ ] Add a vehicle
- [ ] Create a trip/route
- [ ] Accept bookings

### Admin Portal:
- [ ] Review KYC requests
- [ ] Approve/reject driver documents
- [ ] View analytics dashboard

---

## 🔄 Troubleshooting

### "Network request failed" Error
1. Verify your Mac's IP address hasn't changed:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Update `mobile/src/config/api.ts` if IP changed

### "Unable to connect" Error
1. Make sure iPhone and Mac are on same WiFi
2. Check if backend is running: `curl http://localhost:5001/api/health`
3. Try restarting Metro: Press `r` in terminal

### App shows white/blank screen
1. Shake your device to open developer menu
2. Tap "Reload"

---

## 📱 Alternative: Build Standalone iOS App

If you want a standalone `.ipa` file to install:

### Prerequisites:
1. Apple Developer Account ($99/year)
2. EAS CLI installed: `npm install -g eas-cli`

### Build Command:
```bash
cd mobile
eas build --platform ios --profile preview
```

This will create a TestFlight-ready build.

---

## 🎯 Current Server URLs

| Service | URL | Status |
|---------|-----|--------|
| Backend API | http://11.11.10.194:5001/api | ✅ Running |
| Admin Portal | http://localhost:5173 | ✅ Running |
| Metro Bundler | http://localhost:8081 | ✅ Running |
| Expo App | exp://11.11.10.194:8081 | ✅ Ready |

---

## 📞 Support

If you encounter any issues:
1. Check the terminal logs for errors
2. Ensure all services are running
3. Restart Metro bundler if needed: Press `r` in terminal

Happy Testing! 🚗

