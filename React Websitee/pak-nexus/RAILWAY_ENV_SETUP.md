# Railway Environment Variables Setup

## Backend Environment Variables

Set these in your Railway backend service:

### Required Variables:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret_here
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
ADMIN_EMAIL=your_admin_email
FRONTEND_URL=https://your-frontend-url.railway.app
RAILWAY_STATIC_URL=https://your-backend-url.railway.app
```

### Optional Variables:
```
PORT=3000 (Railway will set this automatically)
```

## Frontend Environment Variables

Set these in your Railway frontend service:

### Required Variables:
```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_API_URL=https://your-backend-url.railway.app
```

### Optional Variables:
```
PORT=8080 (Railway will set this automatically)
```

## Important Notes:

1. **MongoDB Connection**: Make sure your MongoDB Atlas allows connections from all IPs (0.0.0.0/0) or add Railway's IP ranges.

2. **Google OAuth Setup**: 
   - Add your Railway backend URL to Google Console authorized redirect URIs
   - Format: `https://your-backend-url.railway.app/auth/google/homepage`

3. **CORS Configuration**: The backend is now configured to accept requests from Railway domains.

4. **Email Configuration**: Use Gmail App Passwords, not your regular Gmail password.

## Deployment Steps:

1. Deploy backend first
2. Get the backend Railway URL
3. Update FRONTEND_URL and RAILWAY_STATIC_URL in backend environment
4. Update VITE_API_URL in frontend environment with backend URL
5. Deploy frontend
6. Update Google OAuth settings with new URLs
