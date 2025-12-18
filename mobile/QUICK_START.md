# Quick Start - iOS App Installation

## Fastest Way to Test on Your iPhone

### Step 1: Install Expo Go (Easiest Method)

1. **Install Expo Go** from App Store on your iPhone
2. **Start the app**:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. **Scan QR code** with Expo Go app
4. App will load on your device!

**Note**: Make sure backend is running on `http://11.11.10.194:5001`

### Step 2: Build Standalone App (For Full Testing)

If you need a standalone app (not Expo Go):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
cd mobile
eas build --platform ios --profile preview
```

Wait for build to complete (10-20 minutes), then download and install the `.ipa` file.

### Step 3: Network Setup

**Important**: Your iPhone must be able to reach your Mac's backend.

1. **Find your Mac's IP**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Update API config** if IP changed:
   Edit `mobile/src/config/api.ts` - line 5

3. **Test connection**:
   Open Safari on iPhone and visit: `http://YOUR_IP:5001/health`
   Should see: `{"status":"OK",...}`

### Step 4: Start Backend

```bash
cd server
npm run dev
```

Backend should be running on port 5001.

---

## Quick Commands

```bash
# Start mobile app (Expo Go method)
cd mobile && npx expo start

# Build standalone iOS app
cd mobile && eas build --platform ios --profile preview

# Check backend health
curl http://localhost:5001/health
```

---

**Recommended**: Use Expo Go method first for quick testing, then build standalone app for full feature testing.

