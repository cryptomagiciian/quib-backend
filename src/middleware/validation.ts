import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    req.body = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  // User registration
  userRegistration: Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    password: Joi.string().min(6).optional(),
    wallet: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional()
  }).or('email', 'wallet'),

  // User login
  userLogin: Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().alphanum().optional(),
    password: Joi.string().required(),
    wallet: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional()
  }).or('email', 'username', 'wallet'),

  // Wallet signature
  walletSignature: Joi.object({
    message: Joi.string().required(),
    signature: Joi.string().required(),
    address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
  }),

  // Task submission
  taskSubmission: Joi.object({
    taskType: Joi.string().valid('DAILY_CHALLENGE', 'CHAT_INTERACTION', 'TIME_BASED', 'CUSTOM').required(),
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional()
  }),

  // Chat message
  chatMessage: Joi.object({
    message: Joi.string().min(1).max(1000).required()
  }),

  // Evolution test
  evolutionTest: Joi.object({
    userId: Joi.string().required(),
    targetStage: Joi.string().valid('EGG', 'HATCHLING', 'JUVENILE', 'ASCENDED', 'CELESTIAL').required(),
    overrideTimeGates: Joi.boolean().default(false),
    mockRequirements: Joi.object({
      dailyChallenges: Joi.number().min(0).optional(),
      chatInteractions: Joi.number().min(0).optional(),
      accountAgeHours: Joi.number().min(0).optional(),
      moodScore: Joi.number().min(0).max(100).optional()
    }).optional()
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  }),

  // Token claim
  tokenClaim: Joi.object({
    amount: Joi.string().pattern(/^\d+$/).required(),
    signature: Joi.string().required()
  })
};
