import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';

// Import routes
import videoRoutes from './routes/videos';
import userRoutes from './routes/users';
import shareRoutes from './routes/shares';

// Import utilities
import { startCleanupJob } from './utils/videoProcessor';

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Manual CORS headers (as backup/primary CORS solution)
app.use((req, res, next) => {
    // Set CORS headers manually
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Accept, X-Requested-With"
    );
    res.header("Access-Control-Max-Age", "86400"); // 24 hours

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    next();
});

// CORS configuration (keeping as secondary layer)
const getAllowedOrigins = (): (string | RegExp)[] => {
    const origins: (string | RegExp)[] = [
        "http://localhost:5173", // Development
        "https://screenforge.vercel.app", // Main production domain
        "https://screenforge-git-main-nurenijamiu.vercel.app", // Git branch deployment
    ];

    // Add environment-specific origin if provided
    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }

    // In production, allow Vercel preview deployments
    if (process.env.NODE_ENV === "production") {
        origins.push("https://screenforge.vercel.app");
        origins.push("https://screenforge.*.vercel.app");
        origins.push("https://screenforge.nurenijamiu.tech");
    }

    console.log("Allowed CORS origins:", origins);
    return origins;
};

app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = getAllowedOrigins();

            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(
                    `CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(
                        ", "
                    )}`
                );
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
        ],
        exposedHeaders: ["Content-Range", "X-Content-Range"],
    })
);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploaded videos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/videos', videoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shares', shareRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large' });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// For Vercel deployment, export the app
export default app;

// Only start server in development or when not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️  Cloudinary not configured - video uploads may fail');
      console.log('   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
    } else {
      console.log('☁️  Cloudinary configured for video storage');
    }

    // Start background cleanup job
    startCleanupJob();
    console.log('🧹 Background cleanup job started');
  });

  // Graceful shutdown for local development
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });
}
