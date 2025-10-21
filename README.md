# QUIB Backend API

A complete backend system for the QUIB creature evolution game that integrates with the BNB blockchain. The game features digital companions that evolve based on user interaction, time played, and task completion.

## 🚀 Features

- **Creature Evolution System**: 5-stage evolution (Egg → Hatchling → Juvenile → Ascended → Celestial)
- **Unique Personality System**: AI-generated personalities that adapt to each user
- **Visual Trait Generation**: Random unique appearances with customizable traits
- **Chat Memory System**: Persistent memory with sentiment analysis and keyword tracking
- **BNB Blockchain Integration**: Token rewards and wallet authentication
- **AI-Powered Chat**: OpenAI integration for creature interactions and sentiment analysis
- **Task Management**: Daily challenges and progress tracking
- **Token Rewards**: ERC-20 token integration with Fourmeme
- **Real-time Evolution**: State machine with configurable requirements
- **Dual Authentication**: Wallet-based and traditional username/password
- **Engagement Tracking**: Daily chat patterns and user interaction analytics

## 🏗️ Architecture

- **Framework**: Node.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Wallet signatures
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Blockchain**: BNB Chain (BSC) integration
- **Deployment**: Vercel/Render ready

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- BNB Chain RPC access

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quib-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Fill in the required environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/quib_db"
   JWT_SECRET="your-super-secret-jwt-key"
   OPENAI_API_KEY="your-openai-api-key"
   TOKEN_CONTRACT_ADDRESS="0x..."
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎮 Game Mechanics

### Evolution Stages

1. **Egg** → **Hatchling**: Default starting state
2. **Hatchling** → **Juvenile**: 
   - ≥ 3 completed daily challenges
   - ≥ 15 AI chats with creature
   - ≥ 48 hours since registration
3. **Juvenile** → **Ascended**:
   - ≥ 7 days account age
   - ≥ 7 daily challenges
   - Creature mood score ≥ 75%
4. **Ascended** → **Celestial**:
   - ≥ 30 days account age
   - ≥ 15 daily challenges
   - ≥ 50 chat interactions
   - Creature mood score ≥ 90%

### Token Rewards

- **Hatchling**: 100 tokens
- **Juvenile**: 500 tokens
- **Ascended**: 2,000 tokens
- **Celestial**: 10,000 tokens

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/wallet-auth` - Wallet authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Creature Management
- `GET /api/creature/state` - Get creature state
- `GET /api/creature/stats` - Get creature statistics
- `POST /api/creature/submit-task` - Submit task completion
- `POST /api/creature/chat` - Chat with creature
- `GET /api/creature/conversations` - Get chat history
- `GET /api/creature/daily-challenge` - Generate daily challenge
- `GET /api/creature/personality` - Get personality profile
- `GET /api/creature/visual-traits` - Get visual traits
- `GET /api/creature/chat-memories` - Get chat memories

### Token Management
- `GET /api/token/balance` - Get token balance
- `GET /api/token/pending-claims` - Get pending claims
- `POST /api/token/claim` - Claim token reward
- `GET /api/token/info` - Get token information

### Evolution
- `GET /api/evolution/requirements` - Check evolution requirements
- `GET /api/evolution/history` - Get evolution history
- `GET /api/evolution/stages` - Get all evolution stages
- `POST /api/evolution/test` - Trigger evolution test (dev only)

### Admin/Debug (Dev Only)
- `GET /api/admin/personality-profile` - Get detailed personality profile
- `POST /api/admin/reset-personality` - Reset creature personality
- `GET /api/admin/simulate-mood` - Simulate mood changes
- `POST /api/admin/force-reflection` - Force personality reflection
- `POST /api/admin/generate-visual-traits` - Generate new visual traits
- `GET /api/admin/chat-memories` - Get all chat memories
- `GET /api/admin/engagement-analytics` - Get engagement analytics
- `GET /api/admin/system-stats` - Get system statistics

## 🧪 Development & Testing

### Evolution Testing
For development, you can use the evolution test endpoint to simulate evolution:

```bash
POST /api/evolution/test
{
  "userId": "user-id",
  "targetStage": "JUVENILE",
  "overrideTimeGates": true
}
```

**Note**: This endpoint is only available for dev wallets configured in `DEV_WALLETS` environment variable.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `TOKEN_CONTRACT_ADDRESS` | ERC-20 token contract address | Yes |
| `BNB_RPC_URL` | BNB Chain RPC endpoint | No |
| `DEV_WALLETS` | Comma-separated dev wallet addresses | No |
| `ENABLE_EVOLUTION_TEST` | Enable evolution testing | No |

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push**

### Render Deployment

1. **Connect your repository to Render**
2. **Use the provided `render.yaml` configuration**
3. **Set environment variables in Render dashboard**

### Docker Deployment

```bash
# Build the image
docker build -t quib-backend .

# Run the container
docker run -p 3000:3000 --env-file .env quib-backend
```

## 📊 Database Schema

### Core Tables
- **Users**: User accounts and authentication
- **Creatures**: Creature state and evolution data
- **Tasks**: Task completion tracking
- **Conversations**: Chat history and sentiment analysis
- **EvolutionLogs**: Evolution history
- **TokenClaims**: Token reward claims

## 🔒 Security Features

- **Rate Limiting**: API endpoint protection
- **Input Validation**: Joi schema validation
- **Authentication**: JWT + wallet signature verification
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers
- **Environment-based Configuration**: Secure secret management

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "data": {...},
  "error": "error message",
  "message": "success message"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the environment configuration

---

**QUIB Backend API** - Powering the next generation of creature evolution games! 🐉✨
