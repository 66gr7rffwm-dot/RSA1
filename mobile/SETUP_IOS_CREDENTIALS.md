# 🍎 Setup iOS Credentials - Step by Step

## ✅ You've Logged into Apple Account

Great! Now let's configure EAS Build to use your Apple credentials.

---

## 🔧 Step 1: Configure Apple Credentials

Run this command:

```bash
cd mobile
eas credentials
```

### What to Expect:

1. **Select Platform:** Choose `ios`
2. **Select Workflow:** Choose `Build Credentials`
3. **Select Action:** Choose `Set up credentials`

### EAS will ask:

1. **Apple ID:**
   - Enter your Apple ID email
   - The one you just logged in with

2. **App Store Connect API Key (Optional):**
   - Choose "No" for now (can set up later)
   - Or "Yes" if you have one

3. **Distribution Certificate:**
   - Choose "Let EAS handle it" (recommended)
   - EAS will create and manage certificates automatically

4. **Provisioning Profile:**
   - Choose "Let EAS handle it" (recommended)
   - EAS will create profiles automatically

### EAS will automatically:
- ✅ Create distribution certificate
- ✅ Create provisioning profile
- ✅ Register your device (if needed)
- ✅ Configure everything for you

---

## 🚀 Step 2: Start iOS Build

After credentials are configured:

```bash
eas build --platform ios --profile preview
```

Or use the build script:

```bash
./build-ios.sh
```

---

## ⏱️ Step 3: Wait for Build

- **Build time:** 15-20 minutes
- **Status:** Check with `eas build:list --platform ios`
- **You'll get:** Email notification when complete

---

## 📥 Step 4: Install on iPhone

### Option A: TestFlight (Easiest)

After build completes:

```bash
eas submit --platform ios
```

Then:
1. Install **TestFlight** app from App Store
2. Check email for TestFlight invitation
3. Accept invitation
4. Install app from TestFlight

### Option B: Direct Install

1. Download `.ipa` from Expo dashboard
2. Use Xcode or third-party tools to install

---

## 🎯 Quick Commands

```bash
# 1. Configure credentials
cd mobile
eas credentials

# 2. Start build
eas build --platform ios --profile preview

# 3. Check status
eas build:list --platform ios

# 4. Submit to TestFlight (after build completes)
eas submit --platform ios
```

---

## ✅ What EAS Will Do

When you run `eas credentials`:
- ✅ Connect to your Apple Developer account
- ✅ Create necessary certificates
- ✅ Set up provisioning profiles
- ✅ Register your devices (if needed)
- ✅ Store credentials securely

---

## 🐛 Troubleshooting

### "Apple ID not found"
- Make sure you're using the correct Apple ID
- Check if you have an Apple Developer account (free works)

### "Certificate creation failed"
- Check Apple Developer account status
- Try again - sometimes Apple's servers are slow

### "Device not registered"
- EAS will prompt to register your device
- You'll need your iPhone's UDID (EAS can get it automatically)

---

**Next Step:** Run `eas credentials` in the mobile directory! 🚀

