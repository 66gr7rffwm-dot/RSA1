# Admin Portal - Local Deployment Guide

## ✅ Admin Portal is Now Running!

The admin portal development server has been started and is accessible at:

**🌐 http://localhost:5173**

## Prerequisites

Before using the admin portal, ensure:

1. **Backend Server is Running**: The admin portal connects to the backend API at `http://localhost:5000`
   - Make sure the backend server is running
   - If backend is on a different port, update `vite.config.ts` proxy settings

2. **Database is Configured**: PostgreSQL database should be running and accessible
   - Check `server/.env` for database configuration

## Quick Start

### 1. Install Dependencies (Already Done)
```bash
cd admin-portal
npm install
```

### 2. Start Development Server (Already Running)
```bash
npm run dev
```

The server will start on `http://localhost:5173`

### 3. Access the Portal

Open your browser and navigate to:
```
http://localhost:5173
```

## Admin Login

To access the admin portal, you need an admin user account:

1. **Create Admin User** (if not exists):
   - The admin user must have `role = 'admin'` in the database
   - You can create one via the backend API or directly in the database

2. **Login Credentials**:
   - Email: Your admin email
   - Password: Your admin password

## Features Available

- ✅ **Dashboard**: Analytics, charts, and overview metrics
- ✅ **User Management**: View and manage all users
- ✅ **KYC Requests**: Review and approve driver KYC documents
- ✅ **Vehicles**: View registered vehicles
- ✅ **Routes & Trips**: Monitor trips and routes
- ✅ **Pricing Configuration**: Manage pricing settings
- ✅ **Disputes**: Handle user disputes
- ✅ **Reports**: View detailed reports and analytics

## Configuration

### API Endpoint

The admin portal connects to the backend API. Configuration:

- **Development**: Uses Vite proxy (`/api` → `http://localhost:5000/api`)
- **Production**: Set `VITE_API_URL` environment variable

### Environment Variables

Create a `.env` file in `admin-portal/` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.ts
```

### Backend Connection Issues

1. **Check Backend is Running**:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check CORS Settings**: Ensure backend allows requests from `http://localhost:5173`

3. **Check Proxy Settings**: Verify `vite.config.ts` proxy configuration

### Login Issues

- Ensure admin user exists in database with `role = 'admin'`
- Check backend `/api/admin/login` endpoint is working
- Verify JWT_SECRET is set in backend `.env`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production Deployment

For production deployment:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Serve the `dist/` folder** using:
   - Nginx
   - Apache
   - Vercel
   - Netlify
   - Any static file server

3. **Set environment variables**:
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   ```

## Next Steps

1. ✅ Admin portal is running at http://localhost:5173
2. ⚠️ Ensure backend server is running at http://localhost:5000
3. ⚠️ Create an admin user if you haven't already
4. ✅ Login and start managing the carpooling platform!

---

*Admin Portal v2.0.0 - Enhanced UI/UX with Charts & Analytics*

