// Updated Auth Service for Lovable Supabase Auth
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class AuthService {
  // Traditional email/password login
  static async traditionalLogin(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user
  static async register(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Wallet authentication (for future use)
  static async walletAuth(message, signature, address) {
    try {
      // This would integrate with your backend's wallet auth
      // For now, we'll use a placeholder
      const response = await fetch('/api/auth/wallet-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature, address }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Wallet authentication failed');
      }

      return data.data;
    } catch (error) {
      console.error('Wallet auth error:', error);
      throw error;
    }
  }

  // Get current user
  static getCurrentUser() {
    return supabase.auth.getUser();
  }

  // Get current session
  static getCurrentSession() {
    return supabase.auth.getSession();
  }

  // Logout
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
