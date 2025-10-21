import { Router } from 'express';
import authRoutes from './auth';
import creatureRoutes from './creature';
import tokenRoutes from './token';
import evolutionRoutes from './evolution';
import adminRoutes from './admin';
import lovableRoutes from './lovable';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'QUIB Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple tasks endpoint for Lovable (no auth needed for now)
router.get('/tasks', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'task-1',
        title: 'Daily Chat',
        description: 'Chat with your Quib today!',
        type: 'DAILY_CHALLENGE',
        completed: false,
        xp: 50
      },
      {
        id: 'task-2',
        title: 'Feed Your Quib',
        description: 'Give your Quib some love and attention',
        type: 'CARE',
        completed: true,
        xp: 25
      },
      {
        id: 'task-3',
        title: 'Explore Together',
        description: 'Take your Quib on an adventure',
        type: 'ADVENTURE',
        completed: false,
        xp: 75
      }
    ]
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/creature', creatureRoutes);
router.use('/token', tokenRoutes);
router.use('/evolution', evolutionRoutes);
router.use('/admin', adminRoutes);
router.use('/lovable', lovableRoutes);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

export default router;
