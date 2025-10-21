import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // BNB Chain
  bnbRpcUrl: process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org/',
  bnbChainId: parseInt(process.env.BNB_CHAIN_ID || '56', 10),
  
  // Token
  tokenContractAddress: process.env.TOKEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  tokenDecimals: parseInt(process.env.TOKEN_DECIMALS || '18', 10),
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Development
  devWallets: process.env.DEV_WALLETS?.split(',').map(w => w.trim()) || [],
  enableEvolutionTest: process.env.ENABLE_EVOLUTION_TEST === 'true',
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Warn about missing optional variables
if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY not set. AI features will not work.');
}

export default config;
