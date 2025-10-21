# QUIB Backend + Lovable Frontend Integration Guide

## 🚀 Quick Start

### 1. Backend Setup
First, ensure your QUIB backend is running:

```bash
# In your QUIB backend directory
npm install
npm run dev
```

Your backend should be running at `http://localhost:3000/api`

### 2. Lovable Project Setup
Create a new Lovable project and configure it to connect to your QUIB backend.

## 🔧 Configuration

### Environment Variables
Create a `.env` file in your Lovable project:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_ENVIRONMENT=development
```

### API Configuration
Create an API configuration file:

```javascript
// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});
```

## 🔐 Authentication Integration

### Wallet Authentication
```javascript
// src/services/authService.js
import { apiConfig, getAuthHeaders } from '../config/api';

export class AuthService {
  static async walletAuth(message, signature, address) {
    try {
      const response = await fetch(`${apiConfig.baseURL}/auth/wallet-auth`, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify({ message, signature, address }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
      }
      
      throw new Error(data.error || 'Authentication failed');
    } catch (error) {
      console.error('Wallet auth error:', error);
      throw error;
    }
  }

  static async traditionalLogin(email, password) {
    try {
      const response = await fetch(`${apiConfig.baseURL}/auth/login`, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
      }
      
      throw new Error(data.error || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
```

## 🐉 Creature Service Integration

### Creature API Service
```javascript
// src/services/creatureService.js
import { apiConfig, getAuthHeaders } from '../config/api';

export class CreatureService {
  static async getCreatureState() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiConfig.baseURL}/creature/state`, {
      headers: getAuthHeaders(token),
    });
    
    const data = await response.json();
    return data.success ? data.data.creature : null;
  }

  static async getPersonalityProfile() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiConfig.baseURL}/creature/personality`, {
      headers: getAuthHeaders(token),
    });
    
    const data = await response.json();
    return data.success ? data.data.personality : null;
  }

  static async getVisualTraits() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiConfig.baseURL}/creature/visual-traits`, {
      headers: getAuthHeaders(token),
    });
    
    const data = await response.json();
    return data.success ? data.data.visualTraits : null;
  }

  static async chatWithCreature(message) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiConfig.baseURL}/creature/chat`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ message }),
    });
    
    const data = await response.json();
    return data.success ? data.data : null;
  }

  static async submitTask(taskType, title, description) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiConfig.baseURL}/creature/submit-task`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ taskType, title, description }),
    });
    
    const data = await response.json();
    return data.success ? data.data : null;
  }

  static async getChatMemories(limit = 20) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiConfig.baseURL}/creature/chat-memories?limit=${limit}`, {
      headers: getAuthHeaders(token),
    });
    
    const data = await response.json();
    return data.success ? data.data.memories : [];
  }
}
```

## 🎨 Visual Rendering System

### Quib Visual Component
```javascript
// src/components/QuibVisual.jsx
import React from 'react';
import './QuibVisual.css';

const QuibVisual = ({ visualTraits, currentStage, moodScore }) => {
  if (!visualTraits) return <div className="quib-loading">Loading Quib...</div>;

  const getMoodClass = (score) => {
    if (score >= 80) return 'mood-excited';
    if (score >= 60) return 'mood-happy';
    if (score >= 40) return 'mood-calm';
    if (score >= 20) return 'mood-curious';
    return 'mood-grumpy';
  };

  const getStageClass = (stage) => {
    return `stage-${stage.toLowerCase()}`;
  };

  return (
    <div className={`quib-container ${getMoodClass(moodScore)} ${getStageClass(currentStage)}`}>
      <div className="quib-base">
        {/* Aura Effect */}
        <div className={`aura-effect ${visualTraits.auraEffect}`} />
        
        {/* Main Body */}
        <div className={`quib-body ${visualTraits.furColor}`}>
          {/* Horns */}
          <div className={`horns ${visualTraits.hornType}`} />
          
          {/* Eyes */}
          <div className={`eyes ${visualTraits.eyeStyle}`} />
          
          {/* Accessory */}
          <div className={`accessory ${visualTraits.accessory}`} />
        </div>
        
        {/* Tail */}
        <div className={`tail ${visualTraits.tailType}`} />
        
        {/* Special Markings */}
        {visualTraits.specialMarkings && (
          <div className={`special-markings ${visualTraits.specialMarkings}`} />
        )}
      </div>
    </div>
  );
};

