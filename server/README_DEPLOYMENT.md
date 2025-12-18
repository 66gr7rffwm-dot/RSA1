# 🚀 Backend API Deployment - Quick Start

## ✅ Everything is Ready!

Your backend is configured for deployment on both **Railway** and **Render**.

---

## 🎯 Choose Your Platform

### 🚂 Railway (Easier - Recommended)

**Why Railway?**
- ✅ Always-on (no spin-down)
- ✅ Faster setup
- ✅ Better free tier
- ✅ CLI-based (easy automation)

**Start Here:**
👉 Open `START_DEPLOYMENT.md` and follow "Railway Deployment" section

**Quick Commands:**
```bash
cd server
railway login          # Opens browser
railway init           # Create project
railway add postgresql # Add database
railway up             # Deploy!
```

---

### 🎨 Render (Visual Dashboard)

**Why Render?**
- ✅ Visual dashboard (no CLI)
- ✅ GitHub auto-deploy
- ✅ Easy environment management

**Start Here:**
👉 Open `START_DEPLOYMENT.md` and follow "Render Deployment" section

**Quick Steps:**
1. Go to https://render.com
2. Create Web Service
3. Add PostgreSQL
4. Deploy!

---

## 📋 Pre-Deployment Checklist

- [x] ✅ Railway CLI installed
- [x] ✅ Deployment configs created (`render.yaml`, `Procfile`, `railway.json`)
- [x] ✅ Database connection configured
- [x] ✅ Migration scripts ready
- [x] ✅ Environment variables documented

---

## 🚀 Quick Start Commands

### Railway (Copy & Paste)

```bash
# 1. Navigate to server
cd "/Users/hafizamjad/Documents/Test androird application/RSA/server"

# 2. Login (opens browser)
railway login

# 3. Initialize
railway init

# 4. Add database
railway add postgresql

# 5. Set variables (replace URLs with yours)
JWT_SECRET=$(openssl rand -base64 32)
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set FRONTEND_URL="https://your-admin.vercel.app"
railway variables set ADMIN_URL="https://your-admin.vercel.app"

# 6. Deploy
railway up

# 7. Get URL
railway domain

# 8. Run migrations
railway run psql $DATABASE_URL -f src/database/schema.sql
railway run psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql
railway run node create-admin-user.js
```

---

## 📚 Documentation Files

- **`START_DEPLOYMENT.md`** - Step-by-step commands (START HERE!)
- **`DEPLOY_RAILWAY.md`** - Detailed Railway guide
- **`DEPLOY_RENDER.md`** - Detailed Render guide
- **`QUICK_DEPLOY_CHOOSE.md`** - Platform comparison

---

## 🎯 What Happens After Deployment?

1. **You'll get an API URL**: `https://your-app.railway.app/api`
2. **Update mobile app**: Change API URL in `mobile/eas.json`
3. **Update admin portal**: Set `VITE_API_URL` in `admin-portal/.env.production`
4. **Rebuild APK**: With new API URL
5. **Test everything**: Login, search rides, etc.

---

## 🔧 Troubleshooting

### Can't Login to Railway
- Make sure you have a Railway account: https://railway.app
- Try: `railway login --browserless` (uses token)

### Database Connection Fails
- Check `DATABASE_URL` is set: `railway variables`
- Verify database is running in Railway dashboard

### Build Fails
- Check logs: `railway logs`
- Verify `package.json` scripts are correct
- Check TypeScript compilation

---

## 📞 Support

**Railway:**
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app

**Render:**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs

---

## 🎉 Ready to Deploy?

**Open `START_DEPLOYMENT.md` and follow the steps!**

The deployment will take about 5-10 minutes. Once done, you'll have a live API that your mobile app and admin portal can connect to!

---

**💡 Tip**: Start with Railway - it's the easiest option!

