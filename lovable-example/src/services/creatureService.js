// Creature Service
import { apiConfig, getAuthHeaders, handleApiResponse } from '../config/api';

export class CreatureService {
  static async getCreatureState() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseURL}/creature/state`, {
        headers: getAuthHeaders(token),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.creature : null;
    } catch (error) {
      console.error('Failed to get creature state:', error);
      throw error;
    }
  }

  static async getPersonalityProfile() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseURL}/creature/personality`, {
        headers: getAuthHeaders(token),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.personality : null;
    } catch (error) {
      console.error('Failed to get personality profile:', error);
      throw error;
    }
  }

  static async getVisualTraits() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseURL}/creature/visual-traits`, {
        headers: getAuthHeaders(token),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.visualTraits : null;
    } catch (error) {
      console.error('Failed to get visual traits:', error);
      throw error;
    }
  }

  static async chatWithCreature(message) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseURL}/creature/chat`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ message }),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to chat with creature:', error);
      throw error;
    }
  }

  static async submitTask(taskType, title, description) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseURL}/creature/submit-task`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ taskType, title, description }),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to submit task:', error);
      throw error;
    }
  }

  static async getChatMemories(limit = 20) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseURL}/creature/chat-memories?limit=${limit}`, {
        headers: getAuthHeaders(token),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.memories : [];
    } catch (error) {
      console.error('Failed to get chat memories:', error);
      throw error;
    }
  }

  static async getDailyChallenge() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseURL}/creature/daily-challenge`, {
        headers: getAuthHeaders(token),
      });
      
      const data = await handleApiResponse(response);
      return data.success ? data.data.challenge : null;
    } catch (error) {
      console.error('Failed to get daily challenge:', error);
      throw error;
    }
  }
}
