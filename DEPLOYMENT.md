# Deployment Guide

This guide covers deploying the Device Loan Management System to Vercel (frontend) and Railway (backend).

## Backend Deployment (Railway)

### 1. Prepare Railway Deployment

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   ```

### 2. Deploy Backend

1. **Create New Project on Railway**:
   - Go to Railway dashboard
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Connect your GitHub repository

2. **Configure Environment Variables**:
   In Railway dashboard, go to your project > Variables and add:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=8000
   ```

3. **Database Setup**:
   - SQLite database file will be created automatically
   - The database will persist in Railway's storage

4. **Deploy**:
   - Railway will automatically detect Node.js project
   - It will run `npm install` and start with `node server.js`
   - Note down your Railway URL (e.g., `https://your-app-name.up.railway.app`)

### 3. Update Frontend Configuration

1. **Update .env.production**:
   ```
   REACT_APP_API_URL=https://your-railway-url.up.railway.app
   ```

## Frontend Deployment (Vercel)

### 1. Prepare Vercel Deployment

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

### 2. Deploy Frontend

1. **Deploy to Vercel**:
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will detect it's a React app
   - Click "Deploy"

2. **Configure Environment Variables** (if needed):
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add `REACT_APP_API_URL` if different from .env.production

3. **Custom Domain** (optional):
   - In Vercel dashboard, go to Project Settings > Domains
   - Add your custom domain: `laksana-dummy.vercel.app`

## Post-Deployment Steps

### 1. Update CORS Settings
Make sure your Railway backend URL is added to CORS origins in `server.js`.

### 2. Test the Application
1. Visit your Vercel URL
2. Test login functionality
3. Test all CRUD operations
4. Check browser console for any errors

### 3. SSL Certificate
Both Vercel and Railway provide automatic HTTPS certificates.

## Environment Variables Summary

### Backend (Railway)
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
PORT=8000
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-railway-url.up.railway.app
```

## Troubleshooting

### Common Issues:

1. **CORS Error**: 
   - Check CORS configuration in `server.js`
   - Ensure frontend domain is in allowed origins

2. **Database Issues**:
   - Railway SQLite databases persist automatically
   - Check Railway logs for database errors

3. **Cookie Issues**:
   - Ensure `secure: true` in production
   - Check `sameSite` settings for cross-origin requests

4. **Build Errors**:
   - Check all API_ENDPOINTS imports are correct
   - Ensure all TypeScript errors are resolved

### Monitoring:
- Railway provides logs and metrics
- Vercel provides analytics and error tracking
- Use browser developer tools to debug frontend issues

## File Structure for Deployment

```
device-loan-app/
├── public/           # React public files
├── src/             # React source code
├── server.js        # Backend server
├── database.db      # SQLite database (auto-created)
├── package.json     # Dependencies and scripts
├── vercel.json      # Vercel configuration
├── railway.json     # Railway configuration
├── Procfile         # Process configuration
├── .env.production  # Production environment variables
└── .env.development # Development environment variables
```