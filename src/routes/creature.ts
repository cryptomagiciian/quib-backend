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

// Simple chat endpoint for Lovable (no auth needed for now)
router.post('/chat', (req, res) => {
  const { message } = req.body;
  
  // Simple AI response
  const responses = [
    "Hello! I'm your Quib! How are you today?",
    "That's interesting! Tell me more!",
    "I love chatting with you! What else is on your mind?",
    "You're amazing! I'm so happy to be your companion!",
    "Let's explore the world together! What should we do next?"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    success: true,
    data: {
      conversation: {
        message,
        response: randomResponse,
        sentimentScore: 0.8,
        timestamp: new Date().toISOString()
      },
      creature: {
        moodScore: 85,
        xp: 100
      },
      keywords: []
    }
  });
});

// Simple creature endpoint for Lovable (no auth needed for now)
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      creature: {
        id: 'lovable-creature',
        currentStage: 'HATCHLING',
        moodScore: 85,
        xp: 100,
        canEvolve: false,
        personality: {
          energy: 'high',
          tone: 'playful',
          bondType: 'loyal guardian'
        },
        visualTraits: {
          hornType: 'curved',
          furColor: 'galactic blue',
          eyeStyle: 'starry swirl'
        }
      }
    }
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
