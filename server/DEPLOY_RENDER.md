# 🎨 Deploy Backend API to Render

## Quick Start (5 minutes)

### Step 1: Sign Up

1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Verify your email

### Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
   - Select your repository
   - Or create a new one and push your code

### Step 3: Configure Service

**Basic Settings:**
- **Name**: `carpooling-api`
- **Region**: Choose closest to you (Oregon recommended)
- **Branch**: `main` or `master`
- **Root Directory**: `server` (if repo root, leave blank)

**Build & Deploy:**
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 4: Add PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Name: `carpooling-db`
3. Database: `carpooling_db`
4. User: `carpooling_user`
5. Plan: **Free** (for testing)
6. Click **"Create Database"**

### Step 5: Link Database to Service

1. Go back to your Web Service
2. Go to **"Environment"** tab
3. Click **"Link Database"**
4. Select `carpooling-db`
5. Render will auto-set `DATABASE_URL`

### Step 6: Set Environment Variables

In your Web Service → **"Environment"** tab, add:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
FRONTEND_URL=https://your-admin-portal.vercel.app
ADMIN_URL=https://your-admin-portal.vercel.app
GOOGLE_MAPS_API_KEY=your-google-maps-key (optional)
```

**Note**: `DATABASE_URL` is automatically set when you link the database.

### Step 7: Deploy

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for build to complete (3-5 minutes)
3. Your service will be live at: `https://carpooling-api.onrender.com`

### Step 8: Run Database Migrations

**Option 1: Using Render Shell (Recommended)**

1. Go to your Web Service
2. Click **"Shell"** tab
3. Run:
   ```bash
   psql $DATABASE_URL -f src/database/schema.sql
   psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql
   node create-admin-user.js
   ```

**Option 2: Using Local psql**

1. Get connection string from Render dashboard
2. Run locally:
   ```bash
   psql "your-connection-string" -f src/database/schema.sql
   psql "your-connection-string" -f src/database/migrations/001_roles_permissions.sql
   ```

### Step 9: Get Your API URL

Your API will be at:
- **Base URL**: `https://carpooling-api.onrender.com`
- **API**: `https://carpooling-api.onrender.com/api`
- **Health Check**: `https://carpooling-api.onrender.com/health`

---

## 🔧 Using render.yaml (Alternative)

If you have `render.yaml` in your repo root:

1. Render will auto-detect it
2. Click **"New +"** → **"Blueprint"**
3. Connect your repo
4. Render will create everything automatically

---

## 🎯 Your API Endpoints

Once deployed:

- **Health Check**: `GET https://your-api.onrender.com/health`
- **API Base**: `https://your-api.onrender.com/api`
- **Admin Login**: `POST https://your-api.onrender.com/api/admin/login`

---

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `package.json` scripts are correct
- Check TypeScript compilation errors

### Service Crashes
- Check logs: Service → "Logs" tab
- Verify environment variables are set
- Check database connection

### Database Connection Issues
- Verify `DATABASE_URL` is linked
- Check database is running
- Test: `psql $DATABASE_URL -c "SELECT 1"`

### Slow First Request
- Render free tier spins down after 15 min inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to paid plan for always-on

---

## 📊 Monitoring

**View Logs:**
- Go to your service
- Click **"Logs"** tab
- Real-time logs available

**Metrics:**
- View CPU, Memory usage
- Request counts
- Response times

---

## 🔄 Updating Deployment

Render auto-deploys on git push:

```bash
git add .
git commit -m "Update backend"
git push
```

Render will automatically:
1. Detect the push
2. Build the app
3. Deploy the new version

---

## 💰 Render Pricing

- **Free Tier**: 
  - Services spin down after 15 min inactivity
  - 750 hours/month
  - PostgreSQL included
- **Starter Plan**: $7/month (always-on)

---

## ⚡ Performance Tips

1. **Upgrade to Starter Plan** for always-on (no spin-down)
2. **Use connection pooling** (already configured)
3. **Enable caching** where possible
4. **Monitor logs** for errors

---

**🎉 Your backend is now live on Render!**

