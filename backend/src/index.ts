import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { PrismaClient } from "@prisma/client";

// Import routes
import videoRoutes from "./routes/videos";
import userRoutes from "./routes/users";
import shareRoutes from "./routes/shares";

// Import utilities
import { startCleanupJob } from "./utils/videoProcessor";

// Load environment variables
dotenv.config();

// Initialize Prisma with lazy loading for serverless environments
let prisma: PrismaClient;

const getPrismaClient = () => {
    if (!prisma) {
        try {
            prisma = new PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            });

            // Test the connection
            prisma.$connect()
                .then(() => console.log('✅ Prisma connected successfully'))
                .catch((error) => console.error('❌ Prisma connection failed:', error));

        } catch (error) {
            console.error('❌ Failed to initialize Prisma client:', error);
            throw error;
        }
    }
    return prisma;
};

// Export for use in other modules
export const getPrisma = getPrismaClient;

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration (keeping as secondary layer)
const getAllowedOrigins = () => {
    const origins = [];

    // Add environment-specific origin if provided
    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }

    // Add environment-specific frontend URL
    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }

    // In production, allow Vercel preview deployments
    if (process.env.NODE_ENV === "production") {
        origins.push("https://screenforge.vercel.app");
        origins.push("https://screenforge.*.vercel.app");
        origins.push("https://screenforge.nurenijamiu.tech");
    } else {
        // Development origins
        origins.push("http://localhost:5173");
        origins.push("http://localhost:3000");
        origins.push("http://127.0.0.1:5173");
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
        maxAge: 86400,
    })
);

// Compression
// app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Handle preflight requests explicitly
app.options("*", (req, res) => {
    const allowedOrigins = getAllowedOrigins();
    const origin = req.headers.origin;

    if (!origin || allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin || "*");
        res.header(
            "Access-Control-Allow-Methods",
            "GET,PUT,POST,DELETE,OPTIONS"
        );
        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, Content-Length, X-Requested-With, Accept, Origin"
        );
        res.header("Access-Control-Allow-Credentials", "true");
        res.sendStatus(200);
    } else {
        res.sendStatus(403);
    }
});

// Serve static files (uploaded videos) - only in non-serverless environments
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}

// API routes
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shares", shareRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Screenforge API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        vercel: !!process.env.VERCEL,
    });
});

// Simple health check that doesn't require database
app.get("/api/health/simple", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Basic health check passed",
        timestamp: new Date().toISOString(),
    });
});

// Detailed health check with database connectivity test
app.get("/api/health/detailed", async (req, res) => {
    try {
        const prisma = getPrismaClient();
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            status: "OK",
            message: "Detailed health check passed",
            timestamp: new Date().toISOString(),
            database: "Connected",
            environment: process.env.NODE_ENV || 'development',
            vercel: !!process.env.VERCEL,
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: "ERROR",
            message: "Health check failed",
            timestamp: new Date().toISOString(),
            database: "Disconnected",
            error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Database connection failed',
        });
    }
});

// Environment variable check (for debugging)
app.get("/api/debug/env", (req, res) => {
    const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT_SET',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT_SET',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT_SET',
        FRONTEND_URL: process.env.FRONTEND_URL,
    };

    res.status(200).json({
        message: "Environment variables check",
        timestamp: new Date().toISOString(),
        environment: envVars,
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(
    (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error("Error:", err);

        if (err.type === "entity.too.large") {
            return res.status(413).json({ error: "File too large" });
        }

        res.status(500).json({
            error: "Internal server error",
            message:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : "Something went wrong",
        });
    }
);

// Only start server in development or when not in Vercel environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);

        // Check Cloudinary configuration
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            console.warn(
                "⚠️  Cloudinary not configured - video uploads may fail"
            );
            console.log(
                "   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
            );
        } else {
            console.log("☁️  Cloudinary configured for video storage");
        }

        // Start background cleanup job only in non-serverless environments
        try {
            startCleanupJob();
            console.log("🧹 Background cleanup job started");
        } catch (error) {
            console.warn("⚠️  Could not start cleanup job:", error);
        }
    });

    // Graceful shutdown for local development
    process.on("SIGINT", async () => {
        console.log("Shutting down gracefully...");
        const client = getPrismaClient();
        await client.$disconnect();
        process.exit(0);
    });
}

// For Vercel deployment, export the app
export default app;
