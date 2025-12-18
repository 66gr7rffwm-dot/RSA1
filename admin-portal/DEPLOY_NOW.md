# 🚀 Deploy Admin Portal to Vercel - Quick Guide

## ✅ Pre-Deployment Checklist

- [x] API URL configured: `https://carpooling-api-production-36c8.up.railway.app/api`
- [x] Build successful
- [x] Code updated to use environment variable

## 🚀 Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

1. **Login to Vercel:**
   ```bash
   cd admin-portal
   vercel login
   ```
   This will open your browser for authentication.

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (first time)
   - Project name: `carpooling-admin-portal` (or press Enter)
   - Directory: `./` (press Enter)
   - Override settings? **No** (press Enter)

4. **Get your URL:**
   - Vercel will provide a URL like: `https://carpooling-admin-portal.vercel.app`
   - Save this URL!

### Option 2: Using Vercel Dashboard

1. **Go to:** https://vercel.com
2. **Sign up/Login** (use GitHub for easy setup)
3. **Click "Add New" → "Project"**
4. **Import your GitHub repository:**
   - Select: `Amjad4093/RSA`
   - Root Directory: `admin-portal`
5. **Configure:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. **Environment Variables:**
   - Add: `VITE_API_URL` = `https://carpooling-api-production-36c8.up.railway.app/api`
7. **Click "Deploy"**

## 🔧 After Deployment

### 1. Update Railway CORS Settings

Once you have your Vercel URL, set these in Railway Dashboard → Variables:

```
FRONTEND_URL=https://your-admin-portal.vercel.app
ADMIN_URL=https://your-admin-portal.vercel.app
```

### 2. Test Admin Portal

1. Visit your Vercel URL
2. Login with:
   - **Email:** `admin@carpool.local`
   - **Password:** `admin123`

### 3. Verify Everything Works

- ✅ Login page loads
- ✅ Can login with admin credentials
- ✅ Dashboard shows data
- ✅ All pages accessible

## 🐛 Troubleshooting

### CORS Errors

If you see CORS errors:
1. Make sure `FRONTEND_URL` and `ADMIN_URL` are set in Railway
2. Wait 1-2 minutes for Railway to redeploy
3. Clear browser cache and try again

### API Connection Errors

1. Check `.env.production` has correct API URL
2. Verify API is accessible: `curl https://carpooling-api-production-36c8.up.railway.app/health`
3. Check browser console for errors

### Build Errors

If build fails:
```bash
cd admin-portal
rm -rf node_modules dist
npm install
npm run build
```

## 📋 Quick Commands

```bash
# Navigate to admin portal
cd admin-portal

# Login to Vercel (first time)
vercel login

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## 🎯 Your URLs

**Backend API:**
```
https://carpooling-api-production-36c8.up.railway.app
```

**Admin Portal:** (After deployment)
```
https://your-admin-portal.vercel.app
```

**Admin Login:**
- Email: `admin@carpool.local`
- Password: `admin123`

---

**Ready to deploy?** Run `vercel login` then `vercel --prod` in the admin-portal directory!

