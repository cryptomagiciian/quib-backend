# QUIB Backend Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key
- BNB Chain RPC access
- ERC-20 token contract address

### Environment Variables
Copy `env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/quib_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# BNB Chain Configuration
BNB_RPC_URL="https://bsc-dataseed.binance.org/"
BNB_CHAIN_ID=56

# Fourmeme Token Configuration
TOKEN_CONTRACT_ADDRESS="0x..."
TOKEN_DECIMALS=18

# Development
NODE_ENV="production"
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Dev/Test Wallets (comma-separated)
DEV_WALLETS="0x123...,0x456..."

# Evolution Test Override
ENABLE_EVOLUTION_TEST=false
```

## 🐳 Docker Deployment

### Build and Run
```bash
# Build the image
docker build -t quib-backend .

# Run with environment file
docker run -p 3000:3000 --env-file .env quib-backend

# Run with docker-compose
docker-compose up -d
```

### Docker Compose
```yaml
version: '3.8'
services:
  quib-backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - TOKEN_CONTRACT_ADDRESS=${TOKEN_CONTRACT_ADDRESS}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=quib
      - POSTGRES_USER=quib_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

## ☁️ Vercel Deployment

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing QUIB backend

### 2. Configure Build Settings
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Production |
| `JWT_SECRET` | Random secure string | Production |
| `OPENAI_API_KEY` | Your OpenAI API key | Production |
| `TOKEN_CONTRACT_ADDRESS` | Your ERC-20 contract address | Production |
| `NODE_ENV` | `production` | Production |
| `BNB_RPC_URL` | `https://bsc-dataseed.binance.org/` | Production |
| `BNB_CHAIN_ID` | `56` | Production |
| `TOKEN_DECIMALS` | `18` | Production |

### 4. Deploy
- Click "Deploy"
- Vercel will automatically build and deploy your application
- Your API will be available at `https://your-project.vercel.app/api`

## 🎯 Render Deployment

### 1. Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Select the repository containing QUIB backend

### 2. Configure Service
- **Name**: `quib-backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free or Starter

### 3. Set Environment Variables
In Render dashboard, go to Environment:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Random secure string |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `TOKEN_CONTRACT_ADDRESS` | Your ERC-20 contract address |
| `BNB_RPC_URL` | `https://bsc-dataseed.binance.org/` |
| `BNB_CHAIN_ID` | `56` |
| `TOKEN_DECIMALS` | `18` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `ENABLE_EVOLUTION_TEST` | `false` |

### 4. Create Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Name: `quib-db`
3. Plan: Free or Starter
4. Copy the connection string to `DATABASE_URL`

### 5. Deploy
- Click "Create Web Service"
- Render will build and deploy your application
- Your API will be available at `https://your-service.onrender.com/api`

## 🗄️ Database Setup

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE quib_db;

-- Create user
CREATE USER quib_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE quib_db TO quib_user;
```

### Run Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or push schema (development)
npx prisma db push
```

## 🔧 Production Configuration

### Security Checklist
- [ ] Set strong `JWT_SECRET`
- [ ] Use HTTPS in production
- [ ] Configure CORS for your frontend domain
- [ ] Set up rate limiting
- [ ] Enable helmet security headers
- [ ] Use environment variables for all secrets
- [ ] Disable evolution testing in production
- [ ] Set up proper logging
- [ ] Configure database connection pooling

### Performance Optimization
- [ ] Enable database connection pooling
- [ ] Set up Redis for session storage (optional)
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and alerting
- [ ] Use PM2 for process management (if not using container)

### Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start dist/index.js --name quib-backend

# Monitor
pm2 monit

# Logs
pm2 logs quib-backend
```

## 🧪 Testing Deployment

### Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "QUIB Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Test Authentication
```bash
# Test wallet authentication
curl -X POST https://your-domain.com/api/auth/wallet-auth \
  -H "Content-Type: application/json" \
  -d '{
    "message": "test message",
    "signature": "0x...",
    "address": "0x..."
  }'
```

### Test Creature Endpoints
```bash
# Get creature state (requires authentication)
curl -X GET https://your-domain.com/api/creature/state \
  -H "Authorization: Bearer <token>"
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
- Check `DATABASE_URL` format
- Ensure database is accessible from deployment environment
- Verify database credentials

#### OpenAI API Errors
- Verify `OPENAI_API_KEY` is correct
- Check API key permissions
- Ensure sufficient API credits

#### Token Contract Issues
- Verify `TOKEN_CONTRACT_ADDRESS` is correct
- Check BNB RPC endpoint is accessible
- Ensure contract is deployed on BNB Chain

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript compilation errors

### Logs and Debugging
```bash
# View application logs
pm2 logs quib-backend

# View specific log levels
pm2 logs quib-backend --err
pm2 logs quib-backend --out

# Restart application
pm2 restart quib-backend
```

## 📊 Scaling Considerations

### Horizontal Scaling
- Use load balancer for multiple instances
- Implement Redis for session storage
- Use database connection pooling
- Consider microservices architecture for large scale

### Database Scaling
- Use read replicas for read-heavy operations
- Implement database sharding if needed
- Consider managed database services

### Caching Strategy
- Cache creature states
- Cache evolution requirements
- Cache token information
- Implement cache invalidation

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 Support

For deployment issues:
1. Check the logs for error messages
2. Verify environment variables
3. Test database connectivity
4. Check API endpoint accessibility
5. Review rate limiting settings

---

**Happy Deploying!** 🚀
