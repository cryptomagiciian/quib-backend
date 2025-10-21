# QUIB Personality & Visual System Documentation

## 🧠 Personality System Overview

The QUIB personality system creates unique, evolving digital companions that adapt to each user's communication style and preferences. Every Quib develops its own distinct personality, emotional memory, and visual appearance.

## 🎭 Core Personality Features

### Dynamic Personality Profile
Each Quib is generated with a unique personality profile containing:

```typescript
interface PersonalityProfile {
  energy: 'high' | 'medium' | 'low';
  tone: 'playful' | 'calm' | 'mystical' | 'goofy';
  bondType: 'loyal guardian' | 'chaotic sidekick' | 'curious spirit';
  favoriteWords: string[];
  userKeywords: string[];
  evolutionPathVariant: 'A' | 'B' | 'C';
  moodState: 'happy' | 'excited' | 'calm' | 'curious' | 'grumpy' | 'mysterious';
  quirks: string[];
  communicationStyle: string;
}
```

### Personality Evolution
- **Initial Generation**: AI creates unique personality on creature creation
- **Adaptive Learning**: Personality refines based on user interactions
- **Reflection Cycles**: Every 10 conversations, AI reflects and updates personality
- **Keyword Tracking**: Learns user interests and incorporates them into responses

## 🎨 Visual Trait System

### Visual Traits Structure
```typescript
interface VisualTraits {
  hornType: string;        // curved, spiral, crystal, twisted, crown-like, antler-style
  furColor: string;        // galactic blue, cosmic purple, starlight silver, etc.
  eyeStyle: string;        // starry swirl, galaxy deep, crystal clear, etc.
  tailType: string;        // twist puff, fluffy cloud, crystal tip, etc.
  auraEffect: string;      // fireflies, stardust, rainbow shimmer, etc.
  accessory: string;       // mini crown, crystal pendant, star earring, etc.
  specialMarkings?: string; // constellation patterns, etc.
  size?: string;           // tiny, medium, large
}
```

### Trait Generation
- **Random Assignment**: Weighted random selection from trait pools
- **Unique Combinations**: Each Quib gets a unique visual identity
- **Database Storage**: Traits stored for consistent rendering
- **Frontend Integration**: Ready for SVG layer composition

## 💬 Chat Memory System

### Memory Storage
```typescript
interface ChatMemory {
  id: string;
  creatureId: string;
  userId: string;
  message: string;
  response: string;
  sentimentScore: number;  // -1 to 1
  moodScore: number;       // 0 to 100
  keywords: string[];      // Extracted topics
  timestamp: Date;
  isImportant: boolean;    // Marked for special attention
}
```

### Memory Features
- **Sentiment Analysis**: Tracks emotional tone of conversations
- **Keyword Extraction**: Identifies user interests and topics
- **Importance Marking**: Flags significant conversations
- **Mood Tracking**: Records creature's mood during interactions
- **Engagement Metrics**: Tracks daily chat patterns

## 🔄 Personality Engine Logic

### Prompt Modification
The system builds dynamic prompts for AI responses:

```typescript
const personalityPrompt = `
You are Quib. Your personality is ${tone}, energy level is ${energy}, 
and you are the user's ${bondType}. You remember they often talk about ${user_keywords}. 
Respond in a way that reflects your mood today, which is ${mood_state}.
`;
```

### Reflection Process
1. **Data Collection**: Gathers last 10 conversations
2. **Analysis**: AI analyzes user communication patterns
3. **Personality Update**: Refines traits based on insights
4. **Keyword Integration**: Adds new user interests
5. **Database Update**: Saves refined personality

## 📊 Engagement Tracking

### Metrics Tracked
- **Daily Chat Count**: Number of conversations per day
- **Missed Days**: Days without interaction
- **Engagement Level**: low, medium, high
- **Total Chats**: Lifetime conversation count
- **Last Chat Date**: Most recent interaction

### Engagement Levels
- **High**: 5+ daily chats, ≤1 missed day
- **Medium**: 2-4 daily chats, 1-2 missed days
- **Low**: ≤1 daily chat, ≥3 missed days

## 🛠️ API Endpoints

### Creature Personality
```http
GET /api/creature/personality
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personality": {
      "energy": "high",
      "tone": "playful",
      "bondType": "chaotic sidekick",
      "favoriteWords": ["amazing", "wonderful", "fantastic"],
      "userKeywords": ["coding", "music", "travel"],
      "evolutionPathVariant": "B",
      "moodState": "excited",
      "quirks": ["loves to ask questions", "gets excited about new things"],
      "communicationStyle": "enthusiastic and curious"
    }
  }
}
```

