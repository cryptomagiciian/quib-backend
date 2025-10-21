# QUIB Backend API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

### Wallet Authentication
```http
POST /api/auth/wallet-auth
Content-Type: application/json

{
  "message": "Sign this message to authenticate",
  "signature": "0x...",
  "address": "0x..."
}
```

### Traditional Authentication
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Creature Management

### Get Creature State
```http
GET /api/creature/state
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "creature": {
      "id": "creature-id",
      "currentStage": "HATCHLING",
      "moodScore": 75.5,
      "xp": 150,
      "lastEvolution": "2024-01-01T00:00:00Z",
      "canEvolve": true,
      "evolutionRequirements": {
        "dailyChallenges": 3,
        "chatInteractions": 15,
        "accountAgeHours": 48
      }
    }
  }
}
```

### Submit Task
```http
POST /api/creature/submit-task
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskType": "DAILY_CHALLENGE",
  "title": "Complete morning meditation",
  "description": "Meditate for 10 minutes"
}
```

### Chat with Creature
```http
POST /api/creature/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hello, how are you today?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv-id",
      "userId": "user-id",
      "message": "Hello, how are you today?",
      "response": "I'm doing great! The energy around me feels very positive today.",
      "sentimentScore": 0.8,
      "timestamp": "2024-01-01T00:00:00Z"
    },
    "creature": {
      "moodScore": 85.5,
      "xp": 160
    },
    "xpGained": 10
  }
}
```

## Token Management

### Get Token Balance
```http
GET /api/token/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": "1000.0"
  }
}
```

### Get Pending Claims
```http
GET /api/token/pending-claims
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "claim-id",
        "amount": "500",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "totalClaimable": "500"
  }
}
```

### Claim Token Reward
```http
POST /api/token/claim
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": "500",
  "signature": "0x..."
}
```

## Evolution System

### Check Evolution Requirements
```http
GET /api/evolution/requirements
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "canEvolve": true,
    "currentStage": "HATCHLING",
    "nextStage": "JUVENILE",
    "requirements": {
      "dailyChallenges": 3,
      "chatInteractions": 15,
      "accountAgeHours": 48
    },
    "progress": {
      "dailyChallenges": 3,
      "chatInteractions": 15,
      "accountAgeHours": 72,
      "moodScore": 75.5
    },
    "message": "Creature is ready to evolve!"
  }
}
```

### Get Evolution History
```http
GET /api/evolution/history?page=1&limit=10
Authorization: Bearer <token>
```

### Get All Evolution Stages
```http
GET /api/evolution/stages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "stage": "EGG",
        "requirements": {
          "dailyChallenges": 0,
          "chatInteractions": 0,
          "accountAgeHours": 0
        },
        "tokenReward": "0"
      },
      {
        "stage": "HATCHLING",
        "requirements": {
          "dailyChallenges": 0,
          "chatInteractions": 0,
          "accountAgeHours": 0
        },
        "tokenReward": "100"
      }
    ]
  }
}
```

## Development/Testing Endpoints

### Trigger Evolution Test (Dev Only)
```http
POST /api/evolution/test
Authorization: Bearer <dev-token>
Content-Type: application/json

{
  "userId": "user-id",
  "targetStage": "JUVENILE",
  "overrideTimeGates": true,
  "mockRequirements": {
    "dailyChallenges": 3,
    "chatInteractions": 15,
    "accountAgeHours": 48
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Chat**: 10 messages per minute
- **Evolution Test**: 3 requests per minute

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Evolution Stages

| Stage | Requirements | Token Reward |
|-------|-------------|--------------|
| Egg | Default | 0 |
| Hatchling | Default | 100 |
| Juvenile | 3 daily challenges, 15 chats, 48h account age | 500 |
| Ascended | 7 daily challenges, 7 days account age, 75% mood | 2,000 |
| Celestial | 15 daily challenges, 50 chats, 30 days account age, 90% mood | 10,000 |

## Task Types

- `DAILY_CHALLENGE` - Daily tasks for evolution progress
- `CHAT_INTERACTION` - Chatting with creature
- `TIME_BASED` - Time-based achievements
- `CUSTOM` - User-defined tasks

## Sentiment Analysis

The AI analyzes chat messages and returns sentiment scores:
- Range: -1 (very negative) to 1 (very positive)
- Used to calculate creature mood (0-100%)
- Affects evolution requirements for higher stages

## Token Integration

- **Blockchain**: BNB Chain (BSC)
- **Standard**: ERC-20
- **Platform**: Fourmeme
- **Rewards**: Automatic token claims on evolution
- **Verification**: Wallet signature verification for claims
