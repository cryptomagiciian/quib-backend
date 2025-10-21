import { Router } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { authController } from '../controllers/authController';
import { authenticateToken, verifyWalletSignature } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';
import { config } from '../config/environment';

const router = Router();

// Public routes
router.post('/register', 
  authLimiter,
  validate(schemas.userRegistration),
  authController.register
);

router.post('/login', 
  authLimiter,
  validate(schemas.userLogin),
  authController.login
);

router.post('/wallet-auth',
  authLimiter,
  validate(schemas.walletSignature),
  verifyWalletSignature,
  authController.walletAuth
);

// Simple login for Lovable frontend (secure for production)
router.post('/lovable-login', (req, res) => {
  try {
    const { userId, username } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({
        success: false,
        error: 'User ID and username are required'
      });
    }

    // Create a JWT token for the user
    const token = jwt.sign(
      { 
        id: userId, 
        username: username,
        type: 'lovable-user'
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          username: username
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create token'
    });
  }
});

// Protected routes
router.get('/profile', 
  authenticateToken,
  authController.getProfile
);

router.put('/profile', 
  authenticateToken,
  validate(Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    wallet: Joi.string().optional()
  })),
  authController.updateProfile
);

router.post('/change-password',
  authenticateToken,
  validate(Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })),
  authController.changePassword
);

export default router;
