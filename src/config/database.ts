import { PrismaClient } from '@prisma/client';
import { config } from './environment';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Initialize Prisma in standalone mode
let prisma: PrismaClient | null = null;

if (!config.hybridMode) {
  prisma = globalThis.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma;
  }
} else {
  console.log('🚀 Hybrid mode: Database operations handled by Lovable/Supabase');
}

export { prisma };
export default prisma;
