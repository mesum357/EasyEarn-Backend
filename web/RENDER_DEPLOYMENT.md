# Deploying Next.js App with Backend to Render

This guide will help you deploy your Next.js 15.3.3 application with Express.js backend and PostgreSQL database to Render.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Architecture Overview

Your deployment includes **3 services**:
1. **PostgreSQL Database** - Stores calculator data
2. **Backend API** (Express.js) - Serves API endpoints on port 3001
3. **Frontend** (Next.js) - React application

## Configuration Overview

Your app is already configured with:
- ✅ `render.yaml` with all 3 services
- ✅ Database connection automatically configured
- ✅ Backend API service configured
- ✅ Frontend Next.js app configured
- ✅ Environment variables linked between services

## Step-by-Step Deployment

### Option 1: Using render.yaml (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push
   ```

2. **Connect Repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your Git repository
   - Render will automatically detect `render.yaml` and create all 3 services:
     - PostgreSQL database (`calculator-db`)
     - Backend API (`backend-api`)
     - Frontend app (`nextjs-app`)

3. **Initialize Database** (IMPORTANT - Do this after first deployment)
   - Wait for all services to deploy successfully
   - Go to your backend service (`backend-api`) in Render dashboard
   - Click on "Shell" tab (or use "Manual Deploy" → "Run Command")
   - Run the database setup:
     ```bash
     npm run setup-db
     ```
   - This will create tables and seed initial data

4. **Configure Backend URL** (REQUIRED)
   - After backend deploys, note its URL (e.g., `https://backend-api.onrender.com`)
   - Go to your Frontend service (`nextjs-app`) dashboard
   - Click "Environment" tab
   - Add environment variable:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://backend-api.onrender.com` (use your actual backend URL)
   - Save changes (service will restart)

5. **Configure Additional Environment Variables** (if needed)
   - In your Frontend service dashboard, go to "Environment"
   - Add any other required environment variables:
     - `NEXT_PUBLIC_*` variables (exposed to browser)
     - Firebase configuration (if used)

6. **Verify Deployment**
   - Check all 3 services are running (green status)
   - Test backend API: `https://backend-api.onrender.com/health`
   - Test frontend: `https://nextjs-app.onrender.com`
   - Verify frontend can connect to backend (check browser console for API calls)

### Option 2: Manual Setup (Not Recommended - Use render.yaml instead)

If you prefer manual setup, you'll need to create 3 services:

#### 1. Create PostgreSQL Database
- Click "New +" → "PostgreSQL"
- Name: `calculator-db`
- Database: `calculator_db`
- User: `calculator_user`
- Plan: Free (or paid)
- Click "Create Database"
- **Save the connection details!**

#### 2. Create Backend API Service
- Click "New +" → "Web Service"
- Connect your Git repository
- **Root Directory**: `backend`
- **Name**: `backend-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: `20`

**Environment Variables** (use values from database):
- `NODE_ENV`: `production`
- `PORT`: (auto-generated)
- `DB_USER`: (from database dashboard)
- `DB_HOST`: (from database dashboard)
- `DB_NAME`: `calculator_db`
- `DB_PASSWORD`: (from database dashboard)
- `DB_PORT`: `5432`

#### 3. Create Frontend Service
- Click "New +" → "Web Service"
- Connect your Git repository
- **Name**: `nextjs-app`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: `20`

**Environment Variables**:
- `NODE_ENV`: `production`
- `PORT`: (auto-generated)
- `NEXT_PUBLIC_API_URL`: `https://backend-api.onrender.com` (your backend URL)

#### 4. Initialize Database
After backend deploys, run database setup (see Option 1, Step 3)

## Important Notes

### Service URLs
After deployment, you'll have:
- **Database**: Internal (only accessible from backend)
- **Backend API**: `https://backend-api.onrender.com`
- **Frontend**: `https://nextjs-app.onrender.com`

### Port Configuration
- Render automatically sets the `PORT` environment variable for all services
- Next.js 15 and Express.js automatically use this port
- No additional configuration needed

