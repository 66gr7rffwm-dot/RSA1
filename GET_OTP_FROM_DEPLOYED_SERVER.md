# 📱 How to Get OTP from Deployed Server

## For Phone Number: +923320948498

### Option 1: Use Development Bypass (Easiest) ⭐

**Just enter `000000` as OTP in the app!**

This works because the server has a development bypass that accepts `000000` as a universal test OTP when not in production mode.

---

### Option 2: Query Database Directly

Since your server is deployed on Railway, you can query the database directly:

#### Using Railway CLI:

```bash
# Install Railway CLI if not installed
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Connect to database
railway connect postgres

# Then run SQL query:
SELECT otp_code, created_at, expires_at, is_used 
FROM otp_verifications 
WHERE phone_number = '+923320948498' 
ORDER BY created_at DESC 
LIMIT 1;
```

#### Using Railway Dashboard:

1. Go to https://railway.app
2. Select your project
3. Click on your PostgreSQL database
4. Go to "Data" tab
5. Run this query:

```sql
SELECT otp_code, created_at, expires_at, is_used 
FROM otp_verifications 
WHERE phone_number = '+923320948498' 
ORDER BY created_at DESC 
LIMIT 1;
```

---

### Option 3: Check Server Logs

If you have access to Railway logs:

1. Go to Railway Dashboard
2. Select your backend service
3. Click on "Logs"
4. Look for lines like:
   ```
   [DEV] OTP for +923320948498: 123456
   ```

---

### Option 4: Use API Endpoint (After Deployment)

Once you deploy the updated server code with the `/get-otp` endpoint:

```bash
curl "https://carpooling-api-production-36c8.up.railway.app/api/auth/get-otp/+923320948498"
```

**Note:** This endpoint is currently only available in development mode. You may need to temporarily set `NODE_ENV=development` or modify the endpoint to work in production for testing.

---

## 🎯 Recommended: Use `000000`

The easiest way is to simply enter **`000000`** when the app asks for OTP. This bypasses verification completely in development mode.

---

## 📋 Quick Steps:

1. **Register** in the app with phone: `+923320948498`
2. **Enter OTP:** `000000` (development bypass)
3. **Done!** ✅

---

## 🔧 To Enable API Endpoint in Production:

If you want to use the API endpoint in production, modify `server/src/routes/auth.routes.ts`:

```typescript
// Change this:
if (process.env.NODE_ENV === 'production') {
  return res.status(403).json({ success: false, error: 'Not available in production' });
}

// To this (for testing only):
// if (process.env.NODE_ENV === 'production') {
//   return res.status(403).json({ success: false, error: 'Not available in production' });
// }
```

Then redeploy your server.

---

## ⚠️ Important Notes:

- OTPs expire after **10 minutes**
- Each OTP can only be used **once**
- If OTP is expired/used, register again to get a new one
- The bypass `000000` only works when server is not in production mode

