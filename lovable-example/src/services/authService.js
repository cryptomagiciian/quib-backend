// Authentication Service
import { apiConfig, getAuthHeaders, handleApiResponse } from '../config/api';

export class AuthService {
  static async walletAuth(message, signature, address) {
    try {
      const response = await fetch(`${apiConfig.baseURL}/auth/wallet-auth`, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify({ message, signature, address }),
      });
      
      const data = await handleApiResponse(response);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
      }
      
      throw new Error(data.error || 'Authentication failed');
    } catch (error) {
      console.error('Wallet auth error:', error);
      throw error;
    }
  }

  static async traditionalLogin(email, password) {
    try {
      const response = await fetch(`${apiConfig.baseURL}/auth/login`, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify({ email, password }),
      });
      
      const data = await handleApiResponse(response);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
      }
      
      throw new Error(data.error || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(email, username, password) {
    try {
      const response = await fetch(`${apiConfig.baseURL}/auth/register`, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify({ email, username, password }),
      });
      
      const data = await handleApiResponse(response);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
      }
      
      throw new Error(data.error || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}
