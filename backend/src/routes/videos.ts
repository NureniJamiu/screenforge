import express from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getPrisma } from '../index';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
    uploadVideoToCloudinary,
    deleteVideoFromCloudinary,
} from "../utils/cloudinary";

const router = express.Router();

// In-memory storage for upload sessions (in production, use Redis or database)
interface UploadSession {
    metadata: any;
    totalChunks: number;
    uploadedChunks: number[];
    userId: string;
}

const uploadSessions: Map<string, UploadSession> = new Map();

// Configure multer for file uploads - using memory storage for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log("File upload attempt:", {
            originalname: file.originalname,
            mimetype: file.mimetype,
            fieldname: file.fieldname,
        });

        // Accept video files and webm files specifically
        if (
            file.mimetype.startsWith("video/") ||
            file.mimetype === "application/octet-stream" ||
            file.originalname.endsWith(".webm") ||
            file.originalname.endsWith(".mp4")
        ) {
            cb(null, true);
        } else {
            console.error("Rejected file with mimetype:", file.mimetype);
            cb(new Error("Only video files are allowed!"));
        }
    },
});

// Get all videos for authenticated user
router.get("/", requireAuth(), async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.userId!;

        // Get or create user
        let user = await getPrisma().user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            user = await getPrisma().user.create({
                data: {
                    clerkId: userId,
                    email: req.userEmail || "",
                    firstName: req.userFirstName,
                    lastName: req.userLastName,
                },
            });
        }

        const videos = await getPrisma().video.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        shares: true,
                        editingSessions: true,
                    },
                },
            },
        });

        res.json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

// Upload new video
router.post(
    "/upload",
    requireAuth(),
    upload.single("video"),
    async (req: AuthenticatedRequest, res) => {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({ error: "No video file provided" });
            }

            const userId = req.userId!;
            const {
                title,
                description,
                recordingType = "DESKTOP",
                duration,
                isDownloadable = true,
            } = req.body;

            // Get or create user
            let user = await getPrisma().user.findUnique({
                where: { clerkId: userId },
            });

            if (!user) {
                user = await getPrisma().user.create({
                    data: {
                        clerkId: userId,
                        email: req.userEmail || "",
                        firstName: req.userFirstName,
                        lastName: req.userLastName,
                    },
                });
            }

            // Generate unique public ID for Cloudinary
            const publicId = `${user.id}/${uuidv4()}-${Date.now()}`;

            // Upload to Cloudinary
            let cloudinaryResult;
            try {
                // Upload directly from buffer - no file system operations needed
                cloudinaryResult = await uploadVideoToCloudinary(req.file.buffer, {
                    public_id: publicId,
                    folder: "screenforge/videos",
                    resource_type: "video",
                    quality: "auto",
                });
            } catch (cloudinaryError) {
                console.error("Cloudinary upload failed:", cloudinaryError);
                return res
                    .status(500)
                    .json({ error: "Failed to upload video to cloud storage" });
            }

            // Create video record with Cloudinary data
            const video = await getPrisma().video.create({
                data: {
                    title:
                        title || `Recording ${new Date().toLocaleDateString()}`,
                    description,
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                    duration: duration
                        ? parseFloat(duration)
                        : cloudinaryResult.duration || null,
                    videoUrl: cloudinaryResult.secure_url,
                    cloudinaryPublicId: cloudinaryResult.public_id,
                    cloudinaryUrl: cloudinaryResult.secure_url,
                    storageProvider: "CLOUDINARY",
                    recordingType: recordingType as any,
                    isDownloadable: isDownloadable === "true",
                    userId: user.id,
                    shareToken: uuidv4(),
                },
            });

            res.status(201).json(video);
        } catch (error) {
            console.error("Error uploading video:", error);
            res.status(500).json({ error: "Failed to upload video" });
        }
    }
);

// Get single video
router.get("/:id", requireAuth(), async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        const user = await getPrisma().user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const video = await getPrisma().video.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                editingSessions: {
                    orderBy: { createdAt: "desc" },
                },
                shares: {
                    orderBy: { sharedAt: "desc" },
                },
            },
        });

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        res.json(video);
    } catch (error) {
        console.error("Error fetching video:", error);
        res.status(500).json({ error: "Failed to fetch video" });
    }
});

