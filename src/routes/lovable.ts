import { Router } from 'express';
import { lovableController } from '../controllers/lovableController';
import { validate, schemas } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Health check
router.get('/health', lovableController.healthCheck);

// Create creature
router.post('/creature/create',
  validate(Joi.object({
    userId: Joi.string().required()
  })),
  lovableController.createCreature
);

// Process chat
router.post('/creature/chat',
  validate(Joi.object({
    message: Joi.string().required(),
    userId: Joi.string().required(),
    creatureId: Joi.string().optional(),
    currentStage: Joi.string().optional(),
    moodScore: Joi.number().optional(),
    personality: Joi.object().optional(),
    visualTraits: Joi.object().optional()
  })),
  lovableController.processChat
);

// Process task
router.post('/creature/submit-task',
  validate(Joi.object({
    taskType: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().optional(),
    userId: Joi.string().required(),
    creatureId: Joi.string().optional(),
    currentXP: Joi.number().optional()
  })),
  lovableController.processTask
);

// Get creature state
router.get('/creature/state/:userId', lovableController.getCreatureState);

export default router;
