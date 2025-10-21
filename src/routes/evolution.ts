import { Router } from 'express';
import { evolutionController } from '../controllers/evolutionController';
import { authenticateToken, requireDevWallet } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { evolutionTestLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get('/stages', evolutionController.getEvolutionStages);

// Protected routes
router.use(authenticateToken);

router.get('/requirements', evolutionController.checkEvolutionRequirements);
router.get('/history', 
  validate(schemas.pagination),
  evolutionController.getEvolutionHistory
);

// Dev/Test routes
router.post('/test',
  evolutionTestLimiter,
  requireDevWallet,
  validate(schemas.evolutionTest),
  evolutionController.triggerEvolutionTest
);

export default router;
