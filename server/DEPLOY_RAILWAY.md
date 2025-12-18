# 🚂 Deploy Backend API to Railway

## Quick Start (5 minutes)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### Step 3: Initialize Project

```bash
cd server
railway init
```

Select:
- "Create a new project" → Name it "carpooling-api"
- Or "Link to existing project" if you have one

### Step 4: Add PostgreSQL Database

```bash
railway add postgresql
```

This automatically:
- Creates a PostgreSQL database
- Sets `DATABASE_URL` environment variable
- Connects it to your service

### Step 5: Set Environment Variables

```bash
# Set required variables
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set FRONTEND_URL=https://your-admin-portal.vercel.app
railway variables set ADMIN_URL=https://your-admin-portal.vercel.app
```

**Or set them in Railway Dashboard:**
1. Go to your project: https://railway.app/dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add each variable

### Step 6: Deploy

```bash
railway up
```

Railway will:
- Build your app
- Deploy it
- Provide a URL like: `https://your-app.railway.app`

### Step 7: Run Database Migrations

```bash
# Get database connection string
railway variables

# Run migrations
railway run psql $DATABASE_URL -f src/database/schema.sql
railway run psql $DATABASE_URL -f src/database/migrations/001_roles_permissions.sql
railway run node create-admin-user.js
```

### Step 8: Get Your API URL

```bash
railway domain
```

Your API will be at: `https://your-app.railway.app/api`

---

## 🎯 Your API Endpoints

Once deployed, your API will be available at:

- **Base URL**: `https://your-app.railway.app`
- **API**: `https://your-app.railway.app/api`
- **Health Check**: `https://your-app.railway.app/health`

---

## 🔧 Troubleshooting

### Build Fails
- Check Railway logs: `railway logs`
- Verify `package.json` has correct scripts
- Check TypeScript compilation

### Database Connection Issues
- Verify `DATABASE_URL` is set
- Check database is running in Railway dashboard
- Test connection: `railway run psql $DATABASE_URL -c "SELECT 1"`

### API Not Accessible
- Check service is running: `railway status`
- Verify PORT is set correctly
- Check CORS settings in `src/index.ts`

---

## 📊 Monitoring

**View Logs:**
```bash
railway logs
```

**View Metrics:**
- Go to Railway dashboard
- Click on your service
- View "Metrics" tab

---

## 🔄 Updating Deployment

After making changes:

```bash
git add .
git commit -m "Update backend"
git push
railway up
```

Railway will automatically rebuild and redeploy.

---

## 💰 Railway Pricing

- **Free Tier**: $5 credit/month
- **Hobby Plan**: $5/month (if you exceed free tier)
- PostgreSQL: Included in free tier

---

**🎉 Your backend is now live on Railway!**

