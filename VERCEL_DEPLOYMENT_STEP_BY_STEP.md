# 🌐 Vercel Deployment - Step by Step Guide

## ✅ Step 1: Verify Code is Committed

**Check Git Status:**
```bash
cd "/Users/hafizamjad/Documents/Test androird application/RSA"
git status
```

**Should show:** "nothing to commit, working tree clean"

**If there are uncommitted changes:**
```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 📋 Step 2: Check Vercel Connection

### Option A: Check if Project Exists on Vercel

1. **Go to:** https://vercel.com
2. **Login** to your account
3. **Click "Dashboard"** (top left)
4. **Look for your project** (might be named "RSA" or "carpooling-admin-portal")
5. **If project exists:**
   - Click on it
   - Go to "Deployments" tab
   - Check if latest commit is there
   - If not, click "Redeploy"

### Option B: Create New Project

**If no project exists:**

1. **Go to:** https://vercel.com
2. **Click "Add New..." → "Project"**
3. **Import Git Repository:**
   - Search for: `Amjad4093/RSA`
   - Click "Import"

---

## ⚙️ Step 3: Configure Project Settings

**IMPORTANT:** These settings are critical!

### Project Configuration:

1. **Project Name:** `carpooling-admin-portal` (or your choice)

2. **Root Directory:** ⚠️ **MUST BE SET TO `admin-portal`**
   - Click "Edit" next to Root Directory
   - Type: `admin-portal`
   - Click "Save"

3. **Framework Preset:** `Vite` (should auto-detect)

4. **Build Command:** `npm run build` (should auto-fill)

5. **Output Directory:** `dist` (should auto-fill)

6. **Install Command:** `npm ci` (should auto-fill)

---

## 🔧 Step 4: Set Environment Variables

**CRITICAL:** Without this, API calls won't work!

1. **In Vercel project settings:**
   - Click "Settings" tab
   - Click "Environment Variables" (left sidebar)

2. **Add New Variable:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://carpooling-api-production-36c8.up.railway.app/api`
   - **Environment:** Select ALL (Production, Preview, Development)
   - Click "Save"

3. **Redeploy** after adding environment variable

---

## 🚀 Step 5: Deploy

### Method 1: Auto-Deploy (If Connected to GitHub)

1. **Push code to GitHub** (already done ✅)
2. **Vercel should auto-detect** and start deployment
3. **Check "Deployments" tab** for status

### Method 2: Manual Deploy

1. **In Vercel Dashboard:**
   - Go to "Deployments" tab
   - Click "Redeploy" on latest deployment
   - OR click "Add New..." → "Deploy"

2. **Select:**
   - Branch: `main`
   - Root Directory: `admin-portal`
   - Click "Deploy"

---

## 🔍 Step 6: Monitor Deployment

### Check Build Logs:

1. **Go to Deployments tab**
2. **Click on the latest deployment**
3. **Click "Build Logs"** or "View Function Logs"
4. **Watch for:**
   - ✅ "Installing dependencies..."
   - ✅ "Building..."
   - ✅ "Build completed"
   - ❌ Any errors (red text)

### Common Build Stages:

```
1. Cloning repository... ✅
2. Installing dependencies... ✅
3. Building application... ✅
4. Uploading build outputs... ✅
5. Deployment ready! ✅
```

---

## 🐛 Troubleshooting

### Issue 1: Build Fails Immediately

**Check:**
- Root directory is set to `admin-portal`
- Build command is `npm run build`
- Output directory is `dist`

### Issue 2: Build Hangs

**Solutions:**
1. **Increase timeout:**
   - Settings → General
   - Build Command Timeout: 10 minutes

2. **Check build logs** for specific error

3. **Try local build:**
   ```bash
   cd admin-portal
   npm ci
   npm run build
   ```

### Issue 3: 404 Errors After Deployment

**Check:**
- `vercel.json` exists in `admin-portal` folder
- Rewrites are configured correctly
- Framework preset is Vite

### Issue 4: API Calls Fail

**Check:**
- Environment variable `VITE_API_URL` is set
- Value is correct: `https://carpooling-api-production-36c8.up.railway.app/api`
- Redeploy after adding environment variable

---

## 📱 Step 7: Verify Deployment

### 1. Check Deployment Status

**In Vercel Dashboard:**
- Green checkmark ✅ = Success
- Red X ❌ = Failed
- Yellow circle ⏳ = Building

### 2. Visit Your Site

**Your Vercel URL will be:**
- `https://your-project-name.vercel.app`
- Or custom domain if configured

### 3. Test Functionality

1. **Visit the URL**
2. **Should see login page**
3. **Login:** `admin@carpool.local` / `admin123`
4. **Test features:**
   - User management
   - Delete user
   - Edit user
   - View OTP
   - Logs portal

### 4. Check Browser Console

1. **Open DevTools** (F12)
2. **Check Console tab** for errors
3. **Check Network tab** for API calls
4. **Verify API calls** go to Railway URL

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your Repository:** https://github.com/Amjad4093/RSA
- **Railway API:** https://carpooling-api-production-36c8.up.railway.app

---

## 📞 Still Not Working?

### Check These:

1. **GitHub Connection:**
   - Vercel → Settings → Git
   - Verify repository is connected
   - Check permissions

2. **Build Logs:**
   - Copy error messages
   - Check for specific failures

3. **Local Build:**
   ```bash
   cd admin-portal
   npm ci
   npm run build
   ```
   - If this fails, fix issues first
   - If this works, issue is Vercel-specific

4. **Vercel Support:**
   - Check Vercel status: https://vercel-status.com
   - Contact Vercel support if needed

---

## ✅ Checklist

- [ ] Code committed and pushed to GitHub
- [ ] Vercel account created and logged in
- [ ] Project created or exists in Vercel
- [ ] Root directory set to `admin-portal`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable `VITE_API_URL` set
- [ ] Deployment triggered
- [ ] Build completed successfully
- [ ] Site accessible
- [ ] Login works
- [ ] API calls successful

---

**Follow these steps carefully and your deployment should work!** 🚀

