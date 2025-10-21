import { Router } from 'express';
import { creatureController } from '../controllers/creatureController';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { chatLimiter } from '../middleware/rateLimiter';

const router = Router();

// Test endpoint without authentication
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Creature API is working!',
    timestamp: new Date().toISOString()
  });
});

// All other routes require authentication
router.use(authenticateToken);

// Creature state and management
router.get('/state', creatureController.getCreatureState);
router.get('/stats', creatureController.getCreatureStats);

// Task management
router.post('/submit-task',
  validate(schemas.taskSubmission),
  creatureController.submitTask
);

router.get('/tasks',
  validate(schemas.pagination),
  creatureController.getTaskHistory
);

// Chat with creature
router.post('/chat',
  chatLimiter,
  validate(schemas.chatMessage),
  creatureController.chatWithCreature
);

router.get('/conversations',
  validate(schemas.pagination),
  creatureController.getConversationHistory
);

// Daily challenges
router.get('/daily-challenge', creatureController.generateDailyChallenge);

// Personality and visual traits
router.get('/personality', creatureController.getPersonalityProfile);
router.get('/visual-traits', creatureController.getVisualTraits);
router.get('/chat-memories', creatureController.getChatMemories);

export default router;
