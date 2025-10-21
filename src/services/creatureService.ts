import { EvolutionStage, TaskType } from '@prisma/client';
import prisma from '../config/database';
import { 
  CreatureState, 
  EvolutionRequirements, 
  EVOLUTION_REQUIREMENTS, 
  EVOLUTION_STAGES,
  TOKEN_REWARDS 
} from '../types';
import { personalityService, PersonalityProfile, VisualTraits } from './personalityService';
import logger from '../utils/logger';

export class CreatureService {
  /**
   * Get creature state for a user
   */
  async getCreatureState(userId: string): Promise<CreatureState> {
    const creature = await prisma.creature.findUnique({
      where: { userId },
      include: {
        user: {
          select: { createdAt: true }
        }
      }
    });

    if (!creature) {
      throw new Error('Creature not found');
    }

    const accountAgeHours = this.getAccountAgeHours(creature.user.createdAt);
    const evolutionRequirements = this.getEvolutionRequirements(creature.currentStage);
    const canEvolve = await this.canEvolve(userId, creature.currentStage, accountAgeHours);

    return {
      id: creature.id,
      currentStage: creature.currentStage,
      moodScore: creature.moodScore,
      xp: creature.xp,
      lastEvolution: creature.lastEvolution,
      canEvolve,
      evolutionRequirements
    };
  }

  /**
   * Create new creature with personality and visual traits
   */
  async createCreature(userId: string): Promise<void> {
    // Generate personality and visual traits
    const personality = await personalityService.generateInitialPersonality(userId);
    const visualTraits = await personalityService.generateVisualTraits(userId);

    // Create creature with all traits
    await prisma.creature.create({
      data: {
        userId,
        currentStage: 'HATCHLING',
        personalityProfile: personality,
        energy: personality.energy,
        tone: personality.tone,
        bondType: personality.bondType,
        favoriteWords: personality.favoriteWords,
        userKeywords: personality.userKeywords,
        evolutionPathVariant: personality.evolutionPathVariant,
        visualTraits: visualTraits,
        hornType: visualTraits.hornType,
        furColor: visualTraits.furColor,
        eyeStyle: visualTraits.eyeStyle,
        tailType: visualTraits.tailType,
        auraEffect: visualTraits.auraEffect,
        accessory: visualTraits.accessory
      }
    });

    logger.info(`Created creature with personality and visual traits for user ${userId}`);
  }

  /**
   * Check if creature can evolve to next stage
   */
  async canEvolve(
    userId: string, 
    currentStage: EvolutionStage, 
    accountAgeHours?: number
  ): Promise<boolean> {
    const nextStageIndex = EVOLUTION_STAGES.indexOf(currentStage) + 1;
    
    if (nextStageIndex >= EVOLUTION_STAGES.length) {
      return false; // Already at max stage
    }

    const nextStage = EVOLUTION_STAGES[nextStageIndex];
    const requirements = EVOLUTION_REQUIREMENTS[nextStage];

    // Get user's progress
    const progress = await this.getUserProgress(userId, accountAgeHours);

    // Check requirements
    if (progress.dailyChallenges < requirements.dailyChallenges) {
      return false;
    }

    if (progress.chatInteractions < requirements.chatInteractions) {
      return false;
    }

    if (progress.accountAgeHours < requirements.accountAgeHours) {
      return false;
    }

    if (requirements.moodScore && progress.moodScore < requirements.moodScore) {
      return false;
    }

    return true;
  }

  /**
   * Evolve creature to next stage
   */
  async evolveCreature(userId: string, overrideTimeGates = false): Promise<CreatureState> {
    const creature = await prisma.creature.findUnique({
      where: { userId },
      include: {
        user: {
          select: { createdAt: true }
        }
      }
    });

    if (!creature) {
      throw new Error('Creature not found');
    }

    const accountAgeHours = this.getAccountAgeHours(creature.user.createdAt);
    const canEvolve = await this.canEvolve(userId, creature.currentStage, accountAgeHours);

    if (!canEvolve && !overrideTimeGates) {
      throw new Error('Evolution requirements not met');
    }

    const nextStageIndex = EVOLUTION_STAGES.indexOf(creature.currentStage) + 1;
    
    if (nextStageIndex >= EVOLUTION_STAGES.length) {
      throw new Error('Creature is already at maximum evolution stage');
    }

    const nextStage = EVOLUTION_STAGES[nextStageIndex];
    const previousStage = creature.currentStage;

    // Update creature
    const updatedCreature = await prisma.creature.update({
      where: { userId },
      data: {
        currentStage: nextStage,
        lastEvolution: new Date(),
        xp: creature.xp + this.getEvolutionXP(nextStage)
      }
    });

    // Log evolution
    await prisma.evolutionLog.create({
      data: {
        userId,
        fromStage: previousStage,
        toStage: nextStage,
        reason: overrideTimeGates ? 'Test evolution' : 'Natural evolution'
      }
    });

    // Create token claim if reward available
    const tokenReward = TOKEN_REWARDS[nextStage];
    if (tokenReward !== '0') {
      await prisma.tokenClaim.create({
        data: {
          userId,
          amount: tokenReward
        }
      });
    }

    logger.info(`Creature evolved: ${userId} from ${previousStage} to ${nextStage}`);

    return this.getCreatureState(userId);
  }

