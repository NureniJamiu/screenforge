import express from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../index';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// Get all videos for authenticated user
router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: req.userEmail || '',
          firstName: req.userFirstName,
          lastName: req.userLastName,
        }
      });
    }

    const videos = await prisma.video.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            shares: true,
            editingSessions: true
          }
        }
      }
    });

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Upload new video
router.post('/upload', requireAuth(), upload.single('video'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const userId = req.userId!;
    const { title, description, recordingType = 'DESKTOP', isDownloadable = true } = req.body;

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: req.userEmail || '',
          firstName: req.userFirstName,
          lastName: req.userLastName,
        }
      });
    }

    // Create video record
    const video = await prisma.video.create({
      data: {
        title: title || `Recording ${new Date().toLocaleDateString()}`,
        description,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        videoUrl: `/uploads/${req.file.filename}`,
        recordingType,
        isDownloadable: isDownloadable === 'true',
        userId: user.id,
        shareToken: uuidv4()
      }
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Get single video
router.get('/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        editingSessions: {
          orderBy: { createdAt: 'desc' }
        },
        shares: {
          orderBy: { sharedAt: 'desc' }
        }
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Update video metadata
router.put('/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { title, description, isDownloadable, isPublic } = req.body;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        isDownloadable,
        isPublic
      }
    });

    res.json(updatedVideo);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video
router.delete('/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads', video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database (cascade will handle relations)
    await prisma.video.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;
