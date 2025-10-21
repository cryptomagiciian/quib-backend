import { Router } from 'express';
import { tokenController } from '../controllers/tokenController';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/info', tokenController.getTokenInfo);
router.get('/stage-rewards', tokenController.getStageRewards);

// Protected routes
router.use(authenticateToken);

router.get('/balance', tokenController.getTokenBalance);
router.get('/pending-claims', tokenController.getPendingClaims);
router.get('/claim-history', tokenController.getClaimHistory);

router.post('/claim',
  validate(schemas.tokenClaim),
  tokenController.claimTokenReward
);

export default router;