### Database Setup
- **CRITICAL**: You must run `npm run setup-db` in the backend service after first deployment
- This creates tables and seeds initial data
- You can do this via Render Shell or by adding it to a build script

### Build Optimization
Your `next.config.ts` is already configured for production:
- TypeScript errors are ignored during builds (you may want to fix these)
- ESLint errors are ignored during builds (you may want to fix these)
- Image domains are configured for `placehold.co` and `picsum.photos`

### Environment Variables

**Backend Service** (automatically configured):
- Database connection variables are auto-linked from the database service
- `NODE_ENV` and `PORT` are set automatically

**Frontend Service**:
- `NEXT_PUBLIC_API_URL` must be set manually to your backend URL (e.g., `https://backend-api.onrender.com`)
- **Client-side variables**: Must be prefixed with `NEXT_PUBLIC_`
- **Server-side variables**: Can be any name, but keep them secret
- Set variables in Render Dashboard → Environment tab

### Firebase Configuration (if used)
If you're using Firebase, add to Frontend service:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### CORS Configuration
Your backend already has CORS enabled, which allows your frontend to make API calls. If you need to restrict it:
- Update `backend/index.js` to specify allowed origins

## Post-Deployment

1. **Check Build Logs**
   - Go to your service → "Logs" tab
   - Verify the build completed successfully

2. **Test Your App**
   - Your app will be available at: `https://your-app-name.onrender.com`
   - Test all major features

3. **Custom Domain** (Optional)
   - Go to Settings → Custom Domains
   - Add your domain and follow DNS configuration instructions

## Troubleshooting

### Backend Issues

**Backend won't start:**
- Check database connection variables are set correctly
- Verify database service is running
- Check backend logs for connection errors

**Database connection errors:**
- Ensure database service is deployed and running
- Verify environment variables are linked correctly
- Check if database initialization completed

**API endpoints not working:**
- Verify backend service is running
- Check CORS configuration
- Test backend health endpoint: `/health`

### Frontend Issues

**Build Fails:**
- Check build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility (Next.js 15 requires Node 18+)

**App Crashes on Start:**
- Check runtime logs
- Verify all environment variables are set
- Ensure `PORT` is not manually set (Render handles this)
- Check if `NEXT_PUBLIC_API_URL` is set correctly

**Can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` points to your backend URL
- Check backend service is running
- Verify CORS is enabled in backend

### Database Issues

**Tables don't exist:**
- Run `npm run setup-db` in backend service shell
- Check database logs for errors
- Verify database connection credentials

**Data not persisting:**
- Free tier databases have 90-day retention
- Consider upgrading to paid plan for production

### Environment Variables Not Working
- Client-side variables must start with `NEXT_PUBLIC_`
- Restart the service after adding new environment variables
- Rebuild may be required for some changes
- For backend, ensure variables are linked from database service

## Performance Tips

1. **Enable Caching**: Render automatically caches `node_modules` between builds
2. **Use Standalone Output** (Optional): Add to `next.config.ts`:
   ```typescript
   output: 'standalone',
   ```
   This creates a minimal production build (requires adjusting start command)

3. **Database Connection Pooling**: Your backend already uses connection pooling (pg.Pool)
4. **Monitor**: Use Render's metrics to monitor performance of all services

## Cost Considerations

- **Free Tier**: 
  - Services spin down after 15 minutes of inactivity
  - First request after spin-down may be slow (cold start)
  - Database has 90-day data retention limit
  - Good for development/testing
- **Paid Plans**: 
  - Services stay always-on
  - Better performance and reliability
  - No data retention limits
  - Recommended for production

## Updating Your App

1. **Code Changes**: Push to Git, Render auto-deploys
2. **Database Changes**: 
   - Update schema files
   - Run migrations manually via backend shell
   - Or add migration script to backend
3. **Environment Variables**: Update in dashboard, service restarts automatically

## Next Steps

1. Set up automatic deployments from your main branch
2. Configure custom domain (if needed)
3. Set up monitoring and alerts
4. Review and optimize build times

---

For more help, check [Render's Next.js Documentation](https://render.com/docs/deploy-nextjs)

