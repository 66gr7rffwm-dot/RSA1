# 🚀 Quick Deployment Guide

## Step 1: Deploy Backend API (Railway - 5 minutes)

1. **Sign up at [railway.app](https://railway.app)** (free tier available)

2. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Deploy:**
   ```bash
   cd server
   railway init
   railway up
   ```

4. **Add PostgreSQL Database:**
   - In Railway dashboard: Click "New" → "Database" → "PostgreSQL"
   - Railway auto-sets `DATABASE_URL`

5. **Set Environment Variables in Railway Dashboard:**
   ```
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=your-super-secret-key-here-min-32-chars
   FRONTEND_URL=https://your-admin.vercel.app
   ADMIN_URL=https://your-admin.vercel.app
   ```

6. **Run Migrations:**
   ```bash
   railway run psql $DATABASE_URL -f src/database/schema.sql
   railway run psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql
   railway run node create-admin-user.js
   ```

7. **Get Your API URL:**
   - Railway provides: `https://your-app.railway.app`
   - Your API: `https://your-app.railway.app/api`
   - **Save this URL!** You'll need it for admin portal and mobile app.

---

## Step 2: Deploy Admin Portal (Vercel - 3 minutes)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd admin-portal
   ./deploy-vercel.sh https://your-app.railway.app/api
   ```
   
   Or manually:
   ```bash
   echo "VITE_API_URL=https://your-app.railway.app/api" > .env.production
   vercel --prod
   ```

3. **Get Admin Portal URL:**
   - Vercel provides: `https://your-admin-portal.vercel.app`
   - Login with: `admin@carpool.local` / `admin123`

---

## Step 3: Build Android APK (EAS - 15 minutes)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Update API URL in `mobile/eas.json`:**
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_API_URL": "https://your-app.railway.app/api"
         }
       }
     }
   }
   ```

3. **Build APK:**
   ```bash
   cd mobile
   ./build-android.sh https://your-app.railway.app/api
   ```
   
   Or manually:
   ```bash
   eas build --platform android --profile production
   ```

4. **Download APK:**
   - Visit: https://expo.dev/accounts/amjad4093/projects/carpooling-app/builds
   - Download the APK file
   - Install on Android device

---

## ✅ Verification Checklist

- [ ] Backend API is accessible: `curl https://your-app.railway.app/api/health`
- [ ] Admin portal loads: Visit your Vercel URL
- [ ] Can login to admin portal
- [ ] APK downloads successfully
- [ ] APK installs on Android device
- [ ] Mobile app can connect to API (test login)

---

## 🔧 Troubleshooting

### API Not Working
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Check database connection

### Admin Portal Can't Connect
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Open browser console for errors

### APK Build Fails
- Check EAS account has build credits
- Verify `eas.json` configuration
- Check build logs in EAS dashboard

---

## 📱 Testing the APK

1. **Install on Android Device:**
   - Enable "Install from Unknown Sources"
   - Transfer APK to device
   - Install

2. **Test Features:**
   - Login/Register
   - Search rides
   - Create trip (if driver)
   - Book ride (if passenger)
   - Profile management

---

## 🎉 You're Live!

Your carpooling app is now:
- ✅ Backend API: `https://your-app.railway.app/api`
- ✅ Admin Portal: `https://your-admin-portal.vercel.app`
- ✅ Android APK: Ready to install

**Next Steps:**
- Share APK with testers
- Monitor Railway/Vercel dashboards
- Set up custom domain (optional)
- Enable Google Maps API for full functionality

