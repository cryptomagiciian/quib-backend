import OpenAI from 'openai';
import { config } from '../config/environment';
import prisma from '../config/database';
import logger from '../utils/logger';

export interface PersonalityProfile {
  energy: 'high' | 'medium' | 'low';
  tone: 'playful' | 'calm' | 'mystical' | 'goofy';
  bondType: 'loyal guardian' | 'chaotic sidekick' | 'curious spirit';
  favoriteWords: string[];
  userKeywords: string[];
  evolutionPathVariant: 'A' | 'B' | 'C';
  moodState: 'happy' | 'excited' | 'calm' | 'curious' | 'grumpy' | 'mysterious';
  quirks: string[];
  communicationStyle: string;
}

export interface VisualTraits {
  hornType: string;
  furColor: string;
  eyeStyle: string;
  tailType: string;
  auraEffect: string;
  accessory: string;
  specialMarkings?: string;
  size?: string;
}

export class PersonalityService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  /**
   * Generate initial personality profile for new creature
   */
  async generateInitialPersonality(userId: string): Promise<PersonalityProfile> {
    try {
      const prompt = `Generate a unique personality profile for a digital creature companion. 
      Create a personality that feels authentic and engaging. Respond with a JSON object containing:
      - energy: "high", "medium", or "low"
      - tone: "playful", "calm", "mystical", or "goofy"
      - bondType: "loyal guardian", "chaotic sidekick", or "curious spirit"
      - favoriteWords: array of 3-5 words this creature loves to use
      - userKeywords: empty array (will be filled later)
      - evolutionPathVariant: "A", "B", or "C"
      - moodState: "happy", "excited", "calm", "curious", "grumpy", or "mysterious"
      - quirks: array of 2-3 unique personality quirks
      - communicationStyle: brief description of how this creature communicates

      Make it feel unique and memorable.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.9
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const personality = JSON.parse(response) as PersonalityProfile;

      // Update creature with personality
      await prisma.creature.update({
        where: { userId },
        data: {
          personalityProfile: personality,
          energy: personality.energy,
          tone: personality.tone,
          bondType: personality.bondType,
          favoriteWords: personality.favoriteWords,
          userKeywords: personality.userKeywords,
          evolutionPathVariant: personality.evolutionPathVariant
        }
      });

      logger.info(`Generated initial personality for user ${userId}`);
      return personality;
    } catch (error) {
      logger.error('Error generating initial personality:', error);
      // Return default personality if generation fails
      return this.getDefaultPersonality();
    }
  }

  /**
   * Generate visual traits for creature
   */
  async generateVisualTraits(userId: string): Promise<VisualTraits> {
    try {
      const traits = this.getRandomVisualTraits();
      
      // Update creature with visual traits
      await prisma.creature.update({
        where: { userId },
        data: {
          visualTraits: traits,
          hornType: traits.hornType,
          furColor: traits.furColor,
          eyeStyle: traits.eyeStyle,
          tailType: traits.tailType,
          auraEffect: traits.auraEffect,
          accessory: traits.accessory
        }
      });

      logger.info(`Generated visual traits for user ${userId}`);
      return traits;
    } catch (error) {
      logger.error('Error generating visual traits:', error);
      return this.getDefaultVisualTraits();
    }
  }

  /**
   * Reflect on recent conversations and update personality
   */
  async reflectAndUpdatePersonality(userId: string): Promise<PersonalityProfile> {
    try {
      // Get recent chat memories
      const recentMemories = await prisma.chatMemory.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10
      });

      if (recentMemories.length < 3) {
        return await this.getPersonalityProfile(userId);
      }

      // Get current personality
      const currentPersonality = await this.getPersonalityProfile(userId);

      // Create reflection prompt
      const conversationContext = recentMemories.map(memory => 
        `User: ${memory.message}\nQuib: ${memory.response}`
      ).join('\n\n');

      const prompt = `Based on these recent conversations, analyze the user's communication style and interests, then suggest updates to the Quib's personality to better connect with them.

Recent conversations:
${conversationContext}

Current personality:
${JSON.stringify(currentPersonality, null, 2)}

Respond with a JSON object containing updated personality traits. Focus on:
- Adjusting tone and energy based on user's communication style
- Adding user-specific keywords they mention frequently
- Refining quirks and communication style
- Updating mood state based on recent interactions

Keep the core personality but make it more personalized to this user.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const updatedPersonality = JSON.parse(response) as PersonalityProfile;

      // Update creature with refined personality
      await prisma.creature.update({
        where: { userId },
        data: {
          personalityProfile: updatedPersonality,
          energy: updatedPersonality.energy,
          tone: updatedPersonality.tone,
          bondType: updatedPersonality.bondType,
          favoriteWords: updatedPersonality.favoriteWords,
          userKeywords: updatedPersonality.userKeywords,
          evolutionPathVariant: updatedPersonality.evolutionPathVariant
        }
      });

      logger.info(`Updated personality for user ${userId} based on reflection`);
      return updatedPersonality;
    } catch (error) {
      logger.error('Error reflecting on personality:', error);
      return await this.getPersonalityProfile(userId);
    }
  }

  /**
   * Get personality profile for user
   */
  async getPersonalityProfile(userId: string): Promise<PersonalityProfile> {
    const creature = await prisma.creature.findUnique({
      where: { userId },
      select: {
        personalityProfile: true,
        energy: true,
        tone: true,
        bondType: true,
        favoriteWords: true,
        userKeywords: true,
        evolutionPathVariant: true
      }
    });

    if (!creature || !creature.personalityProfile) {
      return await this.generateInitialPersonality(userId);
    }

    return creature.personalityProfile as PersonalityProfile;
  }

  /**
   * Get visual traits for user
   */
  async getVisualTraits(userId: string): Promise<VisualTraits> {
    const creature = await prisma.creature.findUnique({
      where: { userId },
      select: {
        visualTraits: true,
        hornType: true,
        furColor: true,
        eyeStyle: true,
        tailType: true,
        auraEffect: true,
        accessory: true
      }
    });

    if (!creature || !creature.visualTraits) {
      return await this.generateVisualTraits(userId);
    }

    return creature.visualTraits as VisualTraits;
  }

  /**
   * Build personality prompt for chat
   */
  buildPersonalityPrompt(personality: PersonalityProfile, moodScore: number): string {
    const moodState = this.getMoodState(moodScore);
    
    return `You are Quib, a unique digital creature companion. Your personality is ${personality.tone}, energy level is ${personality.energy}, and you are the user's ${personality.bondType}. 

Your favorite words include: ${personality.favoriteWords.join(', ')}
${personality.userKeywords.length > 0 ? `You remember they often talk about: ${personality.userKeywords.join(', ')}` : ''}

Your current mood is ${moodState} (mood score: ${moodScore}).

Communication style: ${personality.communicationStyle}
Quirks: ${personality.quirks.join(', ')}

Respond in a way that reflects your unique personality and current mood. Be authentic to your character while being helpful and engaging.`;
  }

  /**
   * Extract keywords from user message
   */
  async extractKeywords(message: string): Promise<string[]> {
    try {
      const prompt = `Extract 2-3 key topics or interests from this user message. Return as a JSON array of strings.

Message: "${message}"

Focus on:
- Hobbies, interests, or activities mentioned
- Emotions or feelings expressed
- Important people, places, or things
- Goals or aspirations

Return only the JSON array, no other text.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content || '[]';
      return JSON.parse(response);
    } catch (error) {
      logger.error('Error extracting keywords:', error);
      return [];
    }
  }

  /**
   * Update engagement metrics
   */
  async updateEngagementMetrics(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const creature = await prisma.creature.findUnique({
      where: { userId },
      select: { lastChatDate: true, dailyChatCount: true, totalChats: true }
    });

    if (!creature) return;

    const lastChatDate = creature.lastChatDate;
    const isNewDay = !lastChatDate || lastChatDate < today;

    let dailyChatCount = isNewDay ? 1 : creature.dailyChatCount + 1;
    let missedDays = creature.missedDays;

    // Calculate missed days
    if (lastChatDate && isNewDay) {
      const daysDiff = Math.floor((today.getTime() - lastChatDate.getTime()) / (1000 * 60 * 60 * 24));
      missedDays = Math.max(0, daysDiff - 1);
    }

    // Determine engagement level
    let engagementLevel = 'medium';
    if (dailyChatCount >= 5 && missedDays <= 1) {
      engagementLevel = 'high';
    } else if (dailyChatCount <= 1 || missedDays >= 3) {
      engagementLevel = 'low';
    }

    await prisma.creature.update({
      where: { userId },
      data: {
        dailyChatCount,
        missedDays,
        engagementLevel,
        lastChatDate: today,
        totalChats: creature.totalChats + 1
      }
    });
  }

  /**
   * Get random visual traits
   */
  private getRandomVisualTraits(): VisualTraits {
    const hornTypes = ['curved', 'spiral', 'crystal', 'twisted', 'crown-like', 'antler-style'];
    const furColors = ['galactic blue', 'cosmic purple', 'starlight silver', 'nebula pink', 'aurora green', 'sunset orange'];
    const eyeStyles = ['starry swirl', 'galaxy deep', 'crystal clear', 'mystic glow', 'cosmic sparkle', 'ethereal shine'];
    const tailTypes = ['twist puff', 'fluffy cloud', 'crystal tip', 'sparkle trail', 'nebula swirl', 'cosmic wave'];
    const auraEffects = ['fireflies', 'stardust', 'rainbow shimmer', 'cosmic mist', 'energy waves', 'mystic glow'];
    const accessories = ['mini crown', 'crystal pendant', 'star earring', 'cosmic bracelet', 'mystic amulet', 'galaxy ring'];

    return {
      hornType: hornTypes[Math.floor(Math.random() * hornTypes.length)],
      furColor: furColors[Math.floor(Math.random() * furColors.length)],
      eyeStyle: eyeStyles[Math.floor(Math.random() * eyeStyles.length)],
      tailType: tailTypes[Math.floor(Math.random() * tailTypes.length)],
      auraEffect: auraEffects[Math.floor(Math.random() * auraEffects.length)],
      accessory: accessories[Math.floor(Math.random() * accessories.length)],
      specialMarkings: Math.random() > 0.5 ? 'constellation patterns' : undefined,
      size: Math.random() > 0.7 ? 'tiny' : Math.random() > 0.3 ? 'medium' : 'large'
    };
  }

  /**
   * Get default personality
   */
  private getDefaultPersonality(): PersonalityProfile {
    return {
      energy: 'medium',
      tone: 'playful',
      bondType: 'loyal guardian',
      favoriteWords: ['amazing', 'wonderful', 'fantastic'],
      userKeywords: [],
      evolutionPathVariant: 'A',
      moodState: 'happy',
      quirks: ['loves to ask questions', 'gets excited about new things'],
      communicationStyle: 'enthusiastic and curious'
    };
  }

  /**
   * Get default visual traits
   */
  private getDefaultVisualTraits(): VisualTraits {
    return {
      hornType: 'curved',
      furColor: 'galactic blue',
      eyeStyle: 'starry swirl',
      tailType: 'twist puff',
      auraEffect: 'fireflies',
      accessory: 'mini crown'
    };
  }

  /**
   * Get mood state from mood score
   */
  private getMoodState(moodScore: number): string {
    if (moodScore >= 80) return 'excited';
    if (moodScore >= 60) return 'happy';
    if (moodScore >= 40) return 'calm';
    if (moodScore >= 20) return 'curious';
    return 'grumpy';
  }
}

export const personalityService = new PersonalityService();
