import { EvolutionStage, TaskType } from '@prisma/client';

export interface AuthUser {
  id: string;
  wallet?: string;
  email?: string;
  username?: string;
}

export interface JwtPayload {
  userId: string;
  wallet?: string;
  email?: string;
  username?: string;
  iat?: number;
  exp?: number;
}

export interface WalletSignature {
  message: string;
  signature: string;
  address: string;
}

export interface EvolutionRequirements {
  dailyChallenges: number;
  chatInteractions: number;
  accountAgeHours: number;
  moodScore?: number;
}

export interface CreatureState {
  id: string;
  currentStage: EvolutionStage;
  moodScore: number;
  xp: number;
  lastEvolution?: Date;
  canEvolve: boolean;
  evolutionRequirements: EvolutionRequirements;
}

export interface ChatMessage {
  message: string;
  response?: string;
  sentimentScore?: number;
  timestamp: Date;
}

export interface TokenReward {
  amount: string;
  stage: EvolutionStage;
  claimed: boolean;
}

export interface EvolutionTestData {
  userId: string;
  targetStage: EvolutionStage;
  overrideTimeGates: boolean;
  mockRequirements: Partial<EvolutionRequirements>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Evolution stage progression
export const EVOLUTION_STAGES: EvolutionStage[] = [
  EvolutionStage.EGG,
  EvolutionStage.HATCHLING,
  EvolutionStage.JUVENILE,
  EvolutionStage.ASCENDED,
  EvolutionStage.CELESTIAL
];

// Evolution requirements for each stage
export const EVOLUTION_REQUIREMENTS: Record<EvolutionStage, EvolutionRequirements> = {
  [EvolutionStage.EGG]: {
    dailyChallenges: 0,
    chatInteractions: 0,
    accountAgeHours: 0
  },
  [EvolutionStage.HATCHLING]: {
    dailyChallenges: 0,
    chatInteractions: 0,
    accountAgeHours: 0
  },
  [EvolutionStage.JUVENILE]: {
    dailyChallenges: 3,
    chatInteractions: 15,
    accountAgeHours: 48
  },
  [EvolutionStage.ASCENDED]: {
    dailyChallenges: 7,
    chatInteractions: 0,
    accountAgeHours: 168, // 7 days
    moodScore: 75
  },
  [EvolutionStage.CELESTIAL]: {
    dailyChallenges: 15,
    chatInteractions: 50,
    accountAgeHours: 720, // 30 days
    moodScore: 90
  }
};

// Token rewards for each evolution stage
export const TOKEN_REWARDS: Record<EvolutionStage, string> = {
  [EvolutionStage.EGG]: '0',
  [EvolutionStage.HATCHLING]: '100',
  [EvolutionStage.JUVENILE]: '500',
  [EvolutionStage.ASCENDED]: '2000',
  [EvolutionStage.CELESTIAL]: '10000'
};
