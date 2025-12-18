# 🔧 Fix Database Connection Error

## Current Error
```
{"status":"ERROR","message":"Database connection failed","error":"connect ECONNREFUSED ::1:5432"}
```

This means the API is trying to connect to **localhost** instead of your Railway database.

---

## ✅ Solution: Set DATABASE_URL in Railway

### Step 1: Go to Railway Dashboard

1. Visit: https://railway.app/dashboard
2. Click on your project
3. Click on your **service** (the one running your API)
4. Go to **"Variables"** tab

### Step 2: Add DATABASE_URL

1. Click **"New Variable"** button
2. Enter:
   - **Variable Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:AQgFWwcbFyngbFHjDSxZabwRTFLhHOHz@centerbeam.proxy.rlwy.net:55752/railway`
3. Click **"Add"**

### Step 3: Wait for Redeploy

- Railway will automatically detect the new variable
- It will redeploy your service (takes 1-2 minutes)
- Watch the deployment logs in Railway dashboard

---

## 🔍 Verify DATABASE_URL is Set

### Option A: Check Railway Dashboard
1. Go to Variables tab
2. Look for `DATABASE_URL`
3. Make sure it matches the connection string above

### Option B: Check via CLI (if linked)
```bash
cd server
railway variables
```

You should see `DATABASE_URL` in the list.

---

## 🧪 Test After Setting

Wait 1-2 minutes for redeploy, then test:

```bash
# Should now show database: connected
curl https://carpooling-api-production-36c8.up.railway.app/health
```

**Expected response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected"
}
```

---

## 🐛 If Still Not Working

### Check Railway Logs

1. In Railway Dashboard → Your Service
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Check the logs for:
   - Database connection messages
   - Any error messages
   - Environment variable loading

### Verify Connection String Format

Make sure the DATABASE_URL is exactly:
```
postgresql://postgres:AQgFWwcbFyngbFHjDSxZabwRTFLhHOHz@centerbeam.proxy.rlwy.net:55752/railway
```

**Common mistakes:**
- ❌ Extra spaces
- ❌ Missing parts
- ❌ Wrong password
- ❌ Wrong host/port

### Check if PostgreSQL Service is Running

1. In Railway Dashboard
2. Check if you have a **PostgreSQL** service
3. Make sure it's **running** (green status)
4. If not, add it: **"New"** → **"Database"** → **"PostgreSQL"**

---

## 📋 Quick Checklist

- [ ] DATABASE_URL variable added in Railway
- [ ] Variable value is correct (no typos)
- [ ] Railway service redeployed (check deployments tab)
- [ ] PostgreSQL service is running
- [ ] Waited 1-2 minutes after setting variable
- [ ] Tested health endpoint again

---

## 🚀 Alternative: Set via Railway CLI

If you prefer CLI:

```bash
cd server

# Make sure you're linked
railway link --project 9aec112f-8aae-447a-b2d2-bd411b0976ab

# Set the variable
railway variables set DATABASE_URL="postgresql://postgres:AQgFWwcbFyngbFHjDSxZabwRTFLhHOHz@centerbeam.proxy.rlwy.net:55752/railway"

# Verify it's set
railway variables | grep DATABASE_URL
```

---

## 💡 Why This Happens

The error `connect ECONNREFUSED ::1:5432` means:
- `::1` = localhost (IPv6)
- `5432` = default PostgreSQL port
- The code is falling back to localhost because `DATABASE_URL` is not set

Your code in `server/src/database/connection.ts` checks:
```typescript
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ... }
  : { host: 'localhost', ... }  // ← This is what's being used
```

Once `DATABASE_URL` is set, it will use the Railway database instead.

---

**Connection String:**
```
postgresql://postgres:AQgFWwcbFyngbFHjDSxZabwRTFLhHOHz@centerbeam.proxy.rlwy.net:55752/railway
```

**API URL:**
```
https://carpooling-api-production-36c8.up.railway.app
```

