# Render Deployment Guide - PostgreSQL & Website

## 🗄️ Step 1: Create PostgreSQL Database on Render

### Using Render Dashboard:

1. **Log in to Render**
   - Go to https://dashboard.render.com
   - Sign in or create an account

2. **Create PostgreSQL Database**
   - Click "New +" button in top right
   - Select "PostgreSQL"
   
3. **Configure Database:**
   - **Name**: `calculator-db`
   - **Database**: `calculator_db`
   - **User**: `calculator_user`
   - **Region**: `Oregon` (or your preferred region - same as backend)
   - **PostgreSQL Version**: Latest (14+ recommended)
   - **Plan**: Free (or Starter for production)
   - Click "Create Database"

4. **Wait for Provisioning**
   - Takes ~2 minutes
   - You'll see a green "Available" status when ready

### Using render.yaml (Automated):

If you're using `render.yaml` in your repository:

1. **Fix the database type** in `render.yaml`:
   ```yaml
   - type: pg  # Not "pspg"
   ```

2. **Deploy via Render Blueprint:**
   - Connect your GitHub repository to Render
   - Render will auto-detect `render.yaml`
   - Click "Apply" to create all services

## 🔗 Step 2: Link Database to Backend

### Automatic Linking (via render.yaml):

Your `render.yaml` already has the database linking configured:
```yaml
- key: DB_USER
  fromDatabase:
    name: calculator-db
    property: user
- key: DB_HOST
  fromDatabase:
    name: calculator-db
    property: host
# ... etc
```

This automatically links when you deploy via Blueprint.

### Manual Linking:

If deploying services separately:

1. **Open Backend Service** in Render Dashboard
2. **Go to "Environment" tab**
3. **Add Environment Variables:**
   - Click "Add Environment Variable"
   - Add these one by one (get values from Database → Connections):

   ```
   DB_USER=<from database connections>
   DB_HOST=<from database connections>
   DB_NAME=calculator_db
   DB_PASSWORD=<from database connections>
   DB_PORT=<from database connections>
   ```

4. **Alternative: Use Internal Database URL**
   - From Database → Connections
   - Copy "Internal Database URL"
   - Set as single variable:
   ```
   DATABASE_URL=<internal-database-url>
   ```
   - Then update `backend/config/database.js` to parse this URL

## 🗃️ Step 3: Initialize Database Schema

After database is created, you need to run your schema:

### Option A: Using Render Shell

1. **Open Database Service** in Render Dashboard
2. **Click "Connect"** → "Connect via psql"
3. **Copy the psql connection command**
4. **Run in terminal:**
   ```bash
   psql "postgresql://calculator_user:password@host:port/calculator_db"
   ```
5. **Inside psql, run:**
   ```sql
   \i database/schema.sql
   ```
   Or copy-paste the contents of `backend/database/schema.sql`

### Option B: Using Backend Script

1. **Update `backend/package.json`** to add setup script:
   ```json
   {
     "scripts": {
       "setup-db": "node scripts/setup-db.js",
       "postinstall": "npm run setup-db || true"
     }
   }
   ```

2. **Create `backend/scripts/setup-db.js`:**
   ```javascript
   const pool = require('../config/database');
   const fs = require('fs');
   const path = require('path');

   async function setupDatabase() {
     try {
       const schema = fs.readFileSync(
         path.join(__dirname, '../database/schema.sql'), 
         'utf8'
       );
       
       await pool.query(schema);
       console.log('✓ Database schema created successfully');
       process.exit(0);
     } catch (error) {
       console.error('✗ Error setting up database:', error);
       process.exit(1);
     }
   }

   setupDatabase();
   ```

3. **Deploy backend** - schema will run automatically

### Option C: Manual SQL Execution

1. **Get External Connection String** from Database → Connections
2. **Use local psql or pgAdmin:**
   ```bash
   psql "postgresql://user:password@external-host:port/calculator_db"
   ```
3. **Run schema:**
   ```sql
   \i path/to/backend/database/schema.sql
   ```

## 🔧 Step 4: Update Backend Configuration

Ensure `backend/config/database.js` reads from environment variables correctly:

```javascript
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'calculator_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  // For Render, also add SSL
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});
```

## 🌐 Step 5: Link Frontend to Backend

1. **Get Backend URL:**
   - Open backend service in Render
   - Copy the service URL (e.g., `https://backend-api.onrender.com`)

2. **Update Frontend Environment:**
   - Open frontend service in Render
   - Go to "Environment" tab
   - Add/Update:
   ```
   NEXT_PUBLIC_API_URL=https://backend-api.onrender.com
   ```

## ✅ Step 6: Verify Connection

### Test Database Connection:

1. **Check Backend Logs:**
   - Go to backend service → "Logs"
   - Look for: `✓ Connected to PostgreSQL database successfully`

2. **Test API Endpoints:**
   ```bash
   curl https://backend-api.onrender.com/api/categories
   ```

3. **Check Database:**
   - Use Render Shell or psql
   - Verify tables exist:
   ```sql
   \dt
   SELECT * FROM categories;
   ```

## 📝 Important Notes

### Free Tier Limitations:
- **90-day data retention**: Free PostgreSQL databases are deleted after 90 days of inactivity
- **Sleeping services**: Free web services spin down after 15 minutes of inactivity
- **Consider**: Upgrade to paid plans for production

### Security:
- **Never commit** `.env` files or database credentials
- Use **Internal Database URL** when connecting from Render services
- Use **External Database URL** only from local development

### Connection String Format:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Internal vs External URLs:
- **Internal URL**: Only works between Render services in same region (faster, secure)
- **External URL**: Works from anywhere (slower, needs firewall rules)

## 🚀 Quick Deployment Checklist

- [ ] PostgreSQL database created on Render
- [ ] Database schema initialized
- [ ] Backend service created and linked to database
- [ ] Environment variables set correctly
- [ ] Frontend service created and linked to backend
- [ ] Test API endpoints working
- [ ] Frontend can communicate with backend

## 🔍 Troubleshooting

### Database Connection Failed:
- Check environment variables are set correctly
- Verify database is "Available" (not "Creating")
- Ensure backend and database are in same region
- Check SSL settings if using external connection

### Schema Not Running:
- Verify `database/schema.sql` is in repository
- Check file paths in setup script
- Run schema manually via Render Shell

### API Not Working:
- Check backend logs for errors
- Verify `NEXT_PUBLIC_API_URL` is set in frontend
- Check CORS settings in backend
- Ensure backend service is "Live" (not sleeping)

## 📚 Additional Resources

- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)

