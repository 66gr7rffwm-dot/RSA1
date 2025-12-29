# 🌐 Vercel Deployment Guide (Admin Portal)

## 📋 Prerequisites

- Vercel account (free tier works)
- GitHub repository connected
- Environment variables configured

---

## 🚀 Deployment Methods

### Method 1: Auto-Deploy from GitHub (Recommended)

**If Vercel is already connected to your GitHub repo:**

1. **Go to Vercel Dashboard:** https://vercel.com
2. **Select your project** (admin portal)
3. **Go to "Deployments" tab**
4. **Click "Redeploy"** on the latest deployment
   - This will use the latest code from GitHub
5. **Wait 2-5 minutes** for deployment
6. **Visit your Vercel URL** to verify

**OR**

1. **Push new code to GitHub** (already done ✅)
2. **Vercel will auto-deploy** if connected
3. **Check "Deployments" tab** for status

---

### Method 2: Manual Deploy via Dashboard

1. **Go to:** https://vercel.com
2. **Login** to your account
3. **Click "Add New..." → "Project"**
4. **Import Git Repository:**
   - Select: `Amjad4093/RSA`
   - Click "Import"
5. **Configure Project:**
   - **Project Name:** `carpooling-admin-portal` (or your preferred name)
   - **Root Directory:** `admin-portal` ⚠️ **IMPORTANT**
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. **Environment Variables:**
   - Click "Environment Variables"
   - Add new variable:
     - **Name:** `VITE_API_URL`
     - **Value:** `https://carpooling-api-production-36c8.up.railway.app/api`
     - **Environment:** Production, Preview, Development (select all)
     - Click "Save"
7. **Click "Deploy"**
8. **Wait for deployment** (2-5 minutes)

---

### Method 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Navigate to admin portal
cd admin-portal

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? Yes (if project exists)
# - What's your project's name? carpooling-admin-portal
# - In which directory is your code located? ./
# - Want to override settings? No (or Yes to configure)
```

---

## ⚙️ Configuration Files

### vercel.json (Already exists ✅)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This file is already in your repo and will be used automatically.

---

## 🔧 Environment Variables

### Required Variable

**`VITE_API_URL`**
- **Value:** `https://carpooling-api-production-36c8.up.railway.app/api`
- **Purpose:** Points admin portal to your Railway backend API
- **Set in:** Vercel Dashboard → Project Settings → Environment Variables

### How to Set:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to "Settings" → "Environment Variables"**
4. **Click "Add New"**
5. **Enter:**
   - Key: `VITE_API_URL`
   - Value: `https://carpooling-api-production-36c8.up.railway.app/api`
   - Environments: Select all (Production, Preview, Development)
6. **Click "Save"**
7. **Redeploy** for changes to take effect

---

## ✅ Verify Deployment

### 1. Check Deployment Status

- Go to Vercel Dashboard
- Check "Deployments" tab
- Look for green checkmark ✅
- Click on deployment to see logs

### 2. Visit Your Site

- Your Vercel URL will be: `https://your-project-name.vercel.app`
- Or custom domain if configured
- Should load the admin portal login page

### 3. Test Functionality

1. **Login:**
   - Email: `admin@carpool.local`
   - Password: `admin123`

2. **Test Features:**
   - ✅ User management
   - ✅ Delete user
   - ✅ Edit user
   - ✅ View OTP
   - ✅ Logs portal
   - ✅ All other features

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Check for errors
   - Verify API calls are going to Railway

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
- Root directory is set to `admin-portal`
- Build command: `npm run build`
- Output directory: `dist`
- Check build logs in Vercel dashboard

### API Errors (404, CORS)

**Check:**
- `VITE_API_URL` environment variable is set
- Value points to correct Railway URL
- Railway backend is running
- CORS is configured on Railway

### Page Not Found (404)

**Check:**
- `vercel.json` has rewrites configured
- Framework preset is set to Vite
- Output directory is `dist`

### Login Not Working

**Check:**
- API URL is correct
- Railway backend is accessible
- Check Network tab for API calls
- Verify authentication token is being sent

---

## 📋 Deployment Checklist

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project created in Vercel
- [ ] Root directory set to `admin-portal`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable `VITE_API_URL` set
- [ ] Deployment triggered
- [ ] Build successful
- [ ] Site accessible
- [ ] Login works
- [ ] All features functional

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com
- **Vercel Docs:** https://vercel.com/docs
- **Your Repository:** https://github.com/Amjad4093/RSA

---

## 💡 Tips

1. **Auto-Deploy:** Connect GitHub repo for automatic deployments on push
2. **Preview Deployments:** Every PR gets a preview URL
3. **Custom Domain:** Add your domain in Project Settings
4. **Analytics:** Enable Vercel Analytics for insights
5. **Logs:** Check function logs in Vercel dashboard

---

**Your admin portal is ready to deploy! Follow any of the methods above.** 🚀

