# 🚀 Complete Deployment Guide - Carpooling App

This guide covers deploying the backend API, admin portal, and building the Android APK.

## 📋 Table of Contents
1. [Backend API Deployment](#backend-api-deployment)
2. [Admin Portal Deployment](#admin-portal-deployment)
3. [Android APK Build](#android-apk-build)
4. [Production Configuration](#production-configuration)

---

## 🌐 Backend API Deployment

### Option 1: Railway (Recommended - Easiest)

1. **Sign up at [Railway.app](https://railway.app)**

2. **Create New Project:**
   ```bash
   cd server
   npm install -g @railway/cli
   railway login
   railway init
   ```

3. **Set Environment Variables in Railway Dashboard:**
   ```
   NODE_ENV=production
   PORT=5001
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=carpooling_db
   DB_USER=postgres
   DB_PASSWORD=your-db-password
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=https://your-admin-portal.vercel.app
   ADMIN_URL=https://your-admin-portal.vercel.app
   ```

4. **Add PostgreSQL Service:**
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Run Migrations:**
   ```bash
   railway run psql $DATABASE_URL -f src/database/schema.sql
   railway run psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql
   railway run node create-admin-user.js
   ```

7. **Get Your API URL:**
   - Railway will provide: `https://your-app.railway.app`
   - Your API will be at: `https://your-app.railway.app/api`

### Option 2: Render

1. **Sign up at [Render.com](https://render.com)**

2. **Create New Web Service:**
   - Connect your GitHub repository
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm run dev`
   - Environment: Node

3. **Set Environment Variables:**
   Same as Railway above

4. **Add PostgreSQL Database:**
   - Create new PostgreSQL database
   - Use the connection string in `DATABASE_URL`

5. **Deploy:**
   - Render will auto-deploy on git push

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login and Create App:**
   ```bash
   heroku login
   cd server
   heroku create your-carpool-api
   ```

3. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # ... add all other vars
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Run Migrations:**
   ```bash
   heroku run psql $DATABASE_URL -f src/database/schema.sql
   heroku run psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql
   heroku run node create-admin-user.js
   ```

---

## 🎨 Admin Portal Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd admin-portal
   vercel
   ```

3. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-api.railway.app/api
   ```

4. **Update API Configuration:**
   - Vercel will provide: `https://your-admin-portal.vercel.app`
   - Update `admin-portal/src/api.ts` to use production URL

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd admin-portal
   netlify deploy --prod
   ```

3. **Set Environment Variables in Netlify Dashboard:**
   ```
   VITE_API_URL=https://your-api.railway.app/api
   ```

### Option 3: GitHub Pages

1. **Update `vite.config.ts`:**
   ```typescript
   export default defineConfig({
     base: '/carpooling-admin/',
     // ... rest of config
   })
   ```

2. **Deploy:**
   ```bash
   npm run build
   # Upload dist/ folder to GitHub Pages
   ```

---

## 📱 Android APK Build

### Prerequisites

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Update API Configuration:**
   - Update `mobile/src/config/api.ts` with production API URL

### Build APK

1. **Configure Build:**
   ```bash
   cd mobile
   eas build:configure
   ```

2. **Update `eas.json`:**
   ```json
   {
     "build": {
       "production": {
         "android": {
           "buildType": "apk",
           "env": {
             "API_URL": "https://your-api.railway.app/api"
           }
         }
       }
     }
   }
   ```

3. **Build APK:**
   ```bash
   eas build --platform android --profile production
   ```

4. **Download APK:**
   - EAS will provide a download link
   - Or use: `eas build:list` to see all builds

### Local Build (Alternative)

1. **Install Android Studio**

2. **Generate Keystore:**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Update `app.json`:**
   ```json
   {
     "android": {
       "package": "com.carpooling.app",
       "versionCode": 1
     }
   }
   ```

4. **Build:**
   ```bash
   cd mobile
   npx expo build:android -t apk
   ```

---

## ⚙️ Production Configuration

### Backend Environment Variables

Create `.env` file in `server/`:

```env
NODE_ENV=production
PORT=5001
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=carpooling_db
DB_USER=postgres
DB_PASSWORD=your-db-password
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-admin-portal.vercel.app
ADMIN_URL=https://your-admin-portal.vercel.app
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Admin Portal Environment Variables

Create `.env.production` in `admin-portal/`:

```env
VITE_API_URL=https://your-api.railway.app/api
```

### Mobile App API Configuration

Update `mobile/src/config/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://11.11.10.194:5001/api'  // Local dev
  : 'https://your-api.railway.app/api';  // Production
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS for all services
- [ ] Set up CORS properly
- [ ] Use environment variables for all secrets
- [ ] Enable database backups
- [ ] Set up monitoring/logging
- [ ] Review and restrict API endpoints

---

## 📊 Post-Deployment Steps

1. **Test API:**
   ```bash
   curl https://your-api.railway.app/api/health
   ```

2. **Test Admin Portal:**
   - Visit: `https://your-admin-portal.vercel.app`
   - Login with admin credentials

3. **Test Mobile App:**
   - Install APK on Android device
   - Test login and core features

4. **Monitor:**
   - Check Railway/Render/Heroku logs
   - Monitor API response times
   - Check database connections

---

## 🆘 Troubleshooting

### API Not Accessible
- Check CORS settings
- Verify environment variables
- Check firewall/security groups

### Database Connection Issues
- Verify connection string
- Check database is running
- Verify credentials

### Admin Portal Not Loading
- Check `VITE_API_URL` is correct
- Verify API is accessible
- Check browser console for errors

### APK Build Fails
- Check EAS account status
- Verify app.json configuration
- Check build logs in EAS dashboard

---

## 📞 Support

For issues:
1. Check service logs
2. Verify environment variables
3. Test API endpoints directly
4. Check database connectivity

---

**🎉 Once deployed, your app will be accessible worldwide!**

