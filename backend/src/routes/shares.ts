import express from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getPrisma } from '../index';

const router = express.Router();

// Get shared video by token (public access)
router.get('/video/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    const video = await getPrisma().video.findUnique({
      where: { shareToken },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment view count
    await getPrisma().video.update({
      where: { id: video.id },
      data: { viewCount: { increment: 1 } }
    });

    // Return video info without sensitive data
    const { userId, ...videoData } = video;
    res.json(videoData);
  } catch (error) {
    console.error('Error fetching shared video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Create a new share for a video
router.post('/:videoId', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;
    const { shareType, platform, expiresAt } = req.body;

    const user = await getPrisma().user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const video = await getPrisma().video.findFirst({
      where: {
        id: videoId,
        userId: user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const share = await getPrisma().videoShare.create({
      data: {
        videoId,
        shareType,
        platform,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.status(201).json(share);
  } catch (error) {
    console.error('Error creating share:', error);
    res.status(500).json({ error: 'Failed to create share' });
  }
});

// Get all shares for a video
router.get('/:videoId/shares', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;

    const user = await getPrisma().user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const video = await getPrisma().video.findFirst({
      where: {
        id: videoId,
        userId: user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const shares = await getPrisma().videoShare.findMany({
      where: { videoId },
      orderBy: { sharedAt: 'desc' }
    });

    res.json(shares);
  } catch (error) {
    console.error('Error fetching shares:', error);
    res.status(500).json({ error: 'Failed to fetch shares' });
  }
});

// Track download
router.post('/download/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    const video = await getPrisma().video.findUnique({
      where: { shareToken }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (!video.isDownloadable) {
      return res.status(403).json({ error: 'Download not permitted for this video' });
    }

    // Increment download count
    await getPrisma().video.update({
      where: { id: video.id },
      data: { downloadCount: { increment: 1 } }
    });

    res.json({ message: 'Download tracked' });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ error: 'Failed to track download' });
  }
});

export default router;
