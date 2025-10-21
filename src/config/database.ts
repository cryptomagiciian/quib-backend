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
  
  // Test database connection
  prisma.$connect()
    .then(() => {
      console.log('🚀 Database connected in standalone mode');
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message);
      console.log('🔧 Make sure DATABASE_URL is correct and database exists');
    });
} else if (config.hybridMode) {
  console.log('🚀 Hybrid mode: Database operations handled by Lovable/Supabase');
} else {
  console.log('⚠️ No database URL provided - database features disabled');
}

export { prisma };
export default prisma;
