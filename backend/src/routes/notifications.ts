import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. GET ALL USER NOTIFICATIONS
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const notifications = await prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error fetching notifications.' });
  }
});

// 2. MARK AS READ
router.put('/:id/read', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const updated = await prisma.notifications.updateMany({
      where: {
        id: notificationId,
        userId // safety check
      },
      data: { read: true }
    });

    res.status(200).json({ message: 'Notification marked as read.', updatedCount: updated.count });
  } catch (error: any) {
    console.error('Error reading notification:', error);
    res.status(500).json({ error: 'Internal server error updating notification.' });
  }
});

// 3. MARK ALL AS READ
router.put('/read-all', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const updated = await prisma.notifications.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    res.status(200).json({ message: 'All notifications marked as read.', updatedCount: updated.count });
  } catch (error: any) {
    console.error('Error reading all notifications:', error);
    res.status(500).json({ error: 'Internal server error marking notifications as read.' });
  }
});

export default router;
