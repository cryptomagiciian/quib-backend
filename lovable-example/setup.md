# QUIB Frontend Setup Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- QUIB backend running on `http://localhost:3000`

### 2. Setup Frontend
```bash
# Navigate to the lovable-example directory
cd lovable-example

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_BASE_URL=http://localhost:3000/api" > .env

# Start development server
npm start
```

### 3. Test the Connection
1. Open `http://localhost:3001` in your browser
2. Register a new account or login
3. Your Quib should appear with unique personality and visual traits
4. Try chatting with your Quib!

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_ENVIRONMENT=development
```

### Backend Connection
Make sure your QUIB backend is running:
```bash
# In your QUIB backend directory
npm run dev
```

## 📁 Project Structure

```
lovable-example/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── LoginForm.js
│   │   ├── LoginForm.css
│   │   ├── QuibVisual.jsx
│   │   ├── QuibVisual.css
│   │   ├── ChatInterface.jsx
│   │   ├── ChatInterface.css
│   │   ├── PersonalityDisplay.jsx
│   │   └── PersonalityDisplay.css
│   ├── services/
│   │   ├── authService.js
│   │   └── creatureService.js
│   ├── config/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── setup.md
```

## 🎨 Features Included

### ✅ Authentication
- Traditional email/password login
- User registration
- Token-based authentication
- Automatic token management

### ✅ Creature Display
- Unique visual traits rendering
- Mood-based animations
- Stage-based scaling
- Aura effects

### ✅ Chat Interface
- Real-time chat with Quib
- Sentiment analysis display
- Keyword extraction
- Chat history

### ✅ Personality System
- Personality profile display
- Visual traits showcase
- Engagement metrics
- Communication style

### ✅ Task System
- Daily challenge display
- Task completion interface
- XP and evolution tracking

## 🔄 API Integration

The frontend automatically connects to your QUIB backend and uses these endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/creature/state` - Get creature state
- `GET /api/creature/personality` - Get personality profile
- `GET /api/creature/visual-traits` - Get visual traits
- `POST /api/creature/chat` - Chat with creature
- `GET /api/creature/chat-memories` - Get chat history

## 🎯 Next Steps

### 1. Customize Visual Traits
Edit `src/components/QuibVisual.css` to add more visual effects and animations.

### 2. Add More Features
- Evolution system UI
- Token rewards display
- Social features
- Advanced personality customization

### 3. Deploy
```bash
# Build for production
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

## 🐛 Troubleshooting

### Backend Connection Issues
1. Ensure QUIB backend is running on port 3000
2. Check CORS settings in backend
3. Verify API_BASE_URL in .env file

### Authentication Issues
1. Check if JWT token is being stored
2. Verify backend authentication endpoints
3. Check browser console for errors

### Visual Rendering Issues
1. Ensure all CSS files are imported
2. Check browser developer tools for CSS errors
3. Verify visual traits data structure

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify backend API responses
3. Ensure all environment variables are set
4. Check network connectivity

---

**Your QUIB frontend is now ready to connect to the backend!** 🐉✨
