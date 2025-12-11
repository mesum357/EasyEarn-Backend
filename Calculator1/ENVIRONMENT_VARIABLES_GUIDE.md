# Environment Variables Configuration for Render Deployment

## 📋 Quick Setup Summary

### Your Database Details (Already Created):
```
Service Name: Calculator1
Hostname: dpg-d4f287gdl3ps73cl4cp0-a
Port: 5432
Database: calculator_db_9475
Username: calculator_db_9475_user
Password: FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq
```

---

## 🔧 Backend Service Environment Variables

**Location**: Render Dashboard → Backend Service → Environment Tab

### Required Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DB_USER` | `calculator_db_9475_user` | Database username |
| `DB_HOST` | `dpg-d4f287gdl3ps73cl4cp0-a` | Database hostname |
| `DB_NAME` | `calculator_db_9475` | Database name |
| `DB_PASSWORD` | `FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq` | Database password |
| `DB_PORT` | `5432` | Database port |
| `NODE_ENV` | `production` | Environment (auto-set) |
| `PORT` | (auto-generated) | Server port (auto-set) |
| `SESSION_SECRET` | (generate random) | Session encryption key |

### Optional Variables (Set After Frontend Deploys):

| Variable | Value | Description |
|----------|-------|-------------|
| `FRONTEND_URL` | `https://nextjs-app-xxxx.onrender.com` | Frontend URL for CORS |

### How to Set:

1. Go to **Render Dashboard** → **Backend Service** (e.g., `backend-api`)
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"** for each variable above
4. **Generate SESSION_SECRET**:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and use as `SESSION_SECRET` value
5. Click **"Save Changes"** (service restarts automatically)

---

## 🌐 Frontend Service Environment Variables

**Location**: Render Dashboard → Frontend Service → Environment Tab

### Required Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://backend-api-xxxx.onrender.com/api` | Backend API URL + `/api` |

**Important**: 
- Replace `backend-api-xxxx.onrender.com` with your actual backend service URL
- Must include `/api` at the end
- Set this AFTER backend deploys

### Auto-Set Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Set automatically by Render |
| `PORT` | (auto-generated) | Set automatically by Render |

### How to Set:

1. **Wait for backend to deploy** and get its URL
2. Go to **Render Dashboard** → **Frontend Service** (e.g., `nextjs-app`)
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://YOUR-BACKEND-URL.onrender.com/api`
   - Replace `YOUR-BACKEND-URL` with actual backend URL
5. Click **"Save Changes"** (service restarts automatically)

---

## 🔐 Admin Panel Environment Variables (Optional)

If you deploy the admin panel separately:

**Location**: Render Dashboard → Admin Panel Service → Environment Tab

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://backend-api-xxxx.onrender.com/api` | Backend API URL + `/api` |

---

## 📝 Step-by-Step Instructions

### Step 1: Deploy Services

1. Connect your GitHub repo to Render
2. Use `render.yaml` or manually create services:
   - Backend Service (Web Service)
   - Frontend Service (Web Service)
   - Database already exists (skip)

### Step 2: Configure Backend

1. **Get Backend Service URL**:
   - After backend deploys, note the URL (e.g., `https://backend-api-xxxx.onrender.com`)

2. **Set Database Variables**:
   - Open Backend Service → Environment
   - Add all DB_* variables listed above
   - Generate and add SESSION_SECRET

3. **Verify Connection**:
   - Check logs for: `✓ Connected to PostgreSQL database successfully`
   - Test: `https://backend-api.onrender.com/health`

### Step 3: Initialize Database

1. **Get Database Connection**:
   - Go to Database service → Connections
   - Copy Internal Database URL

2. **Connect and Run Schema**:
   ```bash
   psql "postgresql://calculator_db_9475_user:FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq@dpg-d4f287gdl3ps73cl4cp0-a:5432/calculator_db_9475"
   ```
   
   Then run:
   ```sql
   \i /path/to/backend/database/schema.sql
   ```
   
   Or copy-paste contents of `backend/database/schema.sql`

### Step 4: Configure Frontend

1. **Set API URL**:
   - Open Frontend Service → Environment
   - Add: `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com/api`
   - Save and restart

2. **Verify Connection**:
   - Open frontend in browser
   - Check browser console for errors
   - Test that data loads from backend

### Step 5: Update CORS (Optional)

1. **Get Frontend URL**
2. **In Backend Service → Environment**:
   - Add: `FRONTEND_URL=https://YOUR-FRONTEND-URL.onrender.com`
   - Save and restart

---

## ✅ Verification

### Backend:
```bash
# Test health endpoint
curl https://backend-api.onrender.com/health

# Test API endpoint
curl https://backend-api.onrender.com/api/categories
```

### Frontend:
- Open browser console
- Check for API calls
- Verify no CORS errors
- Verify data loads correctly

---

## 🚨 Security Notes

1. **Never commit** actual passwords or secrets to Git
2. **Use Render Dashboard** for environment variables (not `.env` files in repo)
3. **SESSION_SECRET** should be a strong, random string
4. **Database password** is sensitive - only set in Render Dashboard
5. **Production URLs** should use HTTPS (Render handles this automatically)

---

## 📞 Quick Reference

### Your Current Configuration:

**Database:**
- Host: `dpg-d4f287gdl3ps73cl4cp0-a`
- Database: `calculator_db_9475`
- User: `calculator_db_9475_user`
- Port: `5432`

**Backend Variables Needed:**
```
DB_USER=calculator_db_9475_user
DB_HOST=dpg-d4f287gdl3ps73cl4cp0-a
DB_NAME=calculator_db_9475
DB_PASSWORD=FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq
DB_PORT=5432
SESSION_SECRET=<generate-random-string>
```

**Frontend Variables Needed:**
```
NEXT_PUBLIC_API_URL=https://backend-api-xxxx.onrender.com/api
```

---

For detailed deployment instructions, see `DEPLOYMENT_CHECKLIST.md`

