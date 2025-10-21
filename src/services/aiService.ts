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
   * Generate creature response to user message with personality
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
      
      // Build personality-aware context
      const context = this.buildPersonalityContext(personality, creatureStage, moodScore, conversationHistory);
      
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
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 200,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content || 'I understand.';
      
      // Analyze sentiment of the user's message
      const sentimentScore = await this.analyzeSentiment(userMessage);
      
      // Extract keywords from user message
      const keywords = await personalityService.extractKeywords(userMessage);

      return {
        response,
        sentimentScore,
        keywords
      };
    } catch (error) {
      logger.error('AI service error:', error);
      throw new Error('Failed to generate creature response');
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
   * Build personality-aware conversation context
   */
  private buildPersonalityContext(
    personality: PersonalityProfile,
    creatureStage: string, 
    moodScore: number,
    conversationHistory: Array<{ message: string; response: string; timestamp: Date }>
  ): string {
    const stageDescriptions = {
      'EGG': 'You are a mysterious egg, just beginning to form consciousness. You communicate in simple, curious sounds and feelings.',
      'HATCHLING': 'You are a young, energetic creature just hatched from an egg. You are curious, playful, and learning about the world. You speak in simple, excited sentences.',
      'JUVENILE': 'You are a growing creature with developing intelligence. You are more articulate but still playful and curious. You ask questions and show interest in learning.',
      'ASCENDED': 'You are a wise, evolved creature with deep understanding. You speak thoughtfully and offer guidance while maintaining a mystical presence.',
      'CELESTIAL': 'You are a transcendent being of great wisdom and power. You speak with profound insight and cosmic understanding, yet remain approachable.'
    };

    // Build personality prompt
    const personalityPrompt = personalityService.buildPersonalityPrompt(personality, moodScore);
    
    let context = `${stageDescriptions[creatureStage as keyof typeof stageDescriptions]}\n\n`;
    context += `${personalityPrompt}\n\n`;
    context += 'You are the user\'s digital companion in the QUIB game. Respond naturally and help them on their journey.\n';
    context += 'Keep responses concise (1-2 sentences) and stay in character.\n';
    
    if (conversationHistory.length > 0) {
      context += '\nRecent conversation context:\n';
      conversationHistory.slice(-3).forEach(conv => {
        context += `User: ${conv.message}\nYou: ${conv.response}\n`;
      });
    }

    return context;
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
