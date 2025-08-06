# Deployment Environment Variables Setup

This document explains how to properly configure environment variables for ScreenForge in production.

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use environment variables for all sensitive configuration**
3. **Set different values for development, staging, and production**

## Frontend Environment Variables

Set these in your deployment platform (e.g., Vercel, Netlify):

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_clerk_publishable_key

# Backend API URL
VITE_API_URL=https://your-backend-domain.com/api

# Optional: Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Backend Environment Variables

Set these in your backend deployment platform:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_live_your_production_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_production_clerk_secret_key

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com

# Cloudinary (for video storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional
NODE_ENV=production
PORT=3001
MAX_FILE_SIZE=500MB
```

## Platform-Specific Setup

### Vercel

1. Go to your project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with appropriate values
4. Set the environment (Production, Preview, Development)

### Netlify

1. Go to Site Settings > Environment Variables
2. Add each variable with appropriate values

### Railway/Render

1. Go to your service settings
2. Add environment variables in the Variables section

## Smart Fallback Strategy

The application includes smart fallbacks:

- **Development**: Uses `localhost:3001` automatically
- **Production without VITE_API_URL**: Uses relative `/api` path (requires same-domain deployment)
- **Production with VITE_API_URL**: Uses the specified backend URL

## CORS Configuration

The backend automatically allows:

- `localhost:5173` (development)
- Any Vercel preview deployment (`*.vercel.app`)
- The URL specified in `FRONTEND_URL` environment variable

This ensures both development and production work without hardcoded URLs.
