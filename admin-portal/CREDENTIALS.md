# Admin Portal Login Credentials

## ✅ Correct Credentials

Based on the database, the admin user credentials are:

- **Email**: `admin@carpool.local`
- **Password**: `admin123`
- **Role**: Admin
- **Status**: Active & Verified

## 🔧 Troubleshooting

If you're getting "login failed" error:

1. **Check Backend Server**: Ensure the backend server is running on port 5000
   ```bash
   cd server
   npm run dev
   ```

2. **Verify Database Connection**: Make sure PostgreSQL is running and accessible

3. **Check Email**: Use the exact email: `admin@carpool.local` (not `admin@carpooling.com`)

4. **Check Browser Console**: Open browser DevTools (F12) and check:
   - Network tab for API requests
   - Console tab for errors
   - Look for CORS errors or connection errors

5. **Test API Directly**: 
   ```bash
   curl -X POST http://localhost:5000/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@carpool.local","password":"admin123"}'
   ```

## 🔄 Create New Admin User

If you need to create a new admin user with different credentials:

```bash
cd server
ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=your-password node create-admin-user.js
```

## 📝 Notes

- The admin portal runs on: http://localhost:5173
- The backend API runs on: http://localhost:5000
- Make sure both are running before attempting to login

