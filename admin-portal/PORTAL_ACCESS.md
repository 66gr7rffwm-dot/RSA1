# 🚀 Admin Portal - Local Access

## ✅ Portal is Running!

**URL:** http://localhost:5173

The admin portal development server is now running locally.

---

## 🔐 Login Credentials

**Admin Email:** `admin@carpool.local`  
**Admin Password:** `admin123`

---

## 📋 Available Features

### 1. **Dashboard**
- Overview statistics
- Recent activity
- System health

### 2. **User Management** 👥
- View all users
- Create new users
- Activate/Deactivate users
- **Delete users** (new!)
- **View OTP** with eye icon (dev mode)
- Filter by role (driver/passenger/admin)
- Search functionality

### 3. **Logs Portal** 📊 (NEW!)
- View all API requests/responses
- Filter by:
  - Method (GET/POST/PUT/DELETE)
  - Status code
  - Date range
  - User
  - Search
- Statistics dashboard:
  - Total requests
  - Success/Error counts
  - Average response time
  - Unique endpoints
  - Active users
- View log details
- Delete old logs

### 4. **KYC Requests**
- View driver verification requests
- Approve/Reject KYC

### 5. **Vehicles**
- View registered vehicles
- Vehicle management

### 6. **Routes & Trips**
- View all trips
- Trip management

### 7. **Pricing**
- Configure pricing settings

### 8. **Disputes**
- Manage user disputes

### 9. **Reports**
- View system reports

---

## 🔧 Configuration

**API URL:** `https://carpooling-api-production-36c8.up.railway.app/api`

The portal is configured to connect to your deployed API on Railway.

To change the API URL:
1. Edit `admin-portal/src/api.ts`
2. Update the `API_URL` constant
3. Or create `.env.local` with `VITE_API_URL=your-api-url`

---

## 🛑 Stop Server

Press `Ctrl + C` in the terminal to stop the server.

---

## 🐛 Troubleshooting

### Portal won't load
- Check if port 5173 is available
- Try accessing: http://localhost:5173

### Can't login
- Verify credentials: `admin@carpool.local` / `admin123`
- Check API connection in browser console

### API errors
- Check browser console for errors
- Verify API is accessible: https://carpooling-api-production-36c8.up.railway.app/health
- Check network tab for failed requests

### Logs not showing
- Ensure logging middleware is enabled on server
- Check database connection
- Verify logs table exists

---

## 📱 Testing Checklist

- [ ] Login to portal
- [ ] View dashboard
- [ ] Check user management
- [ ] Test delete user functionality
- [ ] Test OTP viewing (eye icon)
- [ ] Access logs portal
- [ ] Test log filters
- [ ] View log statistics
- [ ] Test log details viewer
- [ ] Verify error messages

---

**Portal is ready for testing!** 🎉

