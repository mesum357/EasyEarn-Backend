# 🚀 Production Deployment Guide for Railway

## Environment Variables for Railway Backend

Set these environment variables in your Railway backend deployment:

### Required Variables

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here
SESSION_NAME=easyearn.sid
SESSION_MAX_AGE=604800000

# Environment
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-frontend-domain.up.railway.app
```

### Important Notes

1. **NODE_ENV=production** - This automatically enables:
   - Secure cookies (`secure: true`)
   - Cross-domain cookies (`sameSite: 'none'`)
   - HTTPS requirements

2. **SESSION_SECRET** - Must be a strong, unique key in production

3. **ALLOWED_ORIGINS** - Must include your frontend domain(s)

4. **Trust Proxy** - Already configured for Railway

## Frontend Configuration

Ensure your frontend is configured to:
- Use `credentials: 'include'` in fetch requests
- Use `withCredentials: true` in axios requests
- Point to the correct Railway backend URL

## Testing Production

1. Deploy backend to Railway
2. Set environment variables
3. Test login from frontend
4. Verify cookies are set with `secure` and `sameSite=none`

## Troubleshooting

- **401 Unauthorized**: Check CORS origins and cookie settings
- **Cookies not set**: Verify `NODE_ENV=production`
- **CORS errors**: Check `ALLOWED_ORIGINS` includes frontend domain
