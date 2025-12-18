# 🚂 Railway Database Setup Complete!

## ✅ What's Done

- ✅ Database schema created
- ✅ Migrations run
- ✅ Admin user created
- ✅ Roles and permissions set up

## ⚠️ Final Step: Set DATABASE_URL in Railway

The API is still showing database connection errors because `DATABASE_URL` needs to be set in Railway environment variables.

### Option 1: Via Railway Dashboard (Easiest)

1. Go to: https://railway.app/dashboard
2. Click on your project: **carpooling-api-production**
3. Click on your service
4. Go to **"Variables"** tab
5. Click **"New Variable"**
6. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:AQgFWwcbFyngbFHjDSxZabwRTFLhHOHz@centerbeam.proxy.rlwy.net:55752/railway`
7. Click **"Add"**
8. Railway will automatically redeploy

### Option 2: Via Railway CLI

```bash
cd server

# Login first (if not already)
railway login

# Link to project
railway link --project 9aec112f-8aae-447a-b2d2-bd411b0976ab

# Set DATABASE_URL
railway variables set DATABASE_URL="postgresql://postgres:AQgFWwcbFyngbFHjDSxZabwRTFLhHOHz@centerbeam.proxy.rlwy.net:55752/railway"
```

### Option 3: Railway Auto-Detection

If you added PostgreSQL through Railway dashboard, it should have auto-set `DATABASE_URL`. Check:
1. Railway Dashboard → Your Service → Variables
2. Look for `DATABASE_URL`
3. If it exists but is different, update it with the value above

---

## 🔐 Other Environment Variables to Set

While you're in the Variables section, also set these:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=<generate with: openssl rand -base64 32>
FRONTEND_URL=https://your-admin-portal.vercel.app
ADMIN_URL=https://your-admin-portal.vercel.app
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

---

## ✅ Verify Setup

After setting DATABASE_URL, wait 1-2 minutes for Railway to redeploy, then test:

```bash
# Health check (should show database: connected)
curl https://carpooling-api-production-36c8.up.railway.app/health

# Expected response:
# {"status":"OK","message":"Server is running","database":"connected"}
```

**Test Admin Login:**
```bash
curl -X POST https://carpooling-api-production-36c8.up.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carpool.local","password":"admin123"}'

# Should return a JWT token
```

---

## 📋 Admin Credentials

**Email:** `admin@carpool.local`  
**Password:** `admin123`  
**Role:** `admin`

Use these to login to the admin portal once it's deployed.

---

## 🎯 Next Steps After DATABASE_URL is Set

1. ✅ API will automatically reconnect to database
2. ✅ Health endpoint will show "database: connected"
3. ✅ All API endpoints will work
4. ✅ Deploy admin portal with API URL
5. ✅ Update mobile app with API URL

---

## 🐛 Troubleshooting

### Still showing database connection error?

1. **Check Railway logs:**
   ```bash
   railway logs
   ```
   Look for database connection messages

2. **Verify DATABASE_URL format:**
   - Should start with `postgresql://`
   - Should include username, password, host, port, and database name
   - No spaces or extra characters

3. **Check Railway service status:**
   - Go to Railway Dashboard
   - Make sure PostgreSQL service is running
   - Make sure your API service is running

4. **Wait for redeploy:**
   - After setting variables, Railway redeploys automatically
   - Wait 1-2 minutes
   - Check deployment logs

---

**Database Connection String:**
```
postgresql://postgres:AQgFWwcbFyngbFHjDSxZabwRTFLhHOHz@centerbeam.proxy.rlwy.net:55752/railway
```

**API URL:**
```
https://carpooling-api-production-36c8.up.railway.app
```

