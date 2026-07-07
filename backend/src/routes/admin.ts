import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, authorizeAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. GET ALL USERS (Admin Only)
router.get('/users', authenticateJWT, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        gender: true,
        createdAt: true,
        _count: {
          select: { healthLogs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(users);
  } catch (error: any) {
    console.error('Admin fetch users error:', error);
    res.status(500).json({ error: 'Internal server error fetching user lists.' });
  }
});

// 2. GET ALL DAILY HEALTH LOGS (Admin Only)
router.get('/reports', authenticateJWT, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.dailyHealth.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        healthScore: true,
        sleep: true,
        steps: true
      },
      orderBy: { date: 'desc' }
    });

    res.status(200).json(logs);
  } catch (error: any) {
    console.error('Admin fetch reports error:', error);
    res.status(500).json({ error: 'Internal server error fetching logs.' });
  }
});

// 3. SEND NOTIFICATION (Admin Only)
router.post('/notify', authenticateJWT, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Notification title and message are required.' });
    }

    if (userId) {
      // Send to specific user
      const notification = await prisma.notifications.create({
        data: {
          userId,
          title,
          message,
          type: type || 'info'
        }
      });
      return res.status(201).json({ message: 'Notification sent successfully.', data: notification });
    } else {
      // Broadcast to all users
      const users = await prisma.user.findMany({ select: { id: true } });
      const notificationsData = users.map(user => ({
        userId: user.id,
        title,
        message,
        type: type || 'info'
      }));

      await prisma.notifications.createMany({
        data: notificationsData
      });

      return res.status(201).json({ message: `Broadcast sent to ${users.length} users.` });
    }
  } catch (error: any) {
    console.error('Admin send notification error:', error);
    res.status(500).json({ error: 'Internal server error sending notifications.' });
  }
});

// 4. GET SYSTEM STATS (Admin Only)
router.get('/stats', authenticateJWT, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const logCount = await prisma.dailyHealth.count();
    const emailCount = await prisma.emailHistory.count({ where: { status: 'success' } });

    // Calculate average health score
    const scores = await prisma.healthScore.findMany({ select: { score: true } });
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0;

    res.status(200).json({
      totalUsers: userCount,
      totalLogs: logCount,
      totalEmailsSent: emailCount,
      averageHealthScore: avgScore
    });
  } catch (error: any) {
    console.error('Admin fetch stats error:', error);
    res.status(500).json({ error: 'Internal server error fetching system stats.' });
  }
});

// 5. TOGGLE ROLE / DELETE USER (Admin Only)
router.put('/users/:id/role', authenticateJWT, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body;

    if (role !== 'USER' && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Invalid role type.' });
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(200).json({ message: 'User role updated successfully.', user: updated });
  } catch (error: any) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Internal server error updating role.' });
  }
});

export default router;
