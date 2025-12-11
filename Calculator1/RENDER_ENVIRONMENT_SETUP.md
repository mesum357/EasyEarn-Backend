# Render Environment Variables Setup Guide

## 🗄️ Backend Service Environment Variables

### Required Database Variables

Go to **Backend Service** → **Environment** tab → Add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DB_USER` | `calculator_db_9475_user` | From your database |
| `DB_HOST` | `dpg-d4f287gdl3ps73cl4cp0-a` | From your database |
| `DB_NAME` | `calculator_db_9475` | From your database |
| `DB_PASSWORD` | `FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq` | From your database |
| `DB_PORT` | `5432` | Standard PostgreSQL port |
| `NODE_ENV` | `production` | Set automatically |
| `PORT` | (auto-generated) | Render sets this automatically |
| `SESSION_SECRET` | (generate random string) | Generate: `openssl rand -base64 32` |

### Optional Frontend URLs (for CORS)

Add after frontend deploys:

| Variable | Value | Notes |
|----------|-------|-------|
| `FRONTEND_URL` | `https://nextjs-app.onrender.com` | Your frontend URL |
| `NEXTJS_FRONTEND_URL` | `https://nextjs-app.onrender.com` | Alternative name |
| `ADMIN_PANEL_URL` | `https://admin-panel.onrender.com` | If deploying admin panel |

---

## 🌐 Frontend (Next.js) Service Environment Variables

Go to **Frontend Service** → **Environment** tab → Add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://backend-api.onrender.com/api` | **CRITICAL**: Your backend URL + `/api` |
| `NODE_ENV` | `production` | Set automatically |
| `PORT` | (auto-generated) | Render sets this automatically |

**Important**: 
- Replace `backend-api.onrender.com` with your actual backend service URL
- Must include `/api` at the end
- Update this AFTER backend deploys

---

## 🔧 Admin Panel Environment Variables (if deploying)

Go to **Admin Panel Service** → **Environment** tab → Add:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://backend-api.onrender.com/api` | Your backend URL + `/api` |
| `NODE_ENV` | `production` | Set automatically |
| `PORT` | (auto-generated) | Render sets this automatically |

---

## 📋 Step-by-Step Setup

### Step 1: Set Backend Database Variables

1. **Open Render Dashboard** → Go to your **Backend Service**
2. **Click "Environment" tab**
3. **Click "Add Environment Variable"** for each:

   ```
   DB_USER=calculator_db_9475_user
   DB_HOST=dpg-d4f287gdl3ps73cl4cp0-a
   DB_NAME=calculator_db_9475
   DB_PASSWORD=FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq
   DB_PORT=5432
   ```

4. **Generate SESSION_SECRET**:
   - In terminal: `openssl rand -base64 32`
   - Copy the output
   - Add as: `SESSION_SECRET=<generated-string>`

5. **Click "Save Changes"** (service will restart)

### Step 2: Deploy Backend and Get URL

1. **Check Backend Service** is running
2. **Copy the service URL** (e.g., `https://backend-api-xxxx.onrender.com`)
3. **Save this URL** for next step

### Step 3: Set Frontend Environment Variables

1. **Go to Frontend Service** → **Environment** tab
2. **Add environment variable**:
   ```
   NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   ```
   Replace `YOUR-BACKEND-URL` with your actual backend URL
3. **Click "Save Changes"** (service will restart)

### Step 4: Update Backend CORS (Optional)

1. **Go back to Backend Service** → **Environment**
2. **Add frontend URL**:
   ```
   FRONTEND_URL=https://nextjs-app-xxxx.onrender.com
   ```
   Replace with your actual frontend URL
3. **Click "Save Changes"**

---

## ✅ Verification Checklist

After setting up all environment variables:

- [ ] Backend connects to database (check logs: "✓ Connected to PostgreSQL")
- [ ] Backend health endpoint works: `https://backend-api.onrender.com/health`
- [ ] Frontend can call backend API (check browser console)
- [ ] No CORS errors in browser console
- [ ] Database schema initialized (run schema.sql)

---

## 🔍 Finding Your Service URLs

### In Render Dashboard:

1. **Click on your service** (Backend or Frontend)
2. **Look at the top** - you'll see:
   ```
   https://service-name-xxxx.onrender.com
   ```
3. **Copy this URL** and use it in environment variables

---

## 🚨 Important Notes

### Security:
- **Never commit** `.env` files or actual passwords to Git
- Use Render Dashboard's environment variables (not `.env` files)
- `SESSION_SECRET` should be a random, strong string
- Database password is already set - don't change it unless necessary

### Environment Variable Prefixes:
- **Next.js**: Variables exposed to browser must start with `NEXT_PUBLIC_`
- **Vite**: Variables exposed to browser must start with `VITE_`
- **Backend**: No prefix needed (server-side only)

### Database Connection:
- Use **Internal Database URL** when connecting from Render services
- External URL only works from your local machine (with IP whitelist)
- SSL is automatically configured in `backend/config/database.js`

---

## 📝 Quick Reference

### Your Database Details:
```
Hostname: dpg-d4f287gdl3ps73cl4cp0-a
Port: 5432
Database: calculator_db_9475
Username: calculator_db_9475_user
Password: FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq
Internal URL: postgresql://calculator_db_9475_user:FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq@dpg-d4f287gdl3ps73cl4cp0-a/calculator_db_9475
```

### After Deployment:
1. Backend URL: `https://backend-api-xxxx.onrender.com`
2. Frontend URL: `https://nextjs-app-xxxx.onrender.com`
3. Set `NEXT_PUBLIC_API_URL` = `{backend-url}/api`
4. Set `FRONTEND_URL` = `{frontend-url}` (in backend)

---

## 🐛 Troubleshooting

### Backend can't connect to database:
- Verify all DB_* variables are set correctly
- Check database is "Available" (not "Creating")
- Ensure backend and database are in same region
- Check backend logs for specific error messages

### Frontend can't connect to backend:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Ensure URL includes `/api` at the end
- Check backend service is running (green status)
- Verify CORS settings in backend

### CORS errors:
- Add frontend URL to backend `FRONTEND_URL` variable
- Check backend CORS configuration in `backend/index.js`
- Ensure credentials: 'include' in frontend fetch calls

