# ScreenForge Backend

Node.js + Express backend API for the ScreenForge screen recording application with Cloudinary cloud storage integration.

## Technologies Used

- **Node.js** with Express and TypeScript
- **PostgreSQL** database
- **Prisma** ORM
- **Clerk** for authentication middleware
- **Cloudinary** for video storage and delivery
- **Multer** for file uploads

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Open Prisma Studio
npm run prisma:studio
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/screenforge"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=500MB

# Cloudinary Configuration (Required)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Cloudinary Setup

1. **Create Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Get Credentials**: Copy Cloud Name, API Key, and API Secret from your dashboard
3. **Configure Environment**: Add credentials to your `.env` file

Videos are automatically uploaded to Cloudinary with:
- Global CDN delivery
- Automatic optimization
- Secure URLs
- Backup and redundancy

## Project Structure

```
src/
├── controllers/       # Request handlers
├── middleware/        # Express middleware
├── routes/           # API route definitions
├── utils/            # Utility functions
│   └── cloudinary.ts # Cloudinary configuration
└── index.ts          # Application entry point

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations

temp/                 # Temporary files for processing
```

## API Endpoints

### Videos
- `GET /api/videos` - List user's videos
- `POST /api/videos/upload` - Upload new video (to Cloudinary)
- `GET /api/videos/:id` - Get video details
- `PUT /api/videos/:id` - Update video metadata
- `DELETE /api/videos/:id` - Delete video (removes from Cloudinary)

### Chunked Upload (for large files)
- `POST /api/videos/upload/init` - Initialize chunked upload
- `POST /api/videos/upload/chunk` - Upload video chunk
- `POST /api/videos/upload/finalize` - Finalize chunked upload (uploads to Cloudinary)
- `DELETE /api/videos/upload/cleanup` - Cleanup failed upload

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Shares
- `GET /api/shares/video/:shareToken` - Get shared video (public access)
- `POST /api/shares/:videoId` - Create share link
- `GET /api/shares/:videoId/shares` - Get video shares

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts and profiles
- **Video** - Video metadata with Cloudinary storage info
- **VideoShare** - Video sharing links and permissions
- **EditingSession** - Video editing sessions

## Storage Migration

The system supports both local and Cloudinary storage:
- New uploads automatically use Cloudinary (`storageProvider: 'CLOUDINARY'`)
- Existing local files continue to work (`storageProvider: 'LOCAL'`)
- Cloudinary provides better performance, scalability, and reliability
