import express from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = express.Router();

// Get current user profile
router.get('/me', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        _count: {
          select: {
            videos: true
          }
        }
      }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: req.userEmail || '',
          firstName: req.userFirstName,
          lastName: req.userLastName,
        },
        include: {
          _count: {
            select: {
              videos: true
            }
          }
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/me', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { firstName, lastName } = req.body;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        firstName,
        lastName
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user statistics
router.get('/stats', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await prisma.video.aggregate({
      where: { userId: user.id },
      _count: {
        id: true
      },
      _sum: {
        size: true,
        viewCount: true,
        downloadCount: true
      }
    });

    const totalSize = stats._sum.size || 0;
    const totalViews = stats._sum.viewCount || 0;
    const totalDownloads = stats._sum.downloadCount || 0;
    const totalVideos = stats._count.id || 0;

    res.json({
      totalVideos,
      totalSize,
      totalViews,
      totalDownloads,
      averageFileSize: totalVideos > 0 ? Math.round(totalSize / totalVideos) : 0
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router;
