import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. GET SETTINGS
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    let settings = await prisma.settings.findUnique({
      where: { userId }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId,
          darkMode: false,
          language: 'en',
        }
      });
    }

    res.status(200).json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error fetching settings.' });
  }
});

// 2. UPDATE SETTINGS
router.put('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { darkMode, language, privacySettings, notificationSettings } = req.body;

    const settings = await prisma.settings.update({
      where: { userId },
      data: {
        darkMode: darkMode !== undefined ? !!darkMode : undefined,
        language,
        privacySettings,
        notificationSettings
      }
    });

    res.status(200).json({
      message: 'Settings updated successfully.',
      settings
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error updating settings.' });
  }
});

// 3. CHANGE PASSWORD
router.post('/change-password', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error updating password.' });
  }
});

// 4. EXPORT ALL USER DATA (JSON)
router.post('/export', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const fullUserData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        healthLogs: {
          include: {
            sleep: true, stress: true, mood: true, water: true, food: true,
            exercise: true, steps: true, heartRate: true, bloodPressure: true,
            bloodSugar: true, medication: true, symptom: true, healthScore: true
          }
        },
        notifications: true,
        emails: true
      }
    });

    if (!fullUserData) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Omit password hash for security
    const { password, ...safeData } = fullUserData;

    res.status(200).json(safeData);
  } catch (error: any) {
    console.error('Export user data error:', error);
    res.status(500).json({ error: 'Internal server error exporting user data.' });
  }
});

// 5. DELETE ACCOUNT
router.delete('/delete-account', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({ message: 'Account deleted successfully. All data has been purged.' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error deleting account.' });
  }
});

export default router;
