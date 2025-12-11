# Database Initialization Guide for Render

## ⚠️ IMPORTANT: Initialize Database Before Using Backend

The 500 errors you're seeing (`/api/categories`, `/api/calculators`) are because **the database tables don't exist yet**. You need to initialize the database schema on Render.

---

## 🔧 Step 1: Access Render Shell

1. **Go to Render Dashboard** → Your **Backend Service**
2. Click **"Shell"** tab (in the left sidebar)
3. This opens a terminal where you can run commands

**Alternative**: Use local `psql` with the External Database URL (if you have it whitelisted)

---

## 📝 Step 2: Connect to Database via Render Shell

In the Render Shell, connect to PostgreSQL:

```bash
# Get your database connection details from Render Dashboard
# Go to Database service → Connections → Internal Database URL

# Use psql to connect (replace with your actual credentials)
psql "postgresql://calculator_db_9475_user:FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq@dpg-d4f287gdl3ps73cl4cp0-a:5432/calculator_db_9475"
```

**OR** if psql is not available in Render Shell, use the **Render PostgreSQL Console**:
1. Go to **Database service** → **Info** tab
2. Click **"Connect"** or **"psql"** button
3. This opens a PostgreSQL console

---

## 🗄️ Step 3: Initialize Database Schema

### Option A: Run schema.sql (Recommended)

1. **Copy the contents** of `backend/database/schema.sql`
2. **Paste into the PostgreSQL console** (or psql terminal)
3. **Press Enter** to execute

**OR** if you have file access in Render Shell:

```bash
# Navigate to your project directory
cd /opt/render/project/src

# Run schema file
psql "postgresql://calculator_db_9475_user:FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq@dpg-d4f287gdl3ps73cl4cp0-a:5432/calculator_db_9475" -f backend/database/schema.sql
```

### Option B: Manual SQL Execution

If you can't access files, paste this SQL directly into the PostgreSQL console:

```sql
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, slug)
);

-- Create calculators table
CREATE TABLE IF NOT EXISTS calculators (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    subcategory_id INTEGER NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    href VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    inputs JSONB DEFAULT '[]'::jsonb,
    results JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    most_used BOOLEAN DEFAULT false,
    popular BOOLEAN DEFAULT false,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, subcategory_id, slug)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_calculators_category_id ON calculators(category_id);
CREATE INDEX IF NOT EXISTS idx_calculators_subcategory_id ON calculators(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_calculators_slug ON calculators(slug);
CREATE INDEX IF NOT EXISTS idx_calculators_most_used ON calculators(most_used);
CREATE INDEX IF NOT EXISTS idx_calculators_popular ON calculators(popular);
CREATE INDEX IF NOT EXISTS idx_calculators_is_active ON calculators(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calculators_updated_at BEFORE UPDATE ON calculators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ Step 4: Verify Tables Created

After running the schema, verify tables exist:

```sql
-- List all tables
\dt

-- Should show:
-- - categories
-- - subcategories
-- - calculators

-- Verify calculators table structure
\d calculators

-- Should show columns including:
-- - id, category_id, subcategory_id, name, slug, description
-- - is_active, inputs, results, tags
-- - most_used, popular, likes
```

---

## 📊 Step 5: (Optional) Seed Initial Data

If you want sample data, run `backend/database/seed.sql`:

1. Copy contents of `backend/database/seed.sql`
2. Paste into PostgreSQL console
3. Execute

---

## 🔍 Step 6: Test Backend API

After initialization, test your backend:

```bash
# Health check
curl https://calculaotrbackend.onrender.com/health

# Test categories endpoint
curl https://calculaotrbackend.onrender.com/api/categories

# Test calculators endpoint
curl https://calculaotrbackend.onrender.com/api/calculators
```

You should now get JSON responses instead of 500 errors!

---

## 🐛 Troubleshooting

### Error: "relation 'categories' does not exist" (42P01)
- **Cause**: Tables haven't been created
- **Solution**: Run the schema.sql file as shown in Step 3

### Error: "password authentication failed" (28P01)
- **Cause**: Wrong database credentials
- **Solution**: Check environment variables in Render Dashboard → Backend Service → Environment

### Error: "database does not exist" (3D000)
- **Cause**: Database name is wrong
- **Solution**: Verify DB_NAME in environment variables matches your Render database name

### Error: "connection refused" (ECONNREFUSED)
- **Cause**: Can't connect to database
- **Solution**: 
  - Verify database is "Available" (not "Creating")
  - Check DB_HOST and DB_PORT are correct
  - Ensure backend and database are in same region

### psql not found in Render Shell
- **Solution**: Use Render's PostgreSQL Console instead:
  1. Go to Database service
  2. Click "Connect" or "psql" button
  3. Run SQL directly in the console

---

## 📋 Quick Reference

### Your Database Details:
```
Hostname: dpg-d4f287gdl3ps73cl4cp0-a
Port: 5432
Database: calculator_db_9475
Username: calculator_db_9475_user
Password: FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq
```

### Connection String:
```
postgresql://calculator_db_9475_user:FIgfkUs2NBk1e3bnM3mbTGxoa2z7CCGq@dpg-d4f287gdl3ps73cl4cp0-a:5432/calculator_db_9475
```

### Files to Run (in order):
1. `backend/database/schema.sql` - Creates all tables
2. `backend/database/seed.sql` - Adds sample data (optional)

---

## ✅ Checklist

- [ ] Connected to database via Render Shell or PostgreSQL Console
- [ ] Ran `schema.sql` to create tables
- [ ] Verified tables exist with `\dt`
- [ ] Tested `/api/categories` endpoint (should return JSON, not 500)
- [ ] Tested `/api/calculators` endpoint (should return JSON, not 500)
- [ ] (Optional) Ran `seed.sql` for sample data

---

**After completing these steps, your backend API should work correctly and the 500 errors will be resolved!**

