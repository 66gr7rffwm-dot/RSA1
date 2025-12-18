# Deploy Carpooling Backend to Render

## Step 1: Push Code to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name it: `carpooling-backend` (or any name you prefer)
   - Make it **Public** or **Private** (both work with Render)
   - Don't initialize with README (we already have code)

2. Push your local code to GitHub:
   ```bash
   cd /Users/hafizamjad/Documents/Test\ androird\ application/RSA/server
   git remote add origin https://github.com/YOUR_USERNAME/carpooling-backend.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Render

1. Go to https://render.com and sign up/login (use GitHub to sign in)

2. Click **"New +"** → **"Blueprint"**

3. Connect your GitHub repository:
   - Select the `carpooling-backend` repository
   - Click **"Connect"**

4. Render will automatically detect the `render.yaml` file and create:
   - ✅ Web Service (API)
   - ✅ PostgreSQL Database

5. Click **"Apply"** to start deployment

## Step 3: Run Database Migration

After deployment completes (5-10 minutes):

1. Go to your web service dashboard on Render
2. Click **"Shell"** tab
3. Run the migration command:
   ```bash
   npm run migrate
   ```

4. Create test users:
   ```bash
   node create-test-user.js
   ```

## Step 4: Get Your API URL

1. On the web service dashboard, you'll see your API URL:
   - Format: `https://carpooling-api-xxxx.onrender.com`
   
2. Your API endpoints will be:
   - `https://carpooling-api-xxxx.onrender.com/api/auth/login`
   - `https://carpooling-api-xxxx.onrender.com/api/trips`
   - etc.

## Step 5: Test Your API

Test the health endpoint:
```bash
curl https://YOUR-API-URL.onrender.com/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected"
}
```

## Important Notes

- ⚠️ Free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- Database has 90-day data retention on free tier
- All environment variables are automatically set via render.yaml

## Next Steps

Once deployed, update the mobile app with your Render API URL and rebuild the APK.
