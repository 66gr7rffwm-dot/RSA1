# 🔐 OTP Testing Guide

## 📱 What Service is Used?

The app uses **Twilio** for sending SMS OTPs. However, if Twilio credentials are not configured, the OTP is:
- ✅ **Saved to the database** (always)
- ✅ **Logged to server console** (in development mode)
- ❌ **NOT sent via SMS** (if Twilio not configured)

---

## 🎯 Three Ways to Get/Use OTP

### **Option 1: Development Bypass (Easiest)** ⭐

**Use the universal test OTP: `000000`**

1. Register with your phone number in the app
2. When prompted for OTP, enter: **`000000`**
3. This will bypass OTP verification in development mode

**Note:** This only works when `NODE_ENV !== 'production'`

---

### **Option 2: Get OTP from Database** 📊

**Method A: Using the API endpoint (if server is running)**

```bash
# Get OTP for a phone number
curl https://carpooling-api-production-36c8.up.railway.app/api/auth/get-otp/+923001234567
```

**Method B: Using the script**

```bash
cd server
node get-otp.js +923001234567
```

This will show:
- ✅ OTP Code
- ✅ Created time
- ✅ Expiry time
- ✅ Status (valid/expired/used)

---

### **Option 3: Check Server Logs** 📝

If the server is running locally, check the console output:

```bash
# When you register, you'll see:
[DEV] OTP for +923001234567: 123456
```

---

## 🚀 Quick Start

### Step 1: Register in the App
- Enter your phone number (e.g., `+923001234567`)
- Fill in other details
- Submit registration

### Step 2: Get OTP

**Easiest:** Enter `000000` as OTP (development bypass)

**Or get real OTP:**
```bash
cd server
node get-otp.js +923001234567
```

### Step 3: Verify
- Enter the OTP in the app
- Complete registration

---

## 🔧 Setup Script

Make sure you have the database connection configured in `server/.env`:

```env
DATABASE_URL=your_database_url
# or
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carpooling_db
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## 📋 Example Usage

```bash
# 1. Register in app with phone: +923001234567

# 2. Get OTP from database
cd server
node get-otp.js +923001234567

# Output:
# 📱 OTP Information:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phone Number: +923001234567
# OTP Code: 123456
# Created: 2025-12-19 11:30:00
# Expires: 2025-12-19 11:40:00
# Status: ✅ VALID
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 3. Enter OTP in app: 123456
```

---

## ⚠️ Important Notes

1. **OTP Expiry:** OTPs expire after 10 minutes
2. **One-time Use:** Each OTP can only be used once
3. **Development Bypass:** `000000` only works in development mode
4. **Production:** In production, you'll need real Twilio credentials for SMS

---

## 🐛 Troubleshooting

### "No OTP found"
- Make sure you registered first
- Check if phone number format is correct (include country code: `+92...`)

### "OTP expired"
- Register again to get a new OTP
- OTPs expire after 10 minutes

### "OTP already used"
- Each OTP can only be used once
- Register again to get a new OTP

---

## 🎯 Recommended for Testing

**Use the development bypass: `000000`**

This is the fastest way to test without needing to:
- Check database
- Check server logs
- Wait for SMS

Just enter `000000` when prompted for OTP! 🚀

