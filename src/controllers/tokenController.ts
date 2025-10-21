import { Request, Response } from 'express';
import { tokenService } from '../services/tokenService';
import { creatureService } from '../services/creatureService';
import { schemas } from '../middleware/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../utils/logger';

export class TokenController {
  /**
   * Get token balance for user's wallet
   */
  async getTokenBalance(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user.wallet) {
        return res.status(400).json({
          success: false,
          error: 'No wallet address associated with user'
        });
      }

      const balance = await tokenService.getTokenBalance(req.user.wallet);

      res.json({
        success: true,
        data: { balance }
      });
    } catch (error) {
      logger.error('Get token balance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch token balance'
      });
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(req: Request, res: Response) {
    try {
      const tokenInfo = await tokenService.getTokenInfo();

      res.json({
        success: true,
        data: { tokenInfo }
      });
    } catch (error) {
      logger.error('Get token info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch token information'
      });
    }
  }

  /**
   * Get pending token claims
   */
  async getPendingClaims(req: AuthenticatedRequest, res: Response) {
    try {
      const claims = await tokenService.getPendingClaims(req.user.id);
      const totalClaimable = await tokenService.getTotalClaimableAmount(req.user.id);

      res.json({
        success: true,
        data: {
          claims,
          totalClaimable
        }
      });
    } catch (error) {
      logger.error('Get pending claims error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending claims'
      });
    }
  }

  /**
   * Claim token reward
   */
  async claimTokenReward(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount, signature } = req.body;
      const userId = req.user.id;

      if (!req.user.wallet) {
        return res.status(400).json({
          success: false,
          error: 'No wallet address associated with user'
        });
      }

      // Verify signature
      const isValidSignature = await tokenService.verifyClaimSignature(
        req.user.wallet,
        amount,
        signature
      );

      if (!isValidSignature) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      // Check if user has pending claims for this amount
      const pendingClaims = await tokenService.getPendingClaims(userId);
      const claimExists = pendingClaims.some(claim => claim.amount === amount);

      if (!claimExists) {
        return res.status(400).json({
          success: false,
          error: 'No pending claim found for this amount'
        });
      }

      // For now, we'll mark the claim as processed
      // In a real implementation, this would trigger an actual token transfer
      const claim = pendingClaims.find(c => c.amount === amount);
      if (claim) {
        await tokenService.processTokenClaim(
          claim.id,
          '0x' + Math.random().toString(16).substr(2, 64), // Mock tx hash
          req.user.wallet
        );
      }

      logger.info(`Token claim processed: ${amount} tokens for user ${userId}`);

      res.json({
        success: true,
        data: {
          amount,
          txHash: '0x' + Math.random().toString(16).substr(2, 64)
        },
        message: 'Token claim processed successfully'
      });
    } catch (error) {
      logger.error('Claim token reward error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process token claim'
      });
    }
  }

  /**
   * Get claim history
   */
  async getClaimHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const claims = await tokenService.getClaimHistory(req.user.id);

      res.json({
        success: true,
        data: { claims }
      });
    } catch (error) {
      logger.error('Get claim history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch claim history'
      });
    }
  }

  /**
   * Get token rewards for creature stage
   */
  async getStageRewards(req: Request, res: Response) {
    try {
      const rewards = {
        'EGG': tokenService.calculateStageReward('EGG'),
        'HATCHLING': tokenService.calculateStageReward('HATCHLING'),
        'JUVENILE': tokenService.calculateStageReward('JUVENILE'),
        'ASCENDED': tokenService.calculateStageReward('ASCENDED'),
        'CELESTIAL': tokenService.calculateStageReward('CELESTIAL')
      };

      res.json({
        success: true,
        data: { rewards }
      });
    } catch (error) {
      logger.error('Get stage rewards error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stage rewards'
      });
    }
  }
}

export const tokenController = new TokenController();
