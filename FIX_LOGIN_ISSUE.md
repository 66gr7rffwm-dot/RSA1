# Fix Admin Portal Login Issue

## Problem
Port 5000 is being used by macOS AirPlay/ControlCenter, blocking the backend server.

## Solution Options

### Option 1: Change Backend Port (Recommended)

1. **Update server port to 5001**:
   ```bash
   cd server
   echo "PORT=5001" >> .env
   ```

2. **Update admin portal API URL**:
   Edit `admin-portal/vite.config.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:5001',  // Changed from 5000
       changeOrigin: true,
       secure: false,
     }
   }
   ```

3. **Restart both servers**:
   ```bash
   # Kill existing processes
   lsof -ti:5000 | xargs kill -9 2>/dev/null
   lsof -ti:5001 | xargs kill -9 2>/dev/null
   
   # Start backend on new port
   cd server
   npm run dev
   
   # Start admin portal (in another terminal)
   cd admin-portal
   npm run dev
   ```

### Option 2: Disable AirPlay on Port 5000 (macOS)

1. **System Settings** → **General** → **AirPlay Receiver**
2. Turn off AirPlay Receiver
3. Restart backend server

### Option 3: Use Different Port via Environment Variable

```bash
# Start backend on port 5001
cd server
PORT=5001 npm run dev
```

Then update `admin-portal/vite.config.ts` proxy target to `http://localhost:5001`

## Correct Login Credentials

- **Email**: `admin@carpool.local`
- **Password**: `admin123`

**Important**: Use `admin@carpool.local` (not `admin@carpooling.com`)

## Verify Backend is Running

```bash
# Check if backend is responding
curl http://localhost:5001/health

# Or test admin login
curl -X POST http://localhost:5001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carpool.local","password":"admin123"}'
```

## Quick Fix Script

Run this to automatically fix the port issue:

```bash
cd server
# Update .env
echo "PORT=5001" >> .env

# Update vite config (if needed)
# Then restart servers
```

