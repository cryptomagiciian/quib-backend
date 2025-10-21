import { Request, Response } from 'express';
import { creatureService } from '../services/creatureService';
import { aiService } from '../services/aiService';
import { schemas } from '../middleware/validation';
import { AuthenticatedRequest, requireDevWallet } from '../middleware/auth';
import { EVOLUTION_STAGES, EVOLUTION_REQUIREMENTS, TOKEN_REWARDS } from '../types';
import prisma from '../config/database';
import logger from '../utils/logger';

export class EvolutionController {
  /**
   * Trigger evolution test (dev only)
   */
  async triggerEvolutionTest(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, targetStage, overrideTimeGates, mockRequirements } = req.body;

      // Get current creature state
      const currentState = await creatureService.getCreatureState(userId);
      const currentStageIndex = EVOLUTION_STAGES.indexOf(currentState.currentStage);
      const targetStageIndex = EVOLUTION_STAGES.indexOf(targetStage);

      if (targetStageIndex <= currentStageIndex) {
        return res.status(400).json({
          success: false,
          error: 'Target stage must be higher than current stage'
        });
      }

      // Evolve creature
      const evolvedState = await creatureService.evolveCreature(userId, overrideTimeGates);

      // Generate evolution message
      const evolutionMessage = await aiService.generateEvolutionMessage(
        currentState.currentStage,
        evolvedState.currentStage
      );

      logger.info(`Evolution test triggered: user ${userId} to ${targetStage}`);

      res.json({
        success: true,
        data: {
          previousState: currentState,
          newState: evolvedState,
          evolutionMessage
        },
        message: 'Evolution test completed successfully'
      });
    } catch (error) {
      logger.error('Evolution test error:', error);
      res.status(500).json({
        success: false,
        error: 'Evolution test failed'
      });
    }
  }

  /**
   * Check evolution requirements
   */
  async checkEvolutionRequirements(req: AuthenticatedRequest, res: Response) {
    try {
      const creatureState = await creatureService.getCreatureState(req.user.id);
      const progress = await creatureService.getUserProgress(req.user.id);

      // Get next stage requirements
      const currentStageIndex = EVOLUTION_STAGES.indexOf(creatureState.currentStage);
      const nextStage = EVOLUTION_STAGES[currentStageIndex + 1];

      if (!nextStage) {
        return res.json({
          success: true,
          data: {
            canEvolve: false,
            message: 'Creature is already at maximum evolution stage',
            currentStage: creatureState.currentStage,
            progress
          }
        });
      }

      const requirements = EVOLUTION_REQUIREMENTS[nextStage];
      const canEvolve = await creatureService.canEvolve(req.user.id, creatureState.currentStage);

      res.json({
        success: true,
        data: {
          canEvolve,
          currentStage: creatureState.currentStage,
          nextStage,
          requirements,
          progress,
          message: canEvolve 
            ? 'Creature is ready to evolve!' 
            : 'Evolution requirements not yet met'
        }
      });
    } catch (error) {
      logger.error('Check evolution requirements error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check evolution requirements'
      });
    }
  }

  /**
   * Get evolution history
   */
  async getEvolutionHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      const skip = (Number(page) - 1) * Number(limit);

      const [evolutionLogs, total] = await Promise.all([
        prisma.evolutionLog.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.evolutionLog.count({
          where: { userId }
        })
      ]);

      res.json({
        success: true,
        data: { evolutionLogs },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Get evolution history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch evolution history'
      });
    }
  }

  /**
   * Get all evolution stages and requirements
   */
  async getEvolutionStages(req: Request, res: Response) {
    try {
      const stages = EVOLUTION_STAGES.map(stage => ({
        stage,
        requirements: EVOLUTION_REQUIREMENTS[stage],
        tokenReward: TOKEN_REWARDS[stage]
      }));

      res.json({
        success: true,
        data: { stages }
      });
    } catch (error) {
      logger.error('Get evolution stages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch evolution stages'
      });
    }
  }
}

export const evolutionController = new EvolutionController();
