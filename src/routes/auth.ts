import { Router } from 'express';
import Joi from 'joi';
import { authController } from '../controllers/authController';
import { authenticateToken, verifyWalletSignature } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

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