### Visual Traits
```http
GET /api/creature/visual-traits
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "visualTraits": {
      "hornType": "crystal",
      "furColor": "cosmic purple",
      "eyeStyle": "galaxy deep",
      "tailType": "sparkle trail",
      "auraEffect": "rainbow shimmer",
      "accessory": "crystal pendant",
      "specialMarkings": "constellation patterns",
      "size": "medium"
    }
  }
}
```

### Chat Memories
```http
GET /api/creature/chat-memories?limit=20
Authorization: Bearer <token>
```

## 🔧 Admin/Debug Endpoints

### Get Personality Profile
```http
GET /api/admin/personality-profile?userId=user-id
Authorization: Bearer <dev-token>
```

### Reset Personality
```http
POST /api/admin/reset-personality
Authorization: Bearer <dev-token>
Content-Type: application/json

{
  "userId": "user-id"
}
```

### Simulate Mood Change
```http
GET /api/admin/simulate-mood?userId=user-id&to=grumpy
Authorization: Bearer <dev-token>
```

### Force Personality Reflection
```http
POST /api/admin/force-reflection
Authorization: Bearer <dev-token>
Content-Type: application/json

{
  "userId": "user-id"
}
```

### Generate New Visual Traits
```http
POST /api/admin/generate-visual-traits
Authorization: Bearer <dev-token>
Content-Type: application/json

{
  "userId": "user-id"
}
```

### Engagement Analytics
```http
GET /api/admin/engagement-analytics?userId=user-id
Authorization: Bearer <dev-token>
```

### System Stats
```http
GET /api/admin/system-stats
Authorization: Bearer <dev-token>
```

## 🎯 Frontend Integration

### Visual Rendering
The visual traits are designed for easy frontend integration:

```javascript
// Example frontend usage
const renderQuib = (visualTraits) => {
  return (
    <div className="quib-container">
      <div className={`quib-base ${visualTraits.furColor}`}>
        <div className={`horns ${visualTraits.hornType}`} />
        <div className={`eyes ${visualTraits.eyeStyle}`} />
        <div className={`tail ${visualTraits.tailType}`} />
        <div className={`accessory ${visualTraits.accessory}`} />
        <div className={`aura ${visualTraits.auraEffect}`} />
      </div>
    </div>
  );
};
```

### Personality Display
```javascript
const displayPersonality = (personality) => {
  return (
    <div className="personality-info">
      <h3>Your Quib's Personality</h3>
      <p><strong>Energy:</strong> {personality.energy}</p>
      <p><strong>Tone:</strong> {personality.tone}</p>
      <p><strong>Bond Type:</strong> {personality.bondType}</p>
      <p><strong>Favorite Words:</strong> {personality.favoriteWords.join(', ')}</p>
      <p><strong>Communication Style:</strong> {personality.communicationStyle}</p>
    </div>
  );
};
```

## 🔄 Evolution Integration

### Personality & Evolution
- **Stage-Specific Traits**: Personality evolves with creature stages
- **Path Variants**: Different evolution paths (A, B, C) affect personality
- **Mood Requirements**: Higher stages require better mood scores
- **Memory Persistence**: Personality memories carry through evolution

### Visual Evolution
- **Stage-Appropriate Traits**: Visual traits can evolve with stages
- **Aura Effects**: More powerful creatures get enhanced aura effects
- **Accessory Upgrades**: Higher stages unlock better accessories

## 📈 Analytics & Insights

### Personality Analytics
- **Trait Distribution**: Track personality type popularity
- **Engagement Correlation**: Link personality to user engagement
- **Evolution Success**: Measure personality impact on evolution
- **User Satisfaction**: Track personality refinement effectiveness

### Visual Analytics
- **Trait Popularity**: Most/least common visual combinations
- **User Preferences**: Track visual trait preferences
- **Evolution Impact**: Visual changes during evolution

## 🚀 Future Enhancements

### Planned Features
- **Personality Quirks**: More detailed personality traits
- **Visual Customization**: User-driven trait selection
- **Personality Conflicts**: Quibs with conflicting traits
- **Social Features**: Personality-based Quib interactions
- **Advanced Memory**: Long-term memory and recall
- **Emotional States**: More nuanced mood tracking

### AI Improvements
- **Better Reflection**: More sophisticated personality analysis
- **Context Awareness**: Better understanding of conversation context
- **Emotional Intelligence**: More nuanced emotional responses
- **Personality Consistency**: Better trait coherence over time

---

**The QUIB Personality System creates truly unique digital companions that grow and adapt with each user, making every interaction feel personal and meaningful!** 🐉✨
