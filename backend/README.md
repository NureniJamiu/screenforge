# ScreenForge Backend

Node.js + Express backend API for the ScreenForge screen recording application.

## Technologies Used

- **Node.js** with Express and TypeScript
- **PostgreSQL** database
- **Prisma** ORM
- **Clerk** for authentication middleware
- **JWT** for token validation
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
DATABASE_URL="postgresql://username:password@localhost:5432/screenforge"
CLERK_SECRET_KEY=your_clerk_secret_key_here
JWT_SECRET=your_jwt_secret_here
PORT=3001
UPLOAD_DIR=./uploads
```

## Project Structure

```
src/
├── controllers/       # Request handlers
├── middleware/        # Express middleware
├── routes/           # API route definitions
├── utils/            # Utility functions
└── index.ts          # Application entry point

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations

uploads/              # File upload directory
```

## API Endpoints

### Authentication
- `POST /api/auth/webhook` - Clerk webhook handler

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Videos
- `GET /api/videos` - List user's videos
- `POST /api/videos` - Upload new video
- `GET /api/videos/:id` - Get video details
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Shares
- `POST /api/videos/:id/shares` - Create share link
- `GET /api/shares/:token` - Access shared video

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts and profiles
- **Video** - Video metadata and storage info
- **Share** - Video sharing links and permissions
