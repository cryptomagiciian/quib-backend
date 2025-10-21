import { PrismaClient } from '@prisma/client';
import { config } from './environment';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Only initialize Prisma if not in hybrid mode or if DATABASE_URL is provided
let prisma: PrismaClient | null = null;

if (!config.hybridMode && config.databaseUrl) {
  prisma = globalThis.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma;
  }
} else if (config.hybridMode) {
  console.log('🚀 Hybrid mode: Database operations handled by Lovable/Supabase');
}

export { prisma };
export default prisma;
