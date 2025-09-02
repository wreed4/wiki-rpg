# Railway Deployment Guide

This guide explains how to deploy the Wiki RPG application to Railway.

## Prerequisites

1. Railway account (https://railway.app)
2. GitHub repository with your code

## Deployment Steps

### 1. Deploy Backend

1. Create a new Railway project
2. Add PostgreSQL addon
3. Add Redis addon
4. Connect your GitHub repository
5. Set the root directory to `backend`
6. Add environment variables:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `GOOGLE_CLOUD_PROJECT` - (Optional) Your Google Cloud project ID
   - `FRONTEND_URL` - Will be set after frontend deployment

### 2. Deploy Frontend

1. Add a new service to the same Railway project
2. Connect the same GitHub repository
3. Set the root directory to `frontend`
4. Add environment variables:
   - `REACT_APP_API_URL` - Your backend Railway URL (e.g., `https://your-backend-12345.railway.app`)

### 3. Update CORS

After both services are deployed:
1. Go to your backend service settings
2. Add the `FRONTEND_URL` environment variable with your frontend Railway URL
3. Redeploy the backend service

## Environment Variables Summary

### Backend
- `DATABASE_URL` - Automatically provided by PostgreSQL addon
- `REDIS_URL` - Automatically provided by Redis addon
- `GEMINI_API_KEY` - Your Gemini API key
- `GOOGLE_CLOUD_PROJECT` - (Optional) Google Cloud project
- `FRONTEND_URL` - Frontend Railway URL for CORS

### Frontend
- `REACT_APP_API_URL` - Backend Railway URL

## Important Notes

### Frontend Production Build
The frontend now uses a production build served with `serve` instead of the development server. This provides:
- Better performance
- Proper static file serving
- Production optimizations

### Port Configuration
- Frontend: Uses Railway's `PORT` environment variable or defaults to 3000
- Backend: Uses `PORT` environment variable or defaults to 3001

## Troubleshooting

### 502 Bad Gateway
- Ensure frontend is listening on `0.0.0.0` (fixed in Dockerfile)
- Verify `REACT_APP_API_URL` points to correct backend URL
- Check backend service is running and accessible
- Frontend now serves production build instead of development server

### CORS Issues
- Ensure `FRONTEND_URL` is set in backend environment
- Verify URLs don't have trailing slashes

### Database Connection
- Railway PostgreSQL addon automatically provides `DATABASE_URL`
- No additional configuration needed