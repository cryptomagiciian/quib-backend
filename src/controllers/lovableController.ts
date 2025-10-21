import { Request, Response } from 'express';
import { creatureService } from '../services/creatureService';
import { personalityService } from '../services/personalityService';
import { aiService } from '../services/aiService';
import logger from '../utils/logger';

export class LovableController {
  /**
   * Create creature for Lovable user
   */
  async createCreature(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Generate personality and visual traits
      const personality = await personalityService.generateInitialPersonality(userId);
      const visualTraits = await personalityService.generateVisualTraits(userId);

      logger.info(`Created creature for Lovable user ${userId}`);

      res.json({
        success: true,
        data: {
          personality,
          visualTraits
        }
      });
    } catch (error) {
      logger.error('Create creature error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create creature'
      });
    }
  }

  /**
   * Process chat message from Lovable
   */
  async processChat(req: Request, res: Response) {
    try {
      const { message, userId, creatureId, currentStage, moodScore, personality, visualTraits } = req.body;

      if (!message || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Message and user ID are required'
        });
      }

      // Get recent conversation history (you might want to implement this)
      const recentConversations: Array<{ message: string; response: string; timestamp: Date }> = [];

      // Generate AI response with personality
      const { response, sentimentScore, keywords } = await aiService.generateCreatureResponse(
        message,
        userId,
        currentStage || 'HATCHLING',
        moodScore || 50,
        recentConversations
      );

      // Calculate mood impact
      const moodImpact = sentimentScore * 10;
      const newMoodScore = Math.max(0, Math.min(100, (moodScore || 50) + moodImpact));

      // Calculate XP gain
      const xpGained = 10;

      logger.info(`Processed chat for user ${userId}`);

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
            moodScore: newMoodScore,
            xp: (req.body.currentXP || 0) + xpGained
          },
          keywords
        }
      });
    } catch (error) {
      logger.error('Process chat error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message'
      });
    }
  }

  /**
   * Process task submission from Lovable
   */
  async processTask(req: Request, res: Response) {
    try {
      const { taskType, title, description, userId, creatureId } = req.body;

      if (!taskType || !title || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Task type, title, and user ID are required'
        });
      }

      // Calculate XP based on task type
      const xpRewards = {
        'DAILY_CHALLENGE': 50,
        'CHAT_INTERACTION': 10,
        'TIME_BASED': 25,
        'CUSTOM': 30
      };

      const xpGained = xpRewards[taskType as keyof typeof xpRewards] || 10;

      logger.info(`Processed task for user ${userId}: ${taskType}`);

      res.json({
        success: true,
        data: {
          task: {
            taskType,
            title,
            description,
            completed: true,
            completedAt: new Date().toISOString()
          },
          xpGained,
          creature: {
            xp: (req.body.currentXP || 0) + xpGained
          }
        }
      });
    } catch (error) {
      logger.error('Process task error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process task'
      });
    }
  }

  /**
   * Get creature state for Lovable
   */
  async getCreatureState(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // This would typically fetch from your database
      // For now, return a basic response
      res.json({
        success: true,
        data: {
          creature: {
            id: 'temp-id',
            userId,
            currentStage: 'HATCHLING',
            moodScore: 50,
            xp: 0,
            canEvolve: false
          }
        }
      });
    } catch (error) {
      logger.error('Get creature state error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get creature state'
      });
    }
  }

  /**
   * Health check for Lovable
   */
  async healthCheck(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'QUIB Backend API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      lovable: true
    });
  }
}

export const lovableController = new LovableController();
