import { Request, Response } from 'express';
import { creatureService } from '../services/creatureService';
import { personalityService } from '../services/personalityService';
import { AuthenticatedRequest, requireDevWallet } from '../middleware/auth';
import prisma from '../config/database';
import logger from '../utils/logger';

export class AdminController {
  /**
   * Get personality profile (admin/debug)
   */
  async getPersonalityProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.query;
      const targetUserId = userId as string || req.user.id;

      const personality = await creatureService.getPersonalityProfile(targetUserId);
      const visualTraits = await creatureService.getVisualTraits(targetUserId);
      const creature = await prisma.creature.findUnique({
        where: { userId: targetUserId },
        select: {
          id: true,
          currentStage: true,
          moodScore: true,
          energy: true,
          tone: true,
          bondType: true,
          favoriteWords: true,
          userKeywords: true,
          evolutionPathVariant: true,
          dailyChatCount: true,
          missedDays: true,
          engagementLevel: true,
          totalChats: true
        }
      });

      res.json({
        success: true,
        data: {
          personality,
          visualTraits,
          creature
        }
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
   * Reset personality (admin/debug)
   */
  async resetPersonality(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.body;
      const targetUserId = userId || req.user.id;

      // Generate new personality and visual traits
      const newPersonality = await personalityService.generateInitialPersonality(targetUserId);
      const newVisualTraits = await personalityService.generateVisualTraits(targetUserId);

      // Clear chat memories
      await prisma.chatMemory.deleteMany({
        where: { userId: targetUserId }
      });

      // Reset engagement metrics
      await prisma.creature.update({
        where: { userId: targetUserId },
        data: {
          dailyChatCount: 0,
          missedDays: 0,
          engagementLevel: 'medium',
          lastChatDate: null,
          totalChats: 0,
          userKeywords: []
        }
      });

      logger.info(`Reset personality for user ${targetUserId}`);

      res.json({
        success: true,
        data: {
          newPersonality,
          newVisualTraits
        },
        message: 'Personality reset successfully'
      });
    } catch (error) {
      logger.error('Reset personality error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset personality'
      });
    }
  }

  /**
   * Simulate mood change (admin/debug)
   */
  async simulateMoodChange(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, to } = req.query;
      const targetUserId = userId as string || req.user.id;
      const targetMood = to as string || 'happy';

      const moodMap: Record<string, number> = {
        'grumpy': 20,
        'sad': 30,
        'neutral': 50,
        'calm': 60,
        'happy': 80,
        'excited': 90
      };

      const newMoodScore = moodMap[targetMood] || 50;

      await prisma.creature.update({
        where: { userId: targetUserId },
        data: { moodScore: newMoodScore }
      });

      logger.info(`Simulated mood change for user ${targetUserId} to ${targetMood}`);

      res.json({
        success: true,
        data: {
          newMoodScore,
          moodState: targetMood
        },
        message: `Mood changed to ${targetMood}`
      });
    } catch (error) {
      logger.error('Simulate mood change error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to simulate mood change'
      });
    }
  }

  /**
   * Force personality reflection (admin/debug)
   */
  async forcePersonalityReflection(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.body;
      const targetUserId = userId || req.user.id;

      const updatedPersonality = await personalityService.reflectAndUpdatePersonality(targetUserId);

      logger.info(`Forced personality reflection for user ${targetUserId}`);

      res.json({
        success: true,
        data: { updatedPersonality },
        message: 'Personality reflection completed'
      });
    } catch (error) {
      logger.error('Force personality reflection error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to force personality reflection'
      });
    }
  }

  /**
   * Get all chat memories (admin/debug)
   */
  async getAllChatMemories(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, limit = 50 } = req.query;
      const targetUserId = userId as string || req.user.id;

      const memories = await prisma.chatMemory.findMany({
        where: { userId: targetUserId },
        orderBy: { timestamp: 'desc' },
        take: Number(limit)
      });

      res.json({
        success: true,
        data: { memories }
      });
    } catch (error) {
      logger.error('Get all chat memories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch chat memories'
      });
    }
  }

  /**
   * Get engagement analytics (admin/debug)
   */
  async getEngagementAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.query;
      const targetUserId = userId as string || req.user.id;

      const creature = await prisma.creature.findUnique({
        where: { userId: targetUserId },
        select: {
          dailyChatCount: true,
          missedDays: true,
          engagementLevel: true,
          totalChats: true,
          lastChatDate: true,
          userKeywords: true,
          moodScore: true
        }
      });

      const totalMemories = await prisma.chatMemory.count({
        where: { userId: targetUserId }
      });

      const recentMemories = await prisma.chatMemory.findMany({
        where: { userId: targetUserId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          sentimentScore: true,
          moodScore: true,
          keywords: true,
          isImportant: true,
          timestamp: true
        }
      });

      const avgSentiment = recentMemories.length > 0 
        ? recentMemories.reduce((sum, m) => sum + m.sentimentScore, 0) / recentMemories.length
        : 0;

      const importantMemories = recentMemories.filter(m => m.isImportant).length;

      res.json({
        success: true,
        data: {
          creature,
          totalMemories,
          recentMemories,
          analytics: {
            avgSentiment,
            importantMemories,
            engagementTrend: recentMemories.length >= 5 ? 'increasing' : 'stable'
          }
        }
      });
    } catch (error) {
      logger.error('Get engagement analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch engagement analytics'
      });
    }
  }

  /**
   * Generate new visual traits (admin/debug)
   */
  async generateNewVisualTraits(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.body;
      const targetUserId = userId || req.user.id;

      const newVisualTraits = await personalityService.generateVisualTraits(targetUserId);

      logger.info(`Generated new visual traits for user ${targetUserId}`);

      res.json({
        success: true,
        data: { newVisualTraits },
        message: 'New visual traits generated'
      });
    } catch (error) {
      logger.error('Generate new visual traits error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate new visual traits'
      });
    }
  }

  /**
   * Get system stats (admin/debug)
   */
  async getSystemStats(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        totalCreatures,
        totalChats,
        totalMemories,
        avgMoodScore,
        personalityDistribution
      ] = await Promise.all([
        prisma.user.count(),
        prisma.creature.count(),
        prisma.conversation.count(),
        prisma.chatMemory.count(),
        prisma.creature.aggregate({
          _avg: { moodScore: true }
        }),
        prisma.creature.groupBy({
          by: ['tone'],
          _count: { tone: true }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalCreatures,
          totalChats,
          totalMemories,
          avgMoodScore: avgMoodScore._avg.moodScore,
          personalityDistribution
        }
      });
    } catch (error) {
      logger.error('Get system stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system stats'
      });
    }
  }
}

export const adminController = new AdminController();
