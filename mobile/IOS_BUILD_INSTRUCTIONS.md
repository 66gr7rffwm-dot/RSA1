# iOS Build & Installation Instructions

## Prerequisites

1. **Apple Developer Account** (Free account works for development)
2. **Xcode** installed on your Mac
3. **Expo CLI** installed globally
4. **EAS CLI** installed globally

## Quick Setup

### 1. Install Required Tools

```bash
# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

### 2. Update API Configuration

The API is currently configured to use your local network IP: `11.11.10.194:5001`

**Important**: Make sure:
- Your backend server is running on port 5001
- Your iPhone and Mac are on the same Wi-Fi network
- Your Mac's firewall allows connections on port 5001

To update the IP if needed, edit `mobile/src/config/api.ts` and change the IP address.

### 3. Build Options

#### Option A: Development Build (Recommended for Testing)

This creates a development build that connects to your local server:

```bash
cd mobile

# Build for iOS device
eas build --platform ios --profile development
```

This will:
- Create a development build
- Generate a `.ipa` file
- Provide a download link

#### Option B: Preview Build (Ad-Hoc Distribution)

For testing without App Store:

```bash
cd mobile

# Build preview version
eas build --platform ios --profile preview
```

#### Option C: Local Build (Fastest for Development)

If you have Xcode installed:

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start

# Press 'i' to open in iOS simulator
# Or scan QR code with Expo Go app on your iPhone
```

**Note**: For physical device testing with local build, you need:
1. Expo Go app installed on your iPhone
2. Both devices on same Wi-Fi network
3. Backend server running and accessible

### 4. Install on Device

#### Method 1: Using EAS Build (Recommended)

1. After build completes, EAS will provide a download link
2. Download the `.ipa` file
3. Install using one of these methods:

**Option A: TestFlight (Easiest)**
```bash
# Submit to TestFlight
eas submit --platform ios
```

Then install TestFlight app on your iPhone and accept the invitation.

**Option B: Direct Install via Xcode**
1. Open Xcode
2. Window → Devices and Simulators
3. Connect your iPhone
4. Drag and drop the `.ipa` file to install

**Option C: Ad-Hoc Installation**
1. Download the `.ipa` file
2. Use tools like:
   - **AltStore** (free, no jailbreak)
   - **3uTools** (Windows/Mac)
   - **iMazing** (Mac/Windows)

#### Method 2: Using Expo Go (Quick Testing)

1. Install **Expo Go** from App Store on your iPhone
2. Make sure backend is running on your Mac
3. Run:
   ```bash
   cd mobile
   npx expo start
   ```
4. Scan the QR code with Expo Go app
5. The app will load on your device

**Limitation**: Some native features may not work in Expo Go.

### 5. Configure Your Device

#### For Development Build:

1. **Trust Developer**: 
   - Settings → General → VPN & Device Management
   - Trust your developer certificate

2. **Allow Network Access**:
   - Make sure your iPhone can access `http://11.11.10.194:5001`
   - You may need to allow HTTP in Info.plist (already configured)

#### Network Configuration:

If you can't connect to the backend:

1. **Check Firewall**:
   ```bash
   # On Mac, allow incoming connections
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   ```

2. **Verify IP Address**:
   ```bash
   # Get your Mac's IP
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

3. **Update API Config**:
   Edit `mobile/src/config/api.ts` with the correct IP

### 6. Testing Checklist

- [ ] Backend server running on port 5001
- [ ] iPhone and Mac on same Wi-Fi network
- [ ] API IP address updated in `api.ts`
- [ ] App installed on device
- [ ] Developer certificate trusted
- [ ] Can access backend from iPhone browser: `http://YOUR_IP:5001/health`

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
eas build --platform ios --profile development --clear-cache
```

### Can't Connect to Backend

1. **Check IP Address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Test Connection**:
   ```bash
   # From iPhone browser, try:
   http://YOUR_IP:5001/health
   ```

3. **Check Firewall**:
   ```bash
   # Allow Node.js through firewall
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   ```

### App Crashes on Launch

- Check device logs in Xcode
- Verify all dependencies are installed
- Try clearing app data and reinstalling

## Alternative: Use ngrok for Testing

If local network doesn't work, use ngrok to expose your backend:

```bash
# Install ngrok
brew install ngrok

# Expose backend
ngrok http 5001

# Update api.ts with ngrok URL
# Example: https://abc123.ngrok.io/api
```

## Production Build

For App Store submission:

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

---

**Quick Start Command**:
```bash
cd mobile && eas build --platform ios --profile preview
```

After build completes, follow the installation instructions provided by EAS.

