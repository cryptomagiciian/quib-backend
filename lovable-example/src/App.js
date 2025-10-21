import React, { useState, useEffect } from 'react';
import { AuthService } from './services/authService';
import { CreatureService } from './services/creatureService';
import QuibVisual from './components/QuibVisual';
import ChatInterface from './components/ChatInterface';
import PersonalityDisplay from './components/PersonalityDisplay';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [creature, setCreature] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [visualTraits, setVisualTraits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = AuthService.getUser();
      if (currentUser) {
        setUser(currentUser);
        await loadCreatureData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCreatureData = async () => {
    try {
      const [creatureData, personalityData, visualData] = await Promise.all([
        CreatureService.getCreatureState(),
        CreatureService.getPersonalityProfile(),
        CreatureService.getVisualTraits()
      ]);

      setCreature(creatureData);
      setPersonality(personalityData);
      setVisualTraits(visualData);
    } catch (error) {
      console.error('Failed to load creature data:', error);
    }
  };

  const handleLogin = async (loginData) => {
    try {
      const userData = await AuthService.traditionalLogin(loginData.email, loginData.password);
      setUser(userData.user);
      await loadCreatureData();
    } catch (error) {
      throw error;
    }
  };

  const handleCreatureUpdate = (updatedCreature) => {
    setCreature(updatedCreature);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setCreature(null);
    setPersonality(null);
    setVisualTraits(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading QUIB...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🐉 QUIB - Your Digital Companion</h1>
        <div className="user-info">
          <span>Welcome, {user.username || user.email || 'User'}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="app-content">
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
              💬 Chat
            </button>
            <button 
              className={activeTab === 'personality' ? 'active' : ''}
              onClick={() => setActiveTab('personality')}
            >
              🧠 Personality
            </button>
            <button 
              className={activeTab === 'tasks' ? 'active' : ''}
              onClick={() => setActiveTab('tasks')}
            >
              ✅ Tasks
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
                <div className="task-examples">
                  <div className="task-item">
                    <h4>Daily Challenge</h4>
                    <p>Complete a small act of kindness today</p>
                    <button className="task-btn">Complete</button>
                  </div>
                  <div className="task-item">
                    <h4>Chat Interaction</h4>
                    <p>Have a meaningful conversation with your Quib</p>
                    <button className="task-btn">Complete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
