import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateToken, requireDevWallet } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All admin routes require authentication and dev wallet
router.use(authenticateToken);
router.use(requireDevWallet);

// Personality management
router.get('/personality-profile', adminController.getPersonalityProfile);
router.post('/reset-personality', 
  validate(Joi.object({
    userId: Joi.string().optional()
  })),
  adminController.resetPersonality
);
router.post('/force-reflection',
  validate(Joi.object({
    userId: Joi.string().optional()
  })),
  adminController.forcePersonalityReflection
);

// Mood simulation
router.get('/simulate-mood', adminController.simulateMoodChange);

// Visual traits
router.post('/generate-visual-traits',
  validate(Joi.object({
    userId: Joi.string().optional()
  })),
  adminController.generateNewVisualTraits
);

// Chat memories
router.get('/chat-memories', adminController.getAllChatMemories);

// Analytics
router.get('/engagement-analytics', adminController.getEngagementAnalytics);

// System stats
router.get('/system-stats', adminController.getSystemStats);

export default router;
