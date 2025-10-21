import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for chat endpoints
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: {
    success: false,
    error: 'Too many chat messages, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for evolution test endpoints
 */
export const evolutionTestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 test evolutions per minute
  message: {
    success: false,
    error: 'Too many evolution test requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
