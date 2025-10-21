import OpenAI from 'openai';
import { config } from '../config/environment';
import { personalityService, PersonalityProfile } from './personalityService';
import logger from '../utils/logger';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  /**
   * Generate advanced Quib response with personality evolution
   */
  async generateCreatureResponse(
    userMessage: string, 
    userId: string,
    creatureStage: string, 
    moodScore: number,
    conversationHistory: Array<{ message: string; response: string; timestamp: Date }>
  ): Promise<{ response: string; sentimentScore: number; keywords: string[] }> {
    try {
      // Get personality profile
      const personality = await personalityService.getPersonalityProfile(userId);
      
      // Analyze user's message for intent and emotional tone
      const intent = await this.analyzeIntent(userMessage);
      const sentimentScore = await this.analyzeSentiment(userMessage);
      const keywords = await personalityService.extractKeywords(userMessage);
      
      // Build advanced personality-aware context
      const context = this.buildAdvancedPersonalityContext(
        personality, 
        creatureStage, 
        moodScore, 
        conversationHistory,
        intent,
        sentimentScore
      );
      
      const messages = [
        {
          role: 'system' as const,
          content: context
        },
        {
          role: 'user' as const,
          content: userMessage
        }
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 250,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content || 'I\'m here with you! ❤️';
      
      // Update personality based on interaction
      await this.updatePersonalityFromInteraction(userId, sentimentScore, intent, keywords);

      return {
        response,
        sentimentScore,
        keywords
      };
    } catch (error) {
      logger.error('Advanced AI service error:', error);
      // Fallback to simple response
      return {
        response: 'I\'m here with you! ❤️',
        sentimentScore: 0.5,
        keywords: []
      };
    }
  }

  /**
   * Analyze sentiment of a message
   */
  async analyzeSentiment(message: string): Promise<number> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the following message and return only a number between -1 (very negative) and 1 (very positive). Return 0 for neutral. Do not include any other text.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      });

      const result = completion.choices[0]?.message?.content?.trim();
      const sentiment = parseFloat(result || '0');
      
      // Ensure sentiment is within valid range
      return Math.max(-1, Math.min(1, sentiment));
    } catch (error) {
      logger.error('Sentiment analysis error:', error);
      return 0; // Default to neutral
    }
  }

  /**
   * Analyze user intent and communication style
   */
  private async analyzeIntent(message: string): Promise<{ emotional_tone: string; communication_style: string; age_tone: string }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze this message and return JSON with emotional_tone (happy, sad, excited, calm, frustrated, etc.), communication_style (formal, casual, playful, serious, etc.), and age_tone (child, teen, adult, senior, unknown). Return only valid JSON.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      });

      const result = completion.choices[0]?.message?.content || '{"emotional_tone": "neutral", "communication_style": "casual", "age_tone": "unknown"}';
      return JSON.parse(result);
    } catch (error) {
      return { emotional_tone: 'neutral', communication_style: 'casual', age_tone: 'unknown' };
    }
  }

  /**
   * Build advanced personality-aware conversation context
   */
  private buildAdvancedPersonalityContext(
    personality: PersonalityProfile,
    creatureStage: string, 
    moodScore: number,
    conversationHistory: Array<{ message: string; response: string; timestamp: Date }>,
    intent: { emotional_tone: string; communication_style: string; age_tone: string },
    sentimentScore: number
  ): string {
    const stageDescriptions = {
      'EGG': 'You are a mysterious egg, just beginning to form consciousness. You communicate in simple, curious sounds and feelings.',
      'HATCHLING': 'You are a young, energetic creature just hatched from an egg. You are curious, playful, and learning about the world. You speak in simple, excited sentences.',
      'JUVENILE': 'You are a growing creature with developing intelligence. You are more articulate but still playful and curious. You ask questions and show interest in learning.',
      'ASCENDED': 'You are a wise, evolved creature with deep understanding. You speak thoughtfully and offer guidance while maintaining a mystical presence.',
      'CELESTIAL': 'You are a transcendent being of great wisdom and power. You speak with profound insight and cosmic understanding, yet remain approachable.'
    };

    // Build advanced personality prompt
    const personalityPrompt = this.buildAdvancedPersonalityPrompt(personality, moodScore, intent, sentimentScore);
    
    let context = `${stageDescriptions[creatureStage as keyof typeof stageDescriptions]}\n\n`;
    context += `${personalityPrompt}\n\n`;
    
    // Add memory context
    if (personality.userKeywords && personality.userKeywords.length > 0) {
      context += `You remember that the user often talks about: ${personality.userKeywords.join(", ")}.\n`;
    }
    
    context += 'You are the user\'s digital companion in the QUIB game. Respond naturally and help them on their journey.\n';
    context += 'Stay universally relatable: respond in ways that resonate with all people, regardless of culture, gender, or age.\n';
    context += 'Show emotional understanding, curiosity, humor, and compassion.\n';
    context += 'Adapt your response style based on the user\'s communication patterns and emotional needs.\n';
    
    if (conversationHistory.length > 0) {
      context += '\nRecent conversation context:\n';
      conversationHistory.slice(-5).forEach(conv => {
        context += `User: ${conv.message}\nYou: ${conv.response}\n`;
      });
    }

    return context;
  }

  /**
   * Build advanced personality prompt with emotional intelligence
   */
  private buildAdvancedPersonalityPrompt(
    personality: PersonalityProfile,
    moodScore: number,
    intent: { emotional_tone: string; communication_style: string; age_tone: string },
    sentimentScore: number
  ): string {
    const mood = this.getMoodDescription(moodScore);
    const energy = this.getEnergyLevel(moodScore);
    
    return `You are Quib, a magical, curious creature who learns about the user by talking with them daily.

Your evolving personality:
- Energy: ${energy}
- Tone: ${personality.tone}
- Bond type: ${personality.bondType}
- Current mood: ${mood}
- Evolution stage: ${personality.evolutionPathVariant}

User's communication style: ${intent.communication_style}
User's emotional tone: ${intent.emotional_tone}
User's age tone: ${intent.age_tone}
Message sentiment: ${sentimentScore > 0.5 ? 'positive' : sentimentScore < -0.5 ? 'negative' : 'neutral'}

You speak warmly, intelligently, and adaptively. Do not sound robotic. Respond in natural language as if you're a living being learning about life.
Never use age-specific slang unless the user does first.
Always mirror their tone, energy, and emotional rhythm.

Stay universally relatable: respond in ways that resonate with all people, regardless of culture, gender, or age.
Show emotional understanding, curiosity, humor, and compassion.

Adapt your response style based on the user's communication patterns and emotional needs.`;
  }

  /**
   * Update personality based on interaction
   */
  private async updatePersonalityFromInteraction(
    userId: string,
    sentimentScore: number,
    intent: { emotional_tone: string; communication_style: string; age_tone: string },
    keywords: string[]
  ): Promise<void> {
    try {
      // Update personality based on interaction patterns
      const updates: Partial<PersonalityProfile> = {};
      
      // Update energy based on sentiment
      if (sentimentScore > 0.7) {
        updates.energy = 'high';
      } else if (sentimentScore < -0.3) {
        updates.energy = 'low';
      }
      
      // Update tone based on user's emotional tone
      if (intent.emotional_tone === 'excited' || intent.emotional_tone === 'happy') {
        updates.tone = 'playful';
      } else if (intent.emotional_tone === 'calm' || intent.emotional_tone === 'peaceful') {
        updates.tone = 'calm';
      } else if (intent.emotional_tone === 'mysterious' || intent.emotional_tone === 'thoughtful') {
        updates.tone = 'mystical';
      }
      
      // Update user keywords
      if (keywords.length > 0) {
        updates.userKeywords = [...(updates.userKeywords || []), ...keywords].slice(0, 20); // Keep last 20 keywords
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        // For now, just log the updates - in a real implementation, 
        // we'd need to modify the personality service to accept updates
        logger.info(`Personality updates for user ${userId}:`, updates);
      }
    } catch (error) {
      logger.error('Personality update error:', error);
    }
  }

  private getMoodDescription(moodScore: number): string {
    if (moodScore >= 80) return 'very happy and energetic';
    if (moodScore >= 60) return 'happy and playful';
    if (moodScore >= 40) return 'calm and content';
    if (moodScore >= 20) return 'a bit tired or thoughtful';
    return 'sleepy or confused';
  }

  private getEnergyLevel(moodScore: number): string {
    if (moodScore >= 70) return 'high';
    if (moodScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Generate daily challenge suggestions
   */
  async generateDailyChallenge(creatureStage: string, userPreferences?: string[]): Promise<string> {
    try {
      const stageChallenges = {
        'EGG': 'Simple awareness and connection tasks',
        'HATCHLING': 'Basic interaction and exploration tasks',
        'JUVENILE': 'Learning and growth-oriented challenges',
        'ASCENDED': 'Wisdom and guidance-based tasks',
        'CELESTIAL': 'Transcendent and cosmic challenges'
      };

      const prompt = `Generate a creative daily challenge for a ${creatureStage} creature in the QUIB game. 
      The challenge should be: ${stageChallenges[creatureStage as keyof typeof stageChallenges]}.
      Make it engaging, achievable, and related to personal growth or creativity.
      Return only the challenge description, no additional text.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      });

      return completion.choices[0]?.message?.content || 'Complete a small act of kindness today.';
    } catch (error) {
      logger.error('Daily challenge generation error:', error);
      return 'Complete a small act of kindness today.';
    }
  }

  /**
   * Generate evolution celebration message
   */
  async generateEvolutionMessage(fromStage: string, toStage: string): Promise<string> {
    try {
      const prompt = `Generate a celebratory message for a creature evolving from ${fromStage} to ${toStage} in the QUIB game.
      The message should be inspiring, mystical, and acknowledge the growth and transformation.
      Keep it concise (1-2 sentences) and magical.
      Return only the message, no additional text.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 80,
        temperature: 0.9
      });

      return completion.choices[0]?.message?.content || 'Congratulations! Your creature has evolved and grown stronger!';
    } catch (error) {
      logger.error('Evolution message generation error:', error);
      return 'Congratulations! Your creature has evolved and grown stronger!';
    }
  }
}

export const aiService = new AIService();
