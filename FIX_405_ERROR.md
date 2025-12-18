# 🔧 Fix 405 Error on Admin Login

## Issue
Getting `405 Method Not Allowed` when clicking "Sign In" button in admin portal.

## ✅ Fixes Applied

### 1. Updated CORS Configuration
- Allow all origins in production
- Allow all necessary HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Added proper headers

### 2. Added Better Error Logging
- Console logs will show the exact URL being called
- Shows method, baseURL, and full URL

## 🔍 Debugging Steps

### Step 1: Check Browser Console

Open browser DevTools (F12) → Console tab, and look for:
- API URL being used
- Full request URL
- Error details

### Step 2: Verify Environment Variable

**If deployed to Vercel:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Check if `VITE_API_URL` is set to: `https://carpooling-api-production-36c8.up.railway.app/api`

**If missing, add it:**
- Key: `VITE_API_URL`
- Value: `https://carpooling-api-production-36c8.up.railway.app/api`
- Environment: Production, Preview, Development (select all)

### Step 3: Redeploy Admin Portal

After setting environment variable:
```bash
cd admin-portal
vercel --prod
```

Or trigger redeploy from Vercel Dashboard.

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Click "Sign In"
3. Look for the request to `/admin/login`
4. Check:
   - Request URL (should be Railway URL)
   - Request Method (should be POST)
   - Status Code
   - Response headers

## 🐛 Common Causes

### 1. Environment Variable Not Set
**Symptom:** Request goes to Vercel domain instead of Railway
**Fix:** Set `VITE_API_URL` in Vercel

### 2. CORS Issue
**Symptom:** 405 on OPTIONS preflight
**Fix:** Already fixed in server code (wait for Railway redeploy)

### 3. Wrong API URL
**Symptom:** 404 or wrong endpoint
**Fix:** Verify API URL is correct

## ✅ Verify Fix

1. **Check Railway is redeployed:**
   - Wait 1-2 minutes after code push
   - Check Railway deployment logs

2. **Check Vercel environment variable:**
   - Verify `VITE_API_URL` is set
   - Redeploy if needed

3. **Test login:**
   - Clear browser cache
   - Try login again
   - Check browser console for errors

## 🧪 Test API Directly

```bash
# Should return success
curl -X POST https://carpooling-api-production-36c8.up.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carpool.local","password":"admin123"}'
```

## 📋 Quick Checklist

- [ ] CORS updated in server (wait for Railway redeploy)
- [ ] `VITE_API_URL` set in Vercel
- [ ] Admin portal redeployed
- [ ] Browser cache cleared
- [ ] Check browser console for errors
- [ ] Check Network tab for request details

---

**After fixes:**
1. Wait for Railway to redeploy (1-2 min)
2. Set `VITE_API_URL` in Vercel if not set
3. Redeploy admin portal
4. Clear browser cache and try again

