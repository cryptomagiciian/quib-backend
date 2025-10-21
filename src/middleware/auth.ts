import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { config } from '../config/environment';
import { JwtPayload, AuthUser } from '../types';
import prisma from '../config/database';
import logger from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Middleware to verify JWT token
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, wallet: true, email: true, username: true }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

/**
 * Middleware to verify wallet signature
 */
export const verifyWalletSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, signature, address } = req.body;

    if (!message || !signature || !address) {
      return res.status(400).json({
        success: false,
        error: 'Message, signature, and address are required'
      });
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { wallet: address.toLowerCase() },
      select: { id: true, wallet: true, email: true, username: true }
    });

    if (!user) {
      // Create new user with wallet
      user = await prisma.user.create({
        data: {
          wallet: address.toLowerCase(),
        },
        select: { id: true, wallet: true, email: true, username: true }
      });

      // Create creature for new user
      await prisma.creature.create({
        data: {
          userId: user.id,
          currentStage: 'HATCHLING'
        }
      });

      logger.info(`New user created with wallet: ${address}`);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Wallet signature verification failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid wallet signature'
    });
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user: AuthUser): string => {
  const payload: JwtPayload = {
    userId: user.id,
    wallet: user.wallet,
    email: user.email,
    username: user.username
  };

  return jwt.sign(payload, config.jwtSecret, { 
    expiresIn: config.jwtExpiresIn 
  });
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, wallet: true, email: true, username: true }
      });

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  
  next();
};

/**
 * Check if user is a dev wallet (for testing endpoints)
 */
export const requireDevWallet = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!config.enableEvolutionTest) {
    return res.status(403).json({
      success: false,
      error: 'Evolution testing is disabled'
    });
  }

  if (!req.user?.wallet || !config.devWallets.includes(req.user.wallet.toLowerCase())) {
    return res.status(403).json({
      success: false,
      error: 'Dev wallet access required'
    });
  }

  next();
};
