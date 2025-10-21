import { Request, Response } from 'express';
import { creatureService } from '../services/creatureService';
import { aiService } from '../services/aiService';
import { tokenService } from '../services/tokenService';
import { schemas } from '../middleware/validation';
import { AuthenticatedRequest, requireDevWallet } from '../middleware/auth';
import prisma from '../config/database';
import logger from '../utils/logger';

export class CreatureController {
  /**
   * Get creature state
   */
  async getCreatureState(req: AuthenticatedRequest, res: Response) {
    try {
      const creatureState = await creatureService.getCreatureState(req.user.id);

      res.json({
        success: true,
        data: { creature: creatureState }
      });
    } catch (error) {
      logger.error('Get creature state error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch creature state'
      });
    }
  }

  /**
   * Submit task completion
   */
  async submitTask(req: AuthenticatedRequest, res: Response) {
    try {
      const { taskType, title, description } = req.body;
      const userId = req.user.id;

      // Create task
      const task = await prisma.task.create({
        data: {
          userId,
          taskType,
          title,
          description,
          completed: true,
          completedAt: new Date()
        }
      });

      // Add XP based on task type
      const xpRewards = {
        'DAILY_CHALLENGE': 50,
        'CHAT_INTERACTION': 10,
        'TIME_BASED': 25,
        'CUSTOM': 30
      };

      await creatureService.addXP(userId, xpRewards[taskType] || 10);

      // Check if creature can evolve
      const creatureState = await creatureService.getCreatureState(userId);

      logger.info(`Task completed: ${taskType} by user ${userId}`);

      res.json({
        success: true,
        data: {
          task,
          creature: creatureState,
          xpGained: xpRewards[taskType] || 10
        },
        message: 'Task completed successfully'
      });
    } catch (error) {
      logger.error('Submit task error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit task'
      });
    }
  }

  /**
   * Chat with creature
   */
  async chatWithCreature(req: AuthenticatedRequest, res: Response) {
    try {
      const { message } = req.body;
      const userId = req.user.id;

      // Get creature state
      const creatureState = await creatureService.getCreatureState(userId);

      // Get recent conversation history
      const recentConversations = await prisma.conversation.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 5,
        select: {
          message: true,
          response: true,
          timestamp: true
        }
      });

      // Generate AI response with personality
      const { response, sentimentScore, keywords } = await aiService.generateCreatureResponse(
        message,
        userId,
        creatureState.currentStage,
        creatureState.moodScore,
        recentConversations.reverse()
      );

      // Save conversation
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          message,
          response,
          sentimentScore
        }
      });

      // Save chat memory with personality tracking
      await creatureService.saveChatMemory(
        userId,
        message,
        response,
        sentimentScore,
        keywords
      );

      // Update creature mood
      await creatureService.updateMoodFromChat(userId, sentimentScore);

      // Add XP for chat interaction
      await creatureService.addXP(userId, 10);

      // Check if creature can evolve
      const updatedCreatureState = await creatureService.getCreatureState(userId);

      logger.info(`Chat interaction: user ${userId} with creature`);

      res.json({
        success: true,
        data: {
          conversation,
          creature: updatedCreatureState,
          xpGained: 10,
          keywords
        },
        message: 'Chat interaction recorded'
      });
    } catch (error) {
      logger.error('Chat with creature error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message'
      });
    }
  }

  /**
   * Get creature statistics
   */
  async getCreatureStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await creatureService.getCreatureStats(req.user.id);

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get creature stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch creature statistics'
      });
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      const skip = (Number(page) - 1) * Number(limit);

      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.conversation.count({
          where: { userId }
        })
      ]);

      res.json({
        success: true,
        data: { conversations },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Get conversation history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch conversation history'
      });
    }
  }

  /**
   * Get task history
   */
  async getTaskHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      const skip = (Number(page) - 1) * Number(limit);

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.task.count({
          where: { userId }
        })
      ]);

      res.json({
        success: true,
        data: { tasks },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Get task history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch task history'
      });
    }
  }

  /**
   * Generate daily challenge
   */
  async generateDailyChallenge(req: AuthenticatedRequest, res: Response) {
    try {
      const creatureState = await creatureService.getCreatureState(req.user.id);
      
      const challenge = await aiService.generateDailyChallenge(
        creatureState.currentStage
      );

      res.json({
        success: true,
        data: { challenge },
        message: 'Daily challenge generated'
      });
    } catch (error) {
      logger.error('Generate daily challenge error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate daily challenge'
      });
    }
  }

  /**
   * Get personality profile
   */
  async getPersonalityProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const personality = await creatureService.getPersonalityProfile(req.user.id);

      res.json({
        success: true,
        data: { personality }
      });
    } catch (error) {
      logger.error('Get personality profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch personality profile'
      });
    }
  }

  /**
   * Get visual traits
   */
  async getVisualTraits(req: AuthenticatedRequest, res: Response) {
    try {
      const visualTraits = await creatureService.getVisualTraits(req.user.id);

      res.json({
        success: true,
        data: { visualTraits }
      });
    } catch (error) {
      logger.error('Get visual traits error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch visual traits'
      });
    }
  }

  /**
   * Get chat memories
   */
  async getChatMemories(req: AuthenticatedRequest, res: Response) {
    try {
      const { limit = 20 } = req.query;
      const memories = await creatureService.getChatMemories(req.user.id, Number(limit));

      res.json({
        success: true,
        data: { memories }
      });
    } catch (error) {
      logger.error('Get chat memories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch chat memories'
      });
    }
  }
}

export const creatureController = new CreatureController();
