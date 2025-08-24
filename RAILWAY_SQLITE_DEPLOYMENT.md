# SQLite Deployment on Railway

Railway supports SQLite deployment in multiple ways. This guide covers the recommended approaches.

## Option 1: SQLite with Railway Volumes (Recommended)

### Why Use Volumes?
- **Persistent storage**: Database survives deployments and restarts
- **Better performance**: Faster than ephemeral storage
- **Data safety**: Your data won't be lost during deployments

### Setup Steps:

#### 1. Railway Project Configuration

1. **Create Railway Project**:
   ```bash
   # Option A: Via Railway CLI
   railway login
   railway init
   railway up
   
   # Option B: Via Railway Dashboard
   # Go to https://railway.app/dashboard
   # Click "New Project" > "Deploy from GitHub repo"
   ```

2. **Configure Environment Variables** in Railway Dashboard:
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-super-secure-secret-key-here
   PORT=8000
   DATABASE_PATH=/app/data/database.db
   ```

#### 2. Volume Configuration

Railway will automatically create volumes based on the `railway.json` configuration:

```json
{
  "volumes": [
    {
      "name": "sqlite-data",
      "mountPath": "/app/data"
    }
  ]
}
```

#### 3. Database Initialization

The server automatically:
- Creates the database directory if it doesn't exist
- Initializes tables on first run
- Uses the volume-mounted path for persistent storage

## Option 2: SQLite with Railway's Built-in Storage

### Simple Deployment (No Volume Setup)

If you prefer a simpler setup without volumes:

1. **Remove Volume Configuration**: Delete the `volumes` section from `railway.json`

2. **Use Default Database Path**: The database will be created in the app directory

3. **Environment Variables**:
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-super-secure-secret-key-here
   PORT=8000
   # Don't set DATABASE_PATH - will use default
   ```

⚠️ **Warning**: Without volumes, the database may be reset during deployments.

## Option 3: Migrate to Railway PostgreSQL (Advanced)

For production applications with heavy usage, consider migrating to PostgreSQL:

### Steps:
1. **Add PostgreSQL Service** in Railway Dashboard
2. **Update Database Code** to use PostgreSQL instead of SQLite
3. **Use Connection String** from Railway PostgreSQL service

### Migration Script Example:
```javascript
// For future PostgreSQL migration
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

## Deployment Commands

### Method 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Connect repository in Railway Dashboard
3. Railway auto-deploys on commits

### Method 2: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link [project-id]
railway up
```

### Method 3: Direct Deploy
```bash
# From project directory
railway deploy
```

## Environment Variables Summary

### Required Variables:
```bash
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key-here
PORT=8000
```

### Optional Variables:
```bash
DATABASE_PATH=/app/data/database.db  # For volume-based storage
```

## Database Features Included

Your SQLite database includes:
- **Users table**: Authentication system
- **Komoditas table**: Device inventory management
- **Peminjaman table**: Loan tracking with partial returns
- **Auto-initialization**: Tables created on first run
- **Sample data**: Default admin user (username: admin, password: admin123)

## Monitoring and Logs

### View Logs:
```bash
# Via CLI
railway logs

# Via Dashboard
# Go to your project > Deployments > View Logs
```

### Database Size Monitoring:
Railway provides storage usage metrics in the dashboard.

## Troubleshooting

### Common Issues:

1. **Database Not Found**:
   - Check `DATABASE_PATH` environment variable
   - Verify volume mount path
   - Check Railway logs for permission errors

2. **Database Locked**:
   - SQLite doesn't support high concurrency
   - Consider upgrading to PostgreSQL for production

3. **Data Loss**:
   - Ensure volumes are properly configured
   - Check that `mountPath` matches `DATABASE_PATH`

4. **Permission Errors**:
   - Railway automatically handles file permissions
   - Check logs for specific error messages

### Database Backup:
```bash
# Via Railway CLI (if you have access)
railway run sqlite3 /app/data/database.db ".backup backup.db"
```

## File Structure

```
device-loan-app/
├── server.js              # Main server with SQLite config
├── railway.json           # Railway deployment config with volumes
├── Procfile               # Process configuration
├── package.json           # Dependencies
└── data/                  # Volume mount point (Railway)
    └── database.db        # SQLite database file
```

## Performance Considerations

### SQLite Limitations:
- **Concurrent writes**: Limited to one writer at a time
- **File size**: Good for databases up to several GB
- **Network**: Not suitable for distributed systems

### When to Upgrade:
- More than 100 concurrent users
- Database size > 1GB
- Need for advanced features (full-text search, etc.)
- High write throughput requirements

## Success Indicators

After deployment, check:
- ✅ Application starts without errors
- ✅ Database tables are created
- ✅ Default admin user exists
- ✅ Login functionality works
- ✅ CRUD operations work
- ✅ Data persists after restart

Your SQLite database is now ready for Railway deployment with persistent storage! 🚀