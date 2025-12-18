# 🚀 Step-by-Step Deployment Guide

## Choose Your Platform

### 🚂 Option 1: Railway (Recommended - Easier)

**Time: 5-10 minutes**

#### Step 1: Login to Railway

```bash
cd server
railway login
```

This opens your browser. Sign in with GitHub or email.

#### Step 2: Create/Initialize Project

```bash
railway init
```

Choose:
- **"Create a new project"** → Name: `carpooling-api`
- Or **"Add to existing project"**

#### Step 3: Add PostgreSQL Database

```bash
railway add postgresql
```

This automatically:
- Creates a PostgreSQL database
- Sets `DATABASE_URL` environment variable

#### Step 4: Set Environment Variables

```bash
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Set variables
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set FRONTEND_URL="https://your-admin-portal.vercel.app"
railway variables set ADMIN_URL="https://your-admin-portal.vercel.app"
```

**Or set in Railway Dashboard:**
1. Go to: https://railway.app/dashboard
2. Click your project → Service
3. Go to "Variables" tab
4. Add each variable

#### Step 5: Deploy

```bash
railway up
```

Wait 2-3 minutes for deployment.

#### Step 6: Get Your API URL

```bash
railway domain
```

Or check Railway dashboard. You'll get: `https://your-app.railway.app`

#### Step 7: Run Database Migrations

```bash
# Run schema
railway run psql $DATABASE_URL -f src/database/schema.sql

# Run migrations
railway run psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql

# Create admin user
railway run node create-admin-user.js
```

#### Step 8: Test Your API

```bash
curl https://your-app.railway.app/health
```

Should return: `{"status":"OK","message":"Server is running"}`

---

### 🎨 Option 2: Render (Visual Dashboard)

**Time: 5-10 minutes**

#### Step 1: Sign Up

1. Go to https://render.com
2. Sign up with GitHub (recommended)

#### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `carpooling-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `server` (if repo root, leave blank)

#### Step 3: Add PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Name: `carpooling-db`
3. Plan: **Free**
4. Click **"Create Database"**

#### Step 4: Link Database

1. Go to your Web Service
2. **"Environment"** tab
3. Click **"Link Database"**
4. Select `carpooling-db`

#### Step 5: Set Environment Variables

In Web Service → **"Environment"** tab, add:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-32-chars-min
FRONTEND_URL=https://your-admin-portal.vercel.app
ADMIN_URL=https://your-admin-portal.vercel.app
```

**Note**: `DATABASE_URL` is auto-set when you link the database.

#### Step 6: Deploy

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait 3-5 minutes

#### Step 7: Run Migrations

1. Go to Web Service → **"Shell"** tab
2. Run:
   ```bash
   psql $DATABASE_URL -f src/database/schema.sql
   psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql
   node create-admin-user.js
   ```

#### Step 8: Get Your API URL

Your API will be at: `https://carpooling-api.onrender.com/api`

---

## ✅ After Deployment

### 1. Test Your API

```bash
# Health check
curl https://your-api.railway.app/health

# Test admin login
curl -X POST https://your-api.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carpool.local","password":"admin123"}'
```

### 2. Update Mobile App

Update `mobile/eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-api.railway.app/api"
      }
    }
  }
}
```

### 3. Update Admin Portal

Create `admin-portal/.env.production`:
```
VITE_API_URL=https://your-api.railway.app/api
```

### 4. Rebuild APK (if needed)

```bash
cd mobile
eas build --platform android --profile production
```

---

## 🔧 Troubleshooting

### Railway Issues

**Service not starting:**
```bash
railway logs
```

**Database connection failed:**
```bash
railway variables  # Check DATABASE_URL is set
railway run psql $DATABASE_URL -c "SELECT 1"
```

### Render Issues

**Build fails:**
- Check build logs in Render dashboard
- Verify `package.json` scripts

**Service crashes:**
- Check logs tab
- Verify environment variables

**Slow first request:**
- Normal on free tier (spins down after 15 min)
- First request takes ~30 seconds
- Consider upgrading to paid plan

---

## 📊 Monitoring

### Railway
```bash
railway logs        # View logs
railway status      # Check status
railway metrics     # View metrics
```

### Render
- Go to service → "Logs" tab
- View real-time logs
- Check metrics dashboard

---

## 🎉 Success!

Once deployed, your API will be:
- ✅ Accessible worldwide
- ✅ Auto-scaling
- ✅ With database backups
- ✅ Ready for production use

**Your API URL**: `https://your-app.railway.app/api` (or `.onrender.com`)

---

## 📝 Quick Reference

**Railway Commands:**
```bash
railway login              # Login
railway init               # Initialize project
railway up                 # Deploy
railway logs               # View logs
railway variables          # List variables
railway domain             # Get URL
```

**Render:**
- All done via dashboard
- Auto-deploys on git push

---

**🚀 Ready to deploy? Choose Railway or Render above!**

