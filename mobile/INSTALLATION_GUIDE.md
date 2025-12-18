# 📱 iOS App Installation Guide

## 🚀 Quick Start (Choose One Method)

### Method 1: Expo Go (Fastest - 2 minutes) ⚡

**Best for**: Quick testing and development

1. **Install Expo Go** from App Store on your iPhone
2. **Start the app**:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. **Scan QR code** with Expo Go app (camera or Expo Go app)
4. App loads instantly!

**Limitations**: Some native features may not work in Expo Go

---

### Method 2: Standalone Build (Full Features) 🎯

**Best for**: Complete end-to-end testing

#### Option A: Using Build Script (Easiest)

```bash
cd mobile
./build-ios.sh
```

Wait 10-20 minutes for build to complete, then follow installation steps.

#### Option B: Manual Build

```bash
cd mobile

# Login to Expo (if not already)
eas login

# Build iOS app
eas build --platform ios --profile preview
```

#### After Build Completes:

1. **Download the .ipa file** from EAS dashboard or email link
2. **Install using one of these methods**:

   **A. TestFlight (Recommended)**
   ```bash
   eas submit --platform ios
   ```
   Then install TestFlight app and accept invitation.

   **B. Direct Install via Xcode**
   - Open Xcode
   - Window → Devices and Simulators
   - Connect iPhone via USB
   - Drag .ipa file to install

   **C. AltStore (No Developer Account Needed)**
   - Install AltStore on your Mac
   - Connect iPhone
   - Install .ipa via AltStore

---

## ⚙️ Configuration

### API Endpoint

The app is configured to connect to: `http://11.11.10.194:5001/api`

**To change the IP address**:
1. Edit `mobile/src/config/api.ts`
2. Update line 5 with your Mac's IP address
3. Rebuild the app

**To find your Mac's IP**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Backend Setup

Make sure your backend is running:
```bash
cd server
npm run dev
```

Backend should be accessible at: `http://YOUR_IP:5001`

---

## 🔧 Troubleshooting

### Can't Connect to Backend

1. **Check IP Address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Test from iPhone**:
   - Open Safari on iPhone
   - Visit: `http://YOUR_IP:5001/health`
   - Should see: `{"status":"OK",...}`

3. **Check Firewall**:
   ```bash
   # Allow Node.js through firewall
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   ```

### Build Fails

```bash
# Clear cache and retry
eas build --platform ios --profile preview --clear-cache
```

### App Crashes

- Check device logs in Xcode
- Verify backend is running
- Check API IP address is correct

---

## 📋 Pre-Installation Checklist

- [ ] Backend server running on port 5001
- [ ] iPhone and Mac on same Wi-Fi network
- [ ] API IP address updated in `api.ts` (if needed)
- [ ] Can access backend from iPhone browser
- [ ] Developer certificate trusted (for standalone builds)

---

## 🎯 Recommended Workflow

1. **Start with Expo Go** for quick testing
2. **Build standalone app** for full feature testing
3. **Use TestFlight** for easy distribution to testers

---

## 📞 Need Help?

- Check `IOS_BUILD_INSTRUCTIONS.md` for detailed steps
- Check `QUICK_START.md` for fastest method
- EAS Dashboard: https://expo.dev

---

**Current Configuration**:
- Backend IP: `11.11.10.194:5001`
- Build Profile: `preview`
- Distribution: `internal`