// Update video metadata
router.put("/:id", requireAuth(), async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.userId!;
        const { id } = req.params;
        const { title, description, isDownloadable, isPublic } = req.body;

        const user = await getPrisma().user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const video = await getPrisma().video.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        const updatedVideo = await getPrisma().video.update({
            where: { id },
            data: {
                title,
                description,
                isDownloadable,
                isPublic,
            },
        });

        res.json(updatedVideo);
    } catch (error) {
        console.error("Error updating video:", error);
        res.status(500).json({ error: "Failed to update video" });
    }
});

// Delete video
router.delete("/:id", requireAuth(), async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        const user = await getPrisma().user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const video = await getPrisma().video.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        // Delete from cloud storage based on storage provider
        if (
            video.storageProvider === "CLOUDINARY" &&
            video.cloudinaryPublicId
        ) {
            try {
                await deleteVideoFromCloudinary(video.cloudinaryPublicId);
            } catch (cloudinaryError) {
                console.error(
                    "Failed to delete from Cloudinary:",
                    cloudinaryError
                );
                // Continue with database deletion even if cloud deletion fails
            }
        }

        // Delete from database (cascade will handle relations)
        await getPrisma().video.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ error: "Failed to delete video" });
    }
});

// Generate share token for video
router.post(
    "/:id/share",
    requireAuth(),
    async (req: AuthenticatedRequest, res) => {
        try {
            const userId = req.userId!;
            const { id } = req.params;

            const user = await getPrisma().user.findUnique({
                where: { clerkId: userId },
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const video = await getPrisma().video.findFirst({
                where: {
                    id,
                    userId: user.id,
                },
            });

            if (!video) {
                return res.status(404).json({ error: "Video not found" });
            }

            // Generate new share token if one doesn't exist
            let shareToken = video.shareToken;
            if (!shareToken) {
                shareToken = uuidv4();

                const updatedVideo = await getPrisma().video.update({
                    where: { id },
                    data: { shareToken },
                });

                return res.json(updatedVideo);
            }

            // Return existing video if it already has a share token
            res.json(video);
        } catch (error) {
            console.error("Error generating share token:", error);
            res.status(500).json({ error: "Failed to generate share token" });
        }
    }
);

// Chunked upload support - DISABLED for serverless environments
// These operations require file system access which is not available in Vercel
// For production, consider using a different approach like direct streaming to Cloudinary

/*
const chunkStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(__dirname, "../../uploads/temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const { uploadId, chunkIndex } = req.body;
        cb(null, `${uploadId}_chunk_${chunkIndex}`);
    },
});

const chunkUpload = multer({
    storage: chunkStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per chunk
});

// Initialize chunked upload
router.post(
    "/upload/init",
    requireAuth(),
    async (req: AuthenticatedRequest, res) => {
        try {
            const { uploadId, metadata, totalChunks } = req.body;

            // Store upload session
            uploadSessions.set(uploadId, {
                metadata,
                totalChunks,
                uploadedChunks: [],
                userId: req.userId!,
            });

            res.json({ success: true, uploadId });
        } catch (error) {
            console.error("Error initializing chunked upload:", error);
            res.status(500).json({ error: "Failed to initialize upload" });
        }
    }
);

// Upload chunk
router.post(
    "/upload/chunk",
    requireAuth(),
    chunkUpload.single("chunk"),
    async (req: AuthenticatedRequest, res) => {
        try {
            const { uploadId, chunkIndex } = req.body;

            if (!req.file) {
                return res.status(400).json({ error: "No chunk provided" });
            }

            // Track uploaded chunk
            const session = uploadSessions.get(uploadId);

            if (!session || session.userId !== req.userId) {
                return res
                    .status(404)
                    .json({ error: "Upload session not found" });
            }

            session.uploadedChunks.push(parseInt(chunkIndex));

            res.json({
                success: true,
                uploadedChunks: session.uploadedChunks.length,
                totalChunks: session.totalChunks,
            });
        } catch (error) {
            console.error("Error uploading chunk:", error);
            res.status(500).json({ error: "Failed to upload chunk" });
        }
    }
);

// Finalize chunked upload
router.post(
    "/upload/finalize",
    requireAuth(),
    async (req: AuthenticatedRequest, res) => {
        try {
            const { uploadId } = req.body;
            const userId = req.userId!;

            const session = uploadSessions.get(uploadId);

            if (!session || session.userId !== userId) {
                return res
                    .status(404)
                    .json({ error: "Upload session not found" });
            }

            // Verify all chunks are uploaded
            if (session.uploadedChunks.length !== session.totalChunks) {
                return res.status(400).json({
                    error: "Missing chunks",
                    uploaded: session.uploadedChunks.length,
                    total: session.totalChunks,
                });
            }

            // Combine chunks into a temporary file
            const tempDir = path.join(__dirname, "../../uploads/temp");
            const tempFinalPath = path.join(tempDir, `${uploadId}_final.webm`);

            const writeStream = fs.createWriteStream(tempFinalPath);

            for (let i = 0; i < session.totalChunks; i++) {
                const chunkPath = path.join(tempDir, `${uploadId}_chunk_${i}`);
                if (fs.existsSync(chunkPath)) {
                    const chunkData = fs.readFileSync(chunkPath);
                    writeStream.write(chunkData);
                    fs.unlinkSync(chunkPath); // Clean up chunk
                }
            }

            writeStream.end();

            // Get file stats
            const stats = fs.statSync(tempFinalPath);

            // Get or create user
            let user = await getPrisma().user.findUnique({
                where: { clerkId: userId },
            });

            if (!user) {
                user = await getPrisma().user.create({
                    data: {
                        clerkId: userId,
                        email: req.userEmail || "",
                        firstName: req.userFirstName,
                        lastName: req.userLastName,
                    },
                });
            }

            // Generate unique public ID for Cloudinary
            const publicId = `${user.id}/${uuidv4()}-${Date.now()}`;

            // Upload combined file to Cloudinary
            let cloudinaryResult;
            try {
                cloudinaryResult = await uploadVideoToCloudinary(
                    tempFinalPath,
                    {
                        public_id: publicId,
                        folder: "screenforge/videos",
                        resource_type: "video",
                        quality: "auto",
                    }
                );

                // Clean up temporary file
                fs.unlinkSync(tempFinalPath);
            } catch (cloudinaryError) {
                console.error("Cloudinary upload failed:", cloudinaryError);
                // Clean up temporary file
                if (fs.existsSync(tempFinalPath)) {
                    fs.unlinkSync(tempFinalPath);
                }
                return res
                    .status(500)
                    .json({ error: "Failed to upload video to cloud storage" });
            }

            // Create video record with Cloudinary data
            const video = await getPrisma().video.create({
                data: {
                    title:
                        session.metadata.title ||
                        `Recording ${new Date().toLocaleDateString()}`,
                    description: session.metadata.description,
                    originalName: `recording-${Date.now()}.webm`,
                    mimeType: "video/webm",
                    size: stats.size,
                    duration: session.metadata.duration
                        ? parseFloat(session.metadata.duration)
                        : cloudinaryResult.duration || null,
                    videoUrl: cloudinaryResult.secure_url,
                    cloudinaryPublicId: cloudinaryResult.public_id,
                    cloudinaryUrl: cloudinaryResult.secure_url,
                    storageProvider: "CLOUDINARY",
                    recordingType: session.metadata.recordingType as any,
                    isDownloadable: session.metadata.isDownloadable !== false,
                    userId: user.id,
                    shareToken: uuidv4(),
                },
            });

            // Clean up session
            uploadSessions.delete(uploadId);

            res.json(video);
        } catch (error) {
            console.error("Error finalizing upload:", error);
            res.status(500).json({ error: "Failed to finalize upload" });
        }
    }
);

// Cleanup failed upload
router.delete('/upload/cleanup', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const { uploadId } = req.body;

    // Clean up chunks
    const tempDir = path.join(__dirname, '../../uploads/temp');
    const files = fs.readdirSync(tempDir);

    files.forEach(file => {
      if (file.startsWith(`${uploadId}_chunk_`)) {
        fs.unlinkSync(path.join(tempDir, file));
      }
    });

    // Clean up session
    uploadSessions.delete(uploadId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error cleaning up upload:', error);
    res.status(500).json({ error: 'Failed to cleanup upload' });
  }
});
*/

// Note: Chunked upload functionality has been disabled for serverless deployment
// as it requires file system operations that are not available in Vercel.
// For production use, consider implementing streaming uploads directly to Cloudinary
// or using a different approach that doesn't require local file storage.

export default router;
