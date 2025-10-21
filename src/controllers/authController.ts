import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import prisma from '../config/database';
import { generateToken } from '../middleware/auth';
import { schemas } from '../middleware/validation';
import { creatureService } from '../services/creatureService';
import logger from '../utils/logger';

export class AuthController {
  /**
   * Register new user (traditional auth)
   */
  async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email or username already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          username: true,
          wallet: true,
          createdAt: true
        }
      });

      // Create creature for new user with personality and visual traits
      await creatureService.createCreature(user.id);

      // Generate token
      const token = generateToken(user);

      logger.info(`New user registered: ${user.email || user.username}`);

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }

  /**
   * Login user (traditional auth)
   */
  async login(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;

      // Find user
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (!user || !user.password) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        wallet: user.wallet
      });

      logger.info(`User logged in: ${user.email || user.username}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            wallet: user.wallet,
            createdAt: user.createdAt
          },
          token
        },
        message: 'Login successful'
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  /**
   * Wallet login/register
   */
  async walletAuth(req: Request, res: Response) {
    try {
      const { message, signature, address } = req.body;

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { wallet: address.toLowerCase() },
        select: {
          id: true,
          email: true,
          username: true,
          wallet: true,
          createdAt: true
        }
      });

      const isNewUser = !user;

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            wallet: address.toLowerCase()
          },
          select: {
            id: true,
            email: true,
            username: true,
            wallet: true,
            createdAt: true
          }
        });

        // Create creature for new user with personality and visual traits
        await creatureService.createCreature(user.id);

        logger.info(`New wallet user created: ${address}`);
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        data: {
          user,
          token,
          isNewUser
        },
        message: isNewUser ? 'Wallet registered successfully' : 'Wallet login successful'
      });
    } catch (error) {
      logger.error('Wallet auth error:', error);
      res.status(500).json({
        success: false,
        error: 'Wallet authentication failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          username: true,
          wallet: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const { email, username } = req.body;
      const userId = req.user!.id;

      // Check if email/username is already taken by another user
      if (email || username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: userId } },
              {
                OR: [
                  ...(email ? [{ email }] : []),
                  ...(username ? [{ username }] : [])
                ]
              }
            ]
          }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'Email or username already taken'
          });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(email && { email }),
          ...(username && { username })
        },
        select: {
          id: true,
          email: true,
          username: true,
          wallet: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: { user: updatedUser },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  /**
   * Change password (for traditional auth users)
   */
  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user || !user.password) {
        return res.status(400).json({
          success: false,
          error: 'Password change not available for wallet users'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      logger.info(`Password changed for user: ${userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  }
}

export const authController = new AuthController();