export default QuibVisual;
```

### Quib Visual CSS
```css
/* src/components/QuibVisual.css */
.quib-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.quib-base {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Aura Effects */
.aura-effect {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border-radius: 50%;
  opacity: 0.6;
  animation: aura-pulse 2s ease-in-out infinite;
}

.aura-effect.fireflies {
  background: radial-gradient(circle, #ffd700 0%, transparent 70%);
  box-shadow: 0 0 20px #ffd700;
}

.aura-effect.stardust {
  background: radial-gradient(circle, #87ceeb 0%, transparent 70%);
  box-shadow: 0 0 20px #87ceeb;
}

.aura-effect.rainbow-shimmer {
  background: conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);
  animation: rainbow-rotate 3s linear infinite;
}

/* Quib Body */
.quib-body {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* Fur Colors */
.quib-body.galactic-blue {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  box-shadow: 0 0 15px rgba(30, 60, 114, 0.5);
}

.quib-body.cosmic-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
}

.quib-body.starlight-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  box-shadow: 0 0 15px rgba(192, 192, 192, 0.5);
}

/* Horns */
.horns {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
}

.horns.curved {
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 30px solid #8b4513;
  border-radius: 50% 50% 0 0;
}

.horns.crystal {
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 25px solid #e6e6fa;
  box-shadow: 0 0 10px #e6e6fa;
}

/* Eyes */
.eyes {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.eyes.starry-swirl {
  background: radial-gradient(circle, #ffd700 30%, #000 70%);
  box-shadow: 0 0 10px #ffd700;
  animation: star-twinkle 1.5s ease-in-out infinite;
}

.eyes.galaxy-deep {
  background: radial-gradient(circle, #4b0082 30%, #000 70%);
  box-shadow: 0 0 10px #4b0082;
}

/* Tail */
.tail {
  position: absolute;
  bottom: 20px;
  right: -10px;
  width: 30px;
  height: 40px;
  border-radius: 50%;
}

.tail.twist-puff {
  background: linear-gradient(45deg, #ff69b4, #ff1493);
  transform: rotate(15deg);
}

.tail.sparkle-trail {
  background: linear-gradient(45deg, #ffd700, #ffa500);
  box-shadow: 0 0 15px #ffd700;
  animation: sparkle 2s ease-in-out infinite;
}

/* Accessories */
.accessory {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.accessory.mini-crown {
  width: 25px;
  height: 15px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  border-radius: 50% 50% 0 0;
  box-shadow: 0 0 8px #ffd700;
}

.accessory.crystal-pendant {
  width: 8px;
  height: 12px;
  background: linear-gradient(45deg, #e6e6fa, #ffffff);
  border-radius: 50%;
  box-shadow: 0 0 5px #e6e6fa;
}

/* Mood Classes */
.mood-excited .quib-body {
  animation: bounce 0.5s ease-in-out infinite;
}

.mood-happy .quib-body {
  animation: gentle-bounce 1s ease-in-out infinite;
}

.mood-grumpy .quib-body {
  filter: grayscale(0.3);
  transform: translate(-50%, -50%) scale(0.95);
}

/* Stage Classes */
.stage-hatchling .quib-body {
  transform: translate(-50%, -50%) scale(0.8);
}

.stage-juvenile .quib-body {
  transform: translate(-50%, -50%) scale(0.9);
}

.stage-ascended .quib-body {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.7);
}

.stage-celestial .quib-body {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
}

/* Animations */
@keyframes aura-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes rainbow-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes star-twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes sparkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes bounce {
  0%, 100% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, -60%); }
}

@keyframes gentle-bounce {
  0%, 100% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, -55%); }
}
```

## 💬 Chat Interface

### Chat Component
```javascript
// src/components/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { CreatureService } from '../services/creatureService';
import './ChatInterface.css';

const ChatInterface = ({ onCreatureUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatMemories();
  }, []);

  const loadChatMemories = async () => {
    try {
      const memories = await CreatureService.getChatMemories(20);
      const formattedMessages = memories.map(memory => ({
        id: memory.id,
        type: 'user',
        content: memory.message,
        timestamp: memory.timestamp,
        sentiment: memory.sentimentScore,
        keywords: memory.keywords
      })).concat(memories.map(memory => ({
        id: memory.id + '_response',
        type: 'quib',
        content: memory.response,
        timestamp: memory.timestamp,
        mood: memory.moodScore
      })));
      
      setMessages(formattedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    } catch (error) {
      console.error('Failed to load chat memories:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await CreatureService.chatWithCreature(inputMessage);
      
      if (response) {
        const quibMessage = {
          id: Date.now() + 1,
          type: 'quib',
          content: response.conversation.response,
          timestamp: response.conversation.timestamp,
          mood: response.creature.moodScore,
          keywords: response.keywords
        };

        setMessages(prev => [...prev, quibMessage]);
        
        // Update creature state in parent component
        if (onCreatureUpdate) {
          onCreatureUpdate(response.creature);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I had trouble understanding that. Please try again!',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-meta">
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {message.keywords && message.keywords.length > 0 && (
                <span className="keywords">
                  {message.keywords.map(keyword => `#${keyword}`).join(' ')}
                </span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message quib">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Chat with your Quib..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
```

## 📊 Personality Display

### Personality Component
```javascript
// src/components/PersonalityDisplay.jsx
import React from 'react';
import './PersonalityDisplay.css';

const PersonalityDisplay = ({ personality, visualTraits }) => {
  if (!personality) return <div>Loading personality...</div>;

  const getEnergyIcon = (energy) => {
    switch (energy) {
      case 'high': return '⚡';
      case 'medium': return '🔋';
      case 'low': return '🔋';
      default: return '❓';
    }
  };

  const getToneIcon = (tone) => {
    switch (tone) {
      case 'playful': return '🎮';
      case 'calm': return '🧘';
      case 'mystical': return '🔮';
      case 'goofy': return '🤪';
      default: return '😊';
    }
  };

  const getBondIcon = (bondType) => {
    switch (bondType) {
      case 'loyal guardian': return '🛡️';
      case 'chaotic sidekick': return '🎭';
      case 'curious spirit': return '🔍';
      default: return '💫';
    }
  };

  return (
    <div className="personality-display">
      <h3>Your Quib's Personality</h3>
      
      <div className="personality-grid">
        <div className="personality-item">
          <div className="personality-icon">{getEnergyIcon(personality.energy)}</div>
          <div className="personality-info">
            <h4>Energy</h4>
            <p>{personality.energy}</p>
          </div>
        </div>

        <div className="personality-item">
          <div className="personality-icon">{getToneIcon(personality.tone)}</div>
          <div className="personality-info">
            <h4>Tone</h4>
            <p>{personality.tone}</p>
          </div>
        </div>

        <div className="personality-item">
          <div className="personality-icon">{getBondIcon(personality.bondType)}</div>
          <div className="personality-info">
            <h4>Bond Type</h4>
            <p>{personality.bondType}</p>
          </div>
        </div>
      </div>

      <div className="personality-details">
        <div className="detail-section">
          <h4>Favorite Words</h4>
          <div className="favorite-words">
            {personality.favoriteWords.map((word, index) => (
              <span key={index} className="word-tag">{word}</span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>Learned Interests</h4>
          <div className="user-keywords">
            {personality.userKeywords.length > 0 ? (
              personality.userKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">#{keyword}</span>
              ))
            ) : (
              <p className="no-keywords">Still learning about you...</p>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h4>Communication Style</h4>
          <p className="communication-style">{personality.communicationStyle}</p>
        </div>

        <div className="detail-section">
          <h4>Quirks</h4>
          <ul className="quirks-list">
            {personality.quirks.map((quirk, index) => (
              <li key={index}>{quirk}</li>
            ))}
          </ul>
        </div>
      </div>

      {visualTraits && (
        <div className="visual-traits">
          <h4>Visual Traits</h4>
          <div className="traits-grid">
            <div className="trait-item">
              <span className="trait-label">Horns:</span>
              <span className="trait-value">{visualTraits.hornType}</span>
            </div>
            <div className="trait-item">
              <span className="trait-label">Fur:</span>
              <span className="trait-value">{visualTraits.furColor}</span>
            </div>
            <div className="trait-item">
              <span className="trait-label">Eyes:</span>
              <span className="trait-value">{visualTraits.eyeStyle}</span>
            </div>
            <div className="trait-item">
              <span className="trait-label">Tail:</span>
              <span className="trait-value">{visualTraits.tailType}</span>
            </div>
            <div className="trait-item">
              <span className="trait-label">Aura:</span>
              <span className="trait-value">{visualTraits.auraEffect}</span>
            </div>
            <div className="trait-item">
              <span className="trait-label">Accessory:</span>
              <span className="trait-value">{visualTraits.accessory}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalityDisplay;
```

## 🎮 Main Game Component

### Main Game Component
```javascript
// src/components/Game.jsx
import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { CreatureService } from '../services/creatureService';
import QuibVisual from './QuibVisual';
import ChatInterface from './ChatInterface';
import PersonalityDisplay from './PersonalityDisplay';
import './Game.css';

const Game = () => {
  const [user, setUser] = useState(null);
  const [creature, setCreature] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [visualTraits, setVisualTraits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      setUser(currentUser);

      // Load creature data
      const [creatureData, personalityData, visualData] = await Promise.all([
        CreatureService.getCreatureState(),
        CreatureService.getPersonalityProfile(),
        CreatureService.getVisualTraits()
      ]);

      setCreature(creatureData);
      setPersonality(personalityData);
      setVisualTraits(visualData);
    } catch (error) {
      console.error('Failed to initialize game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatureUpdate = (updatedCreature) => {
    setCreature(updatedCreature);
  };

  if (loading) {
    return (
      <div className="game-loading">
        <div className="loading-spinner"></div>
        <p>Loading your Quib...</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>QUIB - Your Digital Companion</h1>
        <div className="user-info">
          <span>Welcome, {user?.username || user?.email || 'User'}!</span>
          <button onClick={AuthService.logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="game-content">
        <div className="quib-section">
          <div className="quib-display">
            <QuibVisual 
              visualTraits={visualTraits}
              currentStage={creature?.currentStage}
              moodScore={creature?.moodScore}
            />
            <div className="creature-info">
              <h2>Stage: {creature?.currentStage}</h2>
              <p>Mood: {creature?.moodScore?.toFixed(1)}%</p>
              <p>XP: {creature?.xp}</p>
              {creature?.canEvolve && (
                <p className="evolution-ready">Ready to evolve! 🎉</p>
              )}
            </div>
          </div>
        </div>

        <div className="interaction-section">
          <div className="tab-navigation">
            <button 
              className={activeTab === 'chat' ? 'active' : ''}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button 
              className={activeTab === 'personality' ? 'active' : ''}
              onClick={() => setActiveTab('personality')}
            >
              Personality
            </button>
            <button 
              className={activeTab === 'tasks' ? 'active' : ''}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'chat' && (
              <ChatInterface onCreatureUpdate={handleCreatureUpdate} />
            )}
            {activeTab === 'personality' && (
              <PersonalityDisplay 
                personality={personality} 
                visualTraits={visualTraits} 
              />
            )}
            {activeTab === 'tasks' && (
              <div className="tasks-section">
                <h3>Daily Tasks</h3>
                <p>Complete tasks to help your Quib evolve!</p>
                {/* Task components would go here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
```

## 🔧 Additional CSS

### Game CSS
```css
/* src/components/Game.css */
.game-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.game-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.quib-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quib-display {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.creature-info {
  margin-top: 1rem;
}

.evolution-ready {
  color: #ffd700;
  font-weight: bold;
  animation: pulse 2s infinite;
}

.interaction-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.tab-navigation {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
}

.tab-navigation button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.tab-navigation button.active {
  background: rgba(255, 255, 255, 0.2);
}

.tab-navigation button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-content {
  padding: 2rem;
  height: 500px;
  overflow-y: auto;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## 🚀 Deployment

### Production Configuration
Update your environment variables for production:

```env
REACT_APP_API_BASE_URL=https://your-quib-backend.vercel.app/api
REACT_APP_ENVIRONMENT=production
```

### Build and Deploy
```bash
# Build for production
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

## 🔗 Integration Checklist

- [ ] Backend running on correct port
- [ ] Environment variables configured
- [ ] Authentication service implemented
- [ ] Creature service integrated
- [ ] Visual rendering system working
- [ ] Chat interface functional
- [ ] Personality display implemented
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Responsive design tested

This integration guide provides everything you need to connect your QUIB backend to a Lovable frontend. The system is designed to be modular and easy to customize! 🐉✨
