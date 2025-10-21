import { Router } from 'express';
import { creatureController } from '../controllers/creatureController';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { chatLimiter } from '../middleware/rateLimiter';
import { aiService } from '../services/aiService';
import logger from '../utils/logger';

const router = Router();

// Test endpoint without authentication
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Creature API is working!',
    timestamp: new Date().toISOString()
  });
});

// Advanced chat endpoint for Lovable (no auth needed for now)
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Use the advanced AI service
    const { response, sentimentScore, keywords } = await aiService.generateCreatureResponse(
      message,
      'lovable-user-' + Date.now(), // Unique user ID for each session
      'HATCHLING',
      75, // Default mood score
      [] // No conversation history for now
    );
    
    res.json({
      success: true,
      data: {
        conversation: {
          message,
          response,
          sentimentScore,
          timestamp: new Date().toISOString()
        },
        creature: {
          moodScore: 75 + (sentimentScore * 20), // Adjust mood based on sentiment
          xp: 100
        },
        keywords
      }
    });
  } catch (error) {
    logger.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message'
    });
  }
});

// Simple submit task endpoint for Lovable (no auth needed for now)
router.post('/submit-task', (req, res) => {
  const { taskId, taskType, title } = req.body;
  
  // Calculate XP based on task type
  const xpRewards = {
    'DAILY_CHALLENGE': 50,
    'CARE': 25,
    'ADVENTURE': 75,
    'CHAT_INTERACTION': 10
  };
  
  const xpGained = xpRewards[taskType] || 25;
  
  res.json({
    success: true,
    data: {
      task: {
        id: taskId,
        title: title || 'Task Completed',
        type: taskType,
        completed: true,
        completedAt: new Date().toISOString()
      },
      xpGained,
      creature: {
        xp: 100 + xpGained
      }
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
