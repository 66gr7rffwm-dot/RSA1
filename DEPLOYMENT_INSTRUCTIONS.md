# 🚀 Deployment Instructions

## ✅ Code Pushed to GitHub

**Repository:** https://github.com/Amjad4093/RSA.git  
**Commit:** `33f5318` - "Fix delete user route, improve UI, add OTP viewing, edit user functionality, and logging portal"

---

## 📦 Railway Deployment (Backend Server)

### Option 1: Auto-Deploy from GitHub (Recommended)

If Railway is connected to your GitHub repo:

1. **Go to Railway Dashboard:** https://railway.app
2. **Select your project** (carpooling-api-production)
3. **Check Deployments tab** - It should auto-deploy from the latest push
4. **Wait for deployment** (usually 2-5 minutes)
5. **Check logs** to ensure deployment succeeded

### Option 2: Manual Deploy via Railway CLI

```bash
# Install Railway CLI (if not installed)
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
cd server
railway link

# Deploy
railway up
```

### Option 3: Manual Deploy via Railway Dashboard

1. **Go to Railway Dashboard**
2. **Select your project**
3. **Click "Deploy" or "Redeploy"**
4. **Select the branch:** `main`
5. **Wait for deployment**

---

## 🌐 Vercel Deployment (Admin Portal)

### Option 1: Auto-Deploy from GitHub (Recommended)

If Vercel is connected to your GitHub repo:

1. **Go to Vercel Dashboard:** https://vercel.com
2. **Select your project** (admin portal)
3. **Go to Deployments tab**
4. **Click "Redeploy"** or wait for auto-deploy
5. **Select branch:** `main`
6. **Root directory:** `admin-portal`
7. **Build command:** `npm run build`
8. **Output directory:** `dist`
9. **Wait for deployment**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Navigate to admin portal
cd admin-portal

# Deploy
vercel --prod
```

### Option 3: Manual Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Click "Deployments"**
4. **Click "Redeploy"** on latest deployment
5. **Or click "Add New..." → "Import Git Repository"**
6. **Select:** `Amjad4093/RSA`
7. **Root Directory:** `admin-portal`
8. **Framework Preset:** Vite
9. **Build Command:** `npm run build`
10. **Output Directory:** `dist`
11. **Environment Variables:**
    - `VITE_API_URL` = `https://carpooling-api-production-36c8.up.railway.app/api`

---

## 🔧 Environment Variables

### Railway (Backend)

Make sure these are set in Railway:

```env
DATABASE_URL=your_postgres_url
NODE_ENV=production
JWT_SECRET=your_jwt_secret
PORT=5001
FRONTEND_URL=https://your-frontend-url.com
ADMIN_URL=https://your-admin-portal-url.vercel.app
```

### Vercel (Admin Portal)

Make sure these are set in Vercel:

```env
VITE_API_URL=https://carpooling-api-production-36c8.up.railway.app/api
```

**To set in Vercel:**
1. Go to Project Settings
2. Click "Environment Variables"
3. Add `VITE_API_URL`
4. Value: `https://carpooling-api-production-36c8.up.railway.app/api`
5. Save and redeploy

---

## ✅ Verify Deployment

### Backend (Railway)

1. **Check Health Endpoint:**
   ```bash
   curl https://carpooling-api-production-36c8.up.railway.app/health
   ```

2. **Check Logs:**
   - Go to Railway Dashboard
   - Click "Logs" tab
   - Look for: `🚀 Server running on port...`

3. **Test API:**
   ```bash
   curl https://carpooling-api-production-36c8.up.railway.app/api/admin/users
   ```

### Admin Portal (Vercel)

1. **Visit your Vercel URL:**
   - Should load the admin portal
   - Check browser console for errors

2. **Test Login:**
   - Login with admin credentials
   - Verify all features work

3. **Check Network Tab:**
   - Verify API calls are going to Railway
   - Check for any 404 or CORS errors

---

## 🐛 Troubleshooting

### Railway Deployment Issues

1. **Build Fails:**
   - Check Railway logs
   - Verify `package.json` has correct scripts
   - Check Node version compatibility

2. **Server Won't Start:**
   - Check environment variables
   - Verify database connection
   - Check PORT configuration

3. **404 Errors:**
   - Verify routes are registered
   - Check server logs
   - Ensure latest code is deployed

### Vercel Deployment Issues

1. **Build Fails:**
   - Check build logs
   - Verify `package.json` dependencies
   - Check Vite configuration

2. **API Errors:**
   - Verify `VITE_API_URL` is set
   - Check CORS settings on Railway
   - Verify API is accessible

3. **404 on Routes:**
   - Check `vercel.json` configuration
   - Verify routing setup
   - Check build output

---

## 📋 Deployment Checklist

### Railway (Backend)
- [ ] Code pushed to GitHub
- [ ] Railway connected to GitHub repo
- [ ] Environment variables set
- [ ] Deployment triggered
- [ ] Health endpoint working
- [ ] API routes accessible
- [ ] Database connected

### Vercel (Admin Portal)
- [ ] Code pushed to GitHub
- [ ] Vercel connected to GitHub repo
- [ ] Root directory set to `admin-portal`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable `VITE_API_URL` set
- [ ] Deployment triggered
- [ ] Portal accessible
- [ ] Login working
- [ ] API calls successful

---

## 🎯 Quick Deploy Commands

### Railway
```bash
cd server
railway up
```

### Vercel
```bash
cd admin-portal
vercel --prod
```

---

## 📞 Support

If deployment fails:
1. Check deployment logs
2. Verify environment variables
3. Check GitHub repository
4. Verify service connections

**All code is now in GitHub and ready for deployment!** 🚀

