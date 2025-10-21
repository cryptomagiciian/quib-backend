import { EvolutionStage } from '@prisma/client';

/**
 * Format token amount with proper decimals
 */
export const formatTokenAmount = (amount: string, decimals: number = 18): string => {
  const num = parseFloat(amount);
  return num.toFixed(decimals);
};

/**
 * Convert sentiment score to mood percentage
 */
export const sentimentToMood = (sentiment: number): number => {
  // Convert from -1 to 1 range to 0 to 100 range
  return Math.max(0, Math.min(100, (sentiment + 1) * 50));
};

/**
 * Convert mood percentage to sentiment score
 */
export const moodToSentiment = (mood: number): number => {
  // Convert from 0 to 100 range to -1 to 1 range
  return (mood / 50) - 1;
};

/**
 * Calculate XP required for next evolution stage
 */
export const calculateXPForStage = (stage: EvolutionStage): number => {
  const xpRequirements = {
    [EvolutionStage.EGG]: 0,
    [EvolutionStage.HATCHLING]: 100,
    [EvolutionStage.JUVENILE]: 500,
    [EvolutionStage.ASCENDED]: 2000,
    [EvolutionStage.CELESTIAL]: 10000
  };

  return xpRequirements[stage];
};

/**
 * Get evolution stage display name
 */
export const getStageDisplayName = (stage: EvolutionStage): string => {
  const displayNames = {
    [EvolutionStage.EGG]: 'Mystical Egg',
    [EvolutionStage.HATCHLING]: 'Curious Hatchling',
    [EvolutionStage.JUVENILE]: 'Growing Juvenile',
    [EvolutionStage.ASCENDED]: 'Wise Ascended',
    [EvolutionStage.CELESTIAL]: 'Transcendent Celestial'
  };

  return displayNames[stage];
};

/**
 * Get evolution stage description
 */
export const getStageDescription = (stage: EvolutionStage): string => {
  const descriptions = {
    [EvolutionStage.EGG]: 'A mysterious egg pulsing with potential energy.',
    [EvolutionStage.HATCHLING]: 'A young, energetic creature just beginning to explore the world.',
    [EvolutionStage.JUVENILE]: 'A growing creature developing intelligence and wisdom.',
    [EvolutionStage.ASCENDED]: 'A wise, evolved being with deep understanding.',
    [EvolutionStage.CELESTIAL]: 'A transcendent entity of cosmic power and wisdom.'
  };

  return descriptions[stage];
};

/**
 * Validate wallet address format
 */
export const isValidWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Generate random nonce for wallet authentication
 */
export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Calculate time difference in hours
 */
export const getTimeDifferenceInHours = (date1: Date, date2: Date): number => {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60));
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate unique task ID
 */
export const generateTaskId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Check if evolution is possible
 */
export const canEvolveToStage = (
  currentStage: EvolutionStage,
  targetStage: EvolutionStage
): boolean => {
  const stages = [
    EvolutionStage.EGG,
    EvolutionStage.HATCHLING,
    EvolutionStage.JUVENILE,
    EvolutionStage.ASCENDED,
    EvolutionStage.CELESTIAL
  ];

  const currentIndex = stages.indexOf(currentStage);
  const targetIndex = stages.indexOf(targetStage);

  return targetIndex > currentIndex;
};

/**
 * Get next evolution stage
 */
export const getNextEvolutionStage = (currentStage: EvolutionStage): EvolutionStage | null => {
  const stages = [
    EvolutionStage.EGG,
    EvolutionStage.HATCHLING,
    EvolutionStage.JUVENILE,
    EvolutionStage.ASCENDED,
    EvolutionStage.CELESTIAL
  ];

  const currentIndex = stages.indexOf(currentStage);
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
};
