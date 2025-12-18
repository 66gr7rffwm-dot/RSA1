# ✅ Next Steps - Railway is Online!

## 🎯 Step 1: Get Your API URL

**Option A: Via Railway Dashboard**
1. Go to: https://railway.app/dashboard
2. Click on your project
3. Click on your service
4. Go to "Settings" → "Domains"
5. Copy your domain (e.g., `https://your-app.railway.app`)

**Option B: Via CLI**
```bash
cd server
railway domain
```

**Your API endpoints will be:**
- Base URL: `https://your-app.railway.app`
- API: `https://your-app.railway.app/api`
- Health Check: `https://your-app.railway.app/health`

---

## 🧪 Step 2: Test Your API

Test if the API is responding:

```bash
# Replace with your actual Railway URL
curl https://your-app.railway.app/health
```

**Expected response:**
```json
{"status":"OK","message":"Server is running"}
```

If you get an error, check Railway logs:
```bash
railway logs
```

---

## 🗄️ Step 3: Run Database Migrations

**Important:** You need to set up your database schema and create an admin user.

### 3.1: Check if Database is Connected

In Railway Dashboard:
1. Go to your project
2. Check if you have a PostgreSQL service
3. If not, click "New" → "Database" → "PostgreSQL"

### 3.2: Run Migrations

```bash
cd server

# Run database schema
railway run psql $DATABASE_URL -f src/database/schema.sql

# Run migrations (roles & permissions)
railway run psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql

# Create admin user
railway run node create-admin-user.js
```

**Expected output:**
- ✅ Schema created
- ✅ Migrations completed
- ✅ Admin user created

**Admin credentials:**
- Email: `admin@carpool.local`
- Password: `admin123`

---

## 🔐 Step 4: Set Environment Variables (If Not Done)

Make sure these are set in Railway Dashboard → Variables:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://your-admin-portal.vercel.app
ADMIN_URL=https://your-admin-portal.vercel.app
DATABASE_URL=postgresql://... (auto-set by Railway)
```

**To set via CLI:**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set FRONTEND_URL=https://your-admin-portal.vercel.app
railway variables set ADMIN_URL=https://your-admin-portal.vercel.app
```

---

## 🎨 Step 5: Deploy Admin Portal

### 5.1: Update Admin Portal with API URL

```bash
cd admin-portal

# Create production environment file
echo "VITE_API_URL=https://your-app.railway.app/api" > .env.production

# Replace with your actual Railway URL!
```

### 5.2: Deploy to Vercel

**Option A: Using deploy script**
```bash
./deploy-vercel.sh https://your-app.railway.app/api
```

**Option B: Manual deployment**
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
vercel --prod
```

**After deployment:**
- Get your Vercel URL (e.g., `https://your-admin-portal.vercel.app`)
- Login with: `admin@carpool.local` / `admin123`

### 5.3: Update Railway Environment Variables

Go back to Railway Dashboard and update:
```
FRONTEND_URL=https://your-admin-portal.vercel.app
ADMIN_URL=https://your-admin-portal.vercel.app
```

---

## 📱 Step 6: Update Mobile App

### 6.1: Update API URL in Mobile App

Edit `mobile/eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-app.railway.app/api"
      }
    }
  }
}
```

### 6.2: Update API Config

Edit `mobile/src/config/api.ts`:

```typescript
export const API_URL = process.env.API_URL || 'https://your-app.railway.app/api';
```

### 6.3: Build Android APK (Optional)

```bash
cd mobile
eas build --platform android --profile production
```

---

## ✅ Step 7: Verify Everything Works

### Test API Endpoints:

```bash
# Health check
curl https://your-app.railway.app/health

# Test registration (should return OTP required)
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+923001234567","fullName":"Test User"}'
```

### Test Admin Portal:
1. Visit your Vercel URL
2. Login with `admin@carpool.local` / `admin123`
3. Check if dashboard loads

---

## 🐛 Troubleshooting

### API returns 500 errors:
```bash
# Check Railway logs
railway logs

# Check if database is connected
railway variables | grep DATABASE_URL
```

### Database connection errors:
1. Check Railway Dashboard → PostgreSQL service is running
2. Verify `DATABASE_URL` is set
3. Re-run migrations

### Admin portal can't connect to API:
1. Check CORS settings in Railway
2. Verify `FRONTEND_URL` matches your Vercel URL
3. Check browser console for errors

---

## 📋 Checklist

- [ ] API is online and responding
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Environment variables set
- [ ] Admin portal deployed
- [ ] Admin portal connected to API
- [ ] Mobile app API URL updated
- [ ] Everything tested and working

---

## 🎉 You're Done!

Your carpooling application is now live:
- ✅ Backend API: `https://your-app.railway.app`
- ✅ Admin Portal: `https://your-admin-portal.vercel.app`
- ✅ Mobile App: Ready for APK build

**Next:** Start testing and adding real data!

