import express, { Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import healthRouter from './routes/health';
import profileRouter from './routes/profile';
import settingsRouter from './routes/settings';
import notificationsRouter from './routes/notifications';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Next.js frontend
app.use(cors({
  origin: '*', // For local development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Bind API routers
app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);
app.use('/api/profile', profileRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(` Daily Health Monitor backend running on http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