  /**
   * Get user's progress towards evolution requirements
   */
  async getUserProgress(userId: string, accountAgeHours?: number) {
    const [dailyChallenges, chatInteractions, avgMoodScore] = await Promise.all([
      // Count completed daily challenges
      prisma.task.count({
        where: {
          userId,
          taskType: TaskType.DAILY_CHALLENGE,
          completed: true
        }
      }),

      // Count chat interactions
      prisma.conversation.count({
        where: { userId }
      }),

      // Get average mood score from recent conversations
      prisma.conversation.aggregate({
        where: {
          userId,
          sentimentScore: { not: null }
        },
        _avg: {
          sentimentScore: true
        }
      })
    ]);

    // Convert sentiment score (-1 to 1) to mood score (0 to 100)
    const moodScore = avgMoodScore._avg.sentimentScore 
      ? Math.max(0, Math.min(100, (avgMoodScore._avg.sentimentScore + 1) * 50))
      : 50;

    return {
      dailyChallenges,
      chatInteractions,
      accountAgeHours: accountAgeHours || 0,
      moodScore
    };
  }

  /**
   * Get evolution requirements for a stage
   */
  getEvolutionRequirements(stage: EvolutionStage): EvolutionRequirements {
    return EVOLUTION_REQUIREMENTS[stage];
  }

  /**
   * Calculate account age in hours
   */
  private getAccountAgeHours(createdAt: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  /**
   * Get XP reward for evolution
   */
  private getEvolutionXP(stage: EvolutionStage): number {
    const xpRewards = {
      [EvolutionStage.EGG]: 0,
      [EvolutionStage.HATCHLING]: 100,
      [EvolutionStage.JUVENILE]: 500,
      [EvolutionStage.ASCENDED]: 2000,
      [EvolutionStage.CELESTIAL]: 10000
    };

    return xpRewards[stage];
  }

  /**
   * Update creature mood based on chat sentiment
   */
  async updateMoodFromChat(userId: string, sentimentScore: number): Promise<void> {
    const creature = await prisma.creature.findUnique({
      where: { userId }
    });

    if (!creature) {
      throw new Error('Creature not found');
    }

    // Convert sentiment (-1 to 1) to mood impact (-10 to 10)
    const moodImpact = sentimentScore * 10;
    const newMoodScore = Math.max(0, Math.min(100, creature.moodScore + moodImpact));

    await prisma.creature.update({
      where: { userId },
      data: { moodScore: newMoodScore }
    });
  }

  /**
   * Add XP to creature
   */
  async addXP(userId: string, xp: number): Promise<void> {
    await prisma.creature.update({
      where: { userId },
      data: {
        xp: {
          increment: xp
        }
      }
    });
  }

  /**
   * Save chat memory with personality tracking
   */
  async saveChatMemory(
    userId: string,
    message: string,
    response: string,
    sentimentScore: number,
    keywords: string[]
  ): Promise<void> {
    const creature = await prisma.creature.findUnique({
      where: { userId },
      select: { id: true, moodScore: true }
    });

    if (!creature) {
      throw new Error('Creature not found');
    }

    // Save to chat memory
    await prisma.chatMemory.create({
      data: {
        creatureId: creature.id,
        userId,
        message,
        response,
        sentimentScore,
        moodScore: creature.moodScore,
        keywords,
        isImportant: keywords.length > 0 || Math.abs(sentimentScore) > 0.5
      }
    });

    // Update engagement metrics
    await personalityService.updateEngagementMetrics(userId);

    // Update user keywords in creature
    if (keywords.length > 0) {
      const currentKeywords = await prisma.creature.findUnique({
        where: { userId },
        select: { userKeywords: true }
      });

      if (currentKeywords) {
        const updatedKeywords = [...new Set([...currentKeywords.userKeywords, ...keywords])];
        await prisma.creature.update({
          where: { userId },
          data: { userKeywords: updatedKeywords }
        });
      }
    }

    // Check if personality should be updated (every 10 conversations)
    const totalChats = await prisma.chatMemory.count({
      where: { userId }
    });

    if (totalChats % 10 === 0 && totalChats > 0) {
      await personalityService.reflectAndUpdatePersonality(userId);
    }
  }

  /**
   * Get personality profile
   */
  async getPersonalityProfile(userId: string): Promise<PersonalityProfile> {
    return await personalityService.getPersonalityProfile(userId);
  }

  /**
   * Get visual traits
   */
  async getVisualTraits(userId: string): Promise<VisualTraits> {
    return await personalityService.getVisualTraits(userId);
  }

  /**
   * Get chat memories
   */
  async getChatMemories(userId: string, limit: number = 20) {
    return await prisma.chatMemory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  /**
   * Get creature statistics
   */
  async getCreatureStats(userId: string) {
    const [creature, tasks, conversations, evolutionLogs, chatMemories] = await Promise.all([
      prisma.creature.findUnique({
        where: { userId },
        include: {
          user: {
            select: { createdAt: true }
          }
        }
      }),
      prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10
      }),
      prisma.evolutionLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
      }),
      prisma.chatMemory.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10
      })
    ]);

    if (!creature) {
      throw new Error('Creature not found');
    }

    return {
      creature,
      recentTasks: tasks,
      recentConversations: conversations,
      evolutionHistory: evolutionLogs,
      chatMemories,
      accountAge: this.getAccountAgeHours(creature.user.createdAt)
    };
  }
}

export const creatureService = new CreatureService();
