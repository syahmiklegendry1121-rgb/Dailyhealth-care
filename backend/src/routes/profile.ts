import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. GET PROFILE
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        medicalNotes: true,
        goals: true,
        emergencyContact: true,
        profilePic: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
});

// 2. UPDATE PROFILE
router.put('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      age,
      gender,
      height,
      weight,
      medicalNotes,
      goals,
      emergencyContact,
      profilePic
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age: age ? Number(age) : undefined,
        gender,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        medicalNotes,
        goals,
        emergencyContact,
        profilePic
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        medicalNotes: true,
        goals: true,
        emergencyContact: true,
        profilePic: true,
        role: true,
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error updating profile.' });
  }
});

export default router;
