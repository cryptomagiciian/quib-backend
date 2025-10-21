// Updated Creature Service for Lovable Edge Functions
import { apiConfig, getAuthHeaders, handleApiResponse } from '../config/api';

export class CreatureService {
  // Get creature state via sync-creature edge function
  static async getCreatureState() {
    try {
      const response = await fetch(`${apiConfig.baseURL}/sync-creature`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.creature : null;
    } catch (error) {
      console.error('Failed to get creature state:', error);
      throw error;
    }
  }

  // Get personality profile via sync-creature edge function
  static async getPersonalityProfile() {
    try {
      const response = await fetch(`${apiConfig.baseURL}/sync-creature`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.creature.personality_profile : null;
    } catch (error) {
      console.error('Failed to get personality profile:', error);
      throw error;
    }
  }

  // Get visual traits via sync-creature edge function
  static async getVisualTraits() {
    try {
      const response = await fetch(`${apiConfig.baseURL}/sync-creature`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.creature.visual_traits : null;
    } catch (error) {
      console.error('Failed to get visual traits:', error);
      throw error;
    }
  }

  // Chat with creature via proxy-chat edge function
  static async chatWithCreature(message) {
    try {
      const response = await fetch(`${apiConfig.baseURL}/proxy-chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to chat with creature:', error);
      throw error;
    }
  }

  // Submit task via proxy-tasks edge function
  static async submitTask(taskType, title, description) {
    try {
      const response = await fetch(`${apiConfig.baseURL}/proxy-tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ taskType, title, description }),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to submit task:', error);
      throw error;
    }
  }

  // Get chat memories via proxy-chat edge function
  static async getChatMemories(limit = 20) {
    try {
      const response = await fetch(`${apiConfig.baseURL}/proxy-chat?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.memories : [];
    } catch (error) {
      console.error('Failed to get chat memories:', error);
      throw error;
    }
  }

  // Get daily challenge via proxy-tasks edge function
  static async getDailyChallenge() {
    try {
      const response = await fetch(`${apiConfig.baseURL}/proxy-tasks`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.challenge : null;
    } catch (error) {
      console.error('Failed to get daily challenge:', error);
      throw error;
    }
  }
}
