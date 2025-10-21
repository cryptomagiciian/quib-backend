import { ethers } from 'ethers';
import { config } from '../config/environment';
import prisma from '../config/database';
import logger from '../utils/logger';

// ERC-20 ABI for token interactions
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)'
];

export class TokenService {
  private provider: ethers.JsonRpcProvider;
  private tokenContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.bnbRpcUrl);
    this.tokenContract = new ethers.Contract(
      config.tokenContractAddress,
      ERC20_ABI,
      this.provider
    );
  }

  /**
   * Get token balance for a wallet address
   */
  async getTokenBalance(walletAddress: string): Promise<string> {
    try {
      const balance = await this.tokenContract.balanceOf(walletAddress);
      const decimals = await this.tokenContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return formattedBalance;
    } catch (error) {
      logger.error('Error getting token balance:', error);
      throw new Error('Failed to fetch token balance');
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    contractAddress: string;
  }> {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.tokenContract.name(),
        this.tokenContract.symbol(),
        this.tokenContract.decimals(),
        this.tokenContract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        contractAddress: config.tokenContractAddress
      };
    } catch (error) {
      logger.error('Error getting token info:', error);
      throw new Error('Failed to fetch token information');
    }
  }

  /**
   * Create a token claim for a user
   */
  async createTokenClaim(userId: string, amount: string): Promise<void> {
    try {
      await prisma.tokenClaim.create({
        data: {
          userId,
          amount,
          claimed: false
        }
      });

      logger.info(`Token claim created for user ${userId}: ${amount} tokens`);
    } catch (error) {
      logger.error('Error creating token claim:', error);
      throw new Error('Failed to create token claim');
    }
  }

  /**
   * Get pending token claims for a user
   */
  async getPendingClaims(userId: string): Promise<Array<{
    id: string;
    amount: string;
    createdAt: Date;
  }>> {
    try {
      const claims = await prisma.tokenClaim.findMany({
        where: {
          userId,
          claimed: false
        },
        select: {
          id: true,
          amount: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return claims;
    } catch (error) {
      logger.error('Error getting pending claims:', error);
      throw new Error('Failed to fetch pending claims');
    }
  }

  /**
   * Get total claimable amount for a user
   */
  async getTotalClaimableAmount(userId: string): Promise<string> {
    try {
      const claims = await prisma.tokenClaim.findMany({
        where: {
          userId,
          claimed: false
        },
        select: {
          amount: true
        }
      });

      // Sum all pending amounts
      const totalAmount = claims.reduce((sum, claim) => {
        return sum + BigInt(claim.amount);
      }, BigInt(0));

      return totalAmount.toString();
    } catch (error) {
      logger.error('Error calculating total claimable amount:', error);
      throw new Error('Failed to calculate claimable amount');
    }
  }

  /**
   * Verify wallet signature for token claim
   */
  async verifyClaimSignature(
    walletAddress: string,
    amount: string,
    signature: string
  ): Promise<boolean> {
    try {
      // Create message that was signed
      const message = `Claim ${amount} QUIB tokens for ${walletAddress}`;
      
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      logger.error('Error verifying claim signature:', error);
      return false;
    }
  }

  /**
   * Process token claim (mark as claimed)
   */
  async processTokenClaim(
    claimId: string,
    txHash: string,
    walletAddress: string
  ): Promise<void> {
    try {
      const claim = await prisma.tokenClaim.findUnique({
        where: { id: claimId },
        include: { user: true }
      });

      if (!claim) {
        throw new Error('Token claim not found');
      }

      if (claim.claimed) {
        throw new Error('Token claim already processed');
      }

      if (claim.user.wallet?.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Wallet address mismatch');
      }

      await prisma.tokenClaim.update({
        where: { id: claimId },
        data: {
          claimed: true,
          claimedAt: new Date(),
          txHash
        }
      });

      logger.info(`Token claim processed: ${claimId} for ${walletAddress}`);
    } catch (error) {
      logger.error('Error processing token claim:', error);
      throw new Error('Failed to process token claim');
    }
  }

  /**
   * Get claim history for a user
   */
  async getClaimHistory(userId: string): Promise<Array<{
    id: string;
    amount: string;
    claimed: boolean;
    claimedAt?: Date;
    txHash?: string;
    createdAt: Date;
  }>> {
    try {
      const claims = await prisma.tokenClaim.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          claimed: true,
          claimedAt: true,
          txHash: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return claims;
    } catch (error) {
      logger.error('Error getting claim history:', error);
      throw new Error('Failed to fetch claim history');
    }
  }

  /**
   * Calculate token rewards based on creature stage
   */
  calculateStageReward(stage: string): string {
    const rewards = {
      'EGG': '0',
      'HATCHLING': '100',
      'JUVENILE': '500',
      'ASCENDED': '2000',
      'CELESTIAL': '10000'
    };

    return rewards[stage as keyof typeof rewards] || '0';
  }

  /**
   * Check if user has sufficient balance for operations
   */
  async hasSufficientBalance(walletAddress: string, requiredAmount: string): Promise<boolean> {
    try {
      const balance = await this.getTokenBalance(walletAddress);
      return BigInt(balance) >= BigInt(requiredAmount);
    } catch (error) {
      logger.error('Error checking balance:', error);
      return false;
    }
  }
}

export const tokenService = new TokenService();
