# 🚀 Start Deployment - Copy & Paste Commands

## 🚂 Railway Deployment (Recommended)

### Step 1: Login (Opens Browser)

```bash
cd "/Users/hafizamjad/Documents/Test androird application/RSA/server"
railway login
```

This will open your browser. Sign in with GitHub or email.

### Step 2: Initialize Project

```bash
railway init
```

When prompted:
- Choose **"Create a new project"**
- Name it: `carpooling-api`
- Press Enter

### Step 3: Add Database

```bash
railway add postgresql
```

This automatically creates and links the database.

### Step 4: Set Environment Variables

```bash
# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Set all variables
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set FRONTEND_URL="https://your-admin.vercel.app"
railway variables set ADMIN_URL="https://your-admin.vercel.app"
```

**⚠️ Important**: Replace `https://your-admin.vercel.app` with your actual admin portal URL (or use a placeholder for now).

### Step 5: Deploy

```bash
railway up
```

Wait 2-3 minutes. Railway will build and deploy your app.

### Step 6: Get Your API URL

```bash
railway domain
```

You'll get something like: `https://carpooling-api-production.up.railway.app`

**Save this URL!** This is your API endpoint.

### Step 7: Run Migrations

```bash
# Create database schema
railway run psql $DATABASE_URL -f src/database/schema.sql

# Run migrations
railway run psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql

# Create admin user
railway run node create-admin-user.js
```

### Step 8: Test Your API

```bash
# Replace with your actual URL
curl https://your-app.railway.app/health
```

Should return: `{"status":"OK","message":"Server is running"}`

---

## 🎨 Render Deployment (Alternative)

### Step 1: Go to Render Dashboard

1. Visit: https://render.com
2. Sign up/Login
3. Click **"New +"** → **"Web Service"**

### Step 2: Connect Repository

1. Connect your GitHub account
2. Select your repository
3. Or create a new repo and push your code

### Step 3: Configure Service

- **Name**: `carpooling-api`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `server` (if your repo root, leave blank)

### Step 4: Add Database

1. Click **"New +"** → **"PostgreSQL"**
2. Name: `carpooling-db`
3. Plan: **Free**
4. Click **"Create Database"**

### Step 5: Link Database

1. Go back to your Web Service
2. **"Environment"** tab
3. Click **"Link Database"**
4. Select `carpooling-db`

### Step 6: Set Environment Variables

In **"Environment"** tab, add:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-min-32-chars-change-this
FRONTEND_URL=https://your-admin.vercel.app
ADMIN_URL=https://your-admin.vercel.app
```

### Step 7: Deploy

Click **"Manual Deploy"** → **"Deploy latest commit"**

### Step 8: Run Migrations

1. Go to **"Shell"** tab
2. Run:
   ```bash
   psql $DATABASE_URL -f src/database/schema.sql
   psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql
   node create-admin-user.js
   ```

### Step 9: Get Your API URL

Your API will be at: `https://carpooling-api.onrender.com/api`

---

## ✅ After Deployment Checklist

- [ ] API health check works: `curl https://your-api/health`
- [ ] Admin login works: Test with `admin@carpool.local` / `admin123`
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] API URL saved for mobile app and admin portal

---

## 📱 Next Steps

1. **Update Mobile App API URL:**
   - Edit `mobile/eas.json`
   - Set `EXPO_PUBLIC_API_URL` to your API URL

2. **Update Admin Portal API URL:**
   - Create `admin-portal/.env.production`
   - Set `VITE_API_URL` to your API URL

3. **Rebuild APK** (if needed):
   ```bash
   cd mobile
   eas build --platform android --profile production
   ```

---

## 🆘 Need Help?

**Railway Issues:**
- Check logs: `railway logs`
- View dashboard: https://railway.app/dashboard

**Render Issues:**
- Check logs in Render dashboard
- View service status

---

**🚀 Ready? Start with Step 1 above!**

