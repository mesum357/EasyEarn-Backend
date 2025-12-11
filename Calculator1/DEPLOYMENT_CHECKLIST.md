cd # 🚀 Render Deployment Checklist

## Prerequisites
- [ ] GitHub repository with your code
- [ ] Render account created
- [ ] PostgreSQL database created on Render (already done: "Calculator1")

## Step 1: Connect Repository to Render

1. [ ] Go to Render Dashboard
2. [ ] Click "New +" → "Blueprint"
3. [ ] Connect your GitHub repository
4. [ ] Select the repository
5. [ ] Render will detect `render.yaml`
6. [ ] Review services and click "Apply"

## Step 2: Configure Backend Service

After deployment starts, configure backend:

### In Render Dashboard → Backend Service → Environment:

1. [ ] **Set Database Variables** (REQUIRED):
   ```
   DB_USER=calculator_db_9475_user
   DB_HOST=dpg-d4f287gdl3ps73cl4cp0-a
   DB_NAME=calculator_db_9475
   DB_PASSWORD=FIgfkUs2NBk1e3mbTGxoa2z7CCGq
   DB_PORT=5432
   ```

2. [ ] **Verify Auto-Set Variables**:
   - `NODE_ENV=production` ✓
   - `PORT` (auto-generated) ✓
   - `SESSION_SECRET` (should be auto-generated)

3. [ ] **Save Changes** (service restarts)

4. [ ] **Check Logs** - Should see:
   ```
   ✓ Connected to PostgreSQL database successfully
   Server is running on http://localhost:${PORT}
   ```

## Step 3: Initialize Database Schema

1. [ ] **Get Database Connection**:
   - Go to Database service → Connections
   - Copy Internal Database URL

2. [ ] **Connect via Render Shell**:
   - Click "Shell" in Render sidebar
   - Or use local psql with External URL

3. [ ] **Run Schema**:
   ```bash
   psql "postgresql://calculator_db_9475_user:FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq@dpg-d4f287gdl3ps73cl4cp0-a:5432/calculator_db_9475"
   ```
   
   Then inside psql:
   ```sql
   \i /path/to/backend/database/schema.sql
   ```
   
   Or copy-paste contents of `backend/database/schema.sql`

4. [ ] **Verify Tables Created**:
   ```sql
   \dt
   ```

## Step 4: Get Backend URL

1. [ ] **Open Backend Service** in Render Dashboard
2. [ ] **Copy the service URL** (e.g., `https://backend-api-xxxx.onrender.com`)
3. [ ] **Test Health Endpoint**:
   ```bash
   curl https://backend-api-xxxx.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

4. [ ] **Save Backend URL** for next step

## Step 5: Configure Frontend Service

### In Render Dashboard → Frontend Service → Environment:

1. [ ] **Set API URL** (REQUIRED):
   ```
   NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   ```
   Replace `YOUR-BACKEND-URL` with actual backend URL from Step 4

2. [ ] **Verify Auto-Set Variables**:
   - `NODE_ENV=production` ✓
   - `PORT` (auto-generated) ✓

3. [ ] **Save Changes** (service restarts)

## Step 6: Update Backend CORS (Optional)

1. [ ] **Get Frontend URL**:
   - Open Frontend Service
   - Copy the service URL

2. [ ] **In Backend Service → Environment**:
   - Add: `FRONTEND_URL=https://YOUR-FRONTEND-URL.onrender.com`
   - Save Changes

## Step 7: Verify Deployment

### Backend Verification:
- [ ] Health endpoint works: `https://backend-api.onrender.com/health`
- [ ] API endpoint works: `https://backend-api.onrender.com/api/categories`
- [ ] Database connection successful (check logs)

### Frontend Verification:
- [ ] Frontend loads: `https://nextjs-app.onrender.com`
- [ ] No console errors
- [ ] Can fetch data from backend (check Network tab)
- [ ] No CORS errors

## Step 8: Test Application

- [ ] Homepage loads correctly
- [ ] Categories display
- [ ] Calculators list loads
- [ ] Calculator pages work
- [ ] Search functionality works (if applicable)
- [ ] User authentication works (if applicable)

## Common Issues & Solutions

### Backend won't start:
- Check all DB_* variables are set
- Verify database is "Available"
- Check backend logs for specific errors

### Frontend can't connect to backend:
- Verify `NEXT_PUBLIC_API_URL` includes `/api`
- Check backend service is running
- Verify CORS settings

### Database connection fails:
- Double-check all DB_* variables
- Ensure backend and database in same region
- Check SSL settings (already configured)

## Your Configuration Summary

### Database:
```
Hostname: dpg-d4f287gdl3ps73cl4cp0-a
Database: calculator_db_9475
Username: calculator_db_9475_user
Port: 5432
```

### Backend Environment Variables Needed:
```
DB_USER=calculator_db_9475_user
DB_HOST=dpg-d4f287gdl3ps73cl4cp0-a
DB_NAME=calculator_db_9475
DB_PASSWORD=FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq
DB_PORT=5432
NODE_ENV=production (auto-set)
PORT (auto-generated)
SESSION_SECRET (generate: openssl rand -base64 32)
FRONTEND_URL=https://nextjs-app-xxxx.onrender.com (after frontend deploys)
```

### Frontend Environment Variables Needed:
```
NEXT_PUBLIC_API_URL=https://backend-api-xxxx.onrender.com/api
NODE_ENV=production (auto-set)
PORT (auto-generated)
```

## Next Steps After Deployment

1. [ ] Run database migrations (if any)
2. [ ] Seed initial data (if needed)
3. [ ] Set up custom domain (optional)
4. [ ] Configure monitoring (optional)
5. [ ] Set up backups for database
6. [ ] Review and optimize performance

