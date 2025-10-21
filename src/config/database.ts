import { PrismaClient } from '@prisma/client';
import { config } from './environment';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Initialize Prisma in standalone mode
let prisma: PrismaClient | null = null;

if (!config.hybridMode && config.databaseUrl) {
  prisma = globalThis.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma;
  }
  console.log('🚀 Database connected in standalone mode');
} else if (config.hybridMode) {
  console.log('🚀 Hybrid mode: Database operations handled by Lovable/Supabase');
} else {
  console.log('⚠️ No database URL provided - database features disabled');
}

export { prisma };
export default prisma;
