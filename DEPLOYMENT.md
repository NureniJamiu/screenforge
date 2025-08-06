# Environment Variables for Vercel Deployment

## Frontend Environment Variables
- `VITE_API_URL` - Backend API URL (e.g., https://your-backend.vercel.app)
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key for authentication

## Backend Environment Variables  
- `DATABASE_URL` - PostgreSQL database connection string
- `CLERK_SECRET_KEY` - Clerk secret key for authentication
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `NODE_ENV` - Set to "production"
- `FRONTEND_URL` - Frontend URL for CORS (e.g., https://your-frontend.vercel.app)
- `CORS_ORIGIN` - Same as FRONTEND_URL
- `PORT` - Port number (Vercel will set this automatically)

## Deployment Notes

### Frontend Deployment
- Deploy the root directory as a static site
- Vercel will automatically detect the Vite framework
- Build command: `npm run build:frontend`
- Output directory: `frontend/dist`

### Backend Deployment  
- Deploy the `backend` directory separately as a serverless function
- Ensure DATABASE_URL points to a PostgreSQL database (recommend PlanetScale or Supabase)
- Prisma will automatically generate the client during deployment

### Monorepo Alternative
- Deploy frontend and backend as separate Vercel projects
- Update API URLs in frontend to point to backend deployment
- This approach provides better isolation and scaling

## Required External Services
1. **Database**: PostgreSQL (PlanetScale, Supabase, or similar)
2. **Authentication**: Clerk account and application setup
3. **File Storage**: Cloudinary account for media uploads (optional, can use local storage)