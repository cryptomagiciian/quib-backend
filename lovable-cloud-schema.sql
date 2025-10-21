-- QUIB Database Schema for Lovable Cloud (Supabase)
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  wallet_address TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creatures (Quibs) table
CREATE TABLE public.creatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  current_stage TEXT DEFAULT 'HATCHLING' CHECK (current_stage IN ('EGG', 'HATCHLING', 'JUVENILE', 'ASCENDED', 'CELESTIAL')),
  mood_score FLOAT DEFAULT 50.0 CHECK (mood_score >= 0 AND mood_score <= 100),
  xp INTEGER DEFAULT 0,
  last_evolution TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personality Profile
  personality_profile JSONB,
  energy TEXT DEFAULT 'medium' CHECK (energy IN ('high', 'medium', 'low')),
  tone TEXT DEFAULT 'playful' CHECK (tone IN ('playful', 'calm', 'mystical', 'goofy')),
  bond_type TEXT DEFAULT 'loyal guardian' CHECK (bond_type IN ('loyal guardian', 'chaotic sidekick', 'curious spirit')),
  favorite_words TEXT[] DEFAULT '{}',
  user_keywords TEXT[] DEFAULT '{}',
  evolution_path_variant TEXT DEFAULT 'A' CHECK (evolution_path_variant IN ('A', 'B', 'C')),
  
  -- Visual Traits
  visual_traits JSONB,
  horn_type TEXT DEFAULT 'curved',
  fur_color TEXT DEFAULT 'galactic blue',
  eye_style TEXT DEFAULT 'starry swirl',
  tail_type TEXT DEFAULT 'twist puff',
  aura_effect TEXT DEFAULT 'fireflies',
  accessory TEXT DEFAULT 'mini crown',
  
  -- Chat Memory & Engagement
  daily_chat_count INTEGER DEFAULT 0,
  missed_days INTEGER DEFAULT 0,
  engagement_level TEXT DEFAULT 'medium' CHECK (engagement_level IN ('low', 'medium', 'high')),
  last_chat_date TIMESTAMP WITH TIME ZONE,
  total_chats INTEGER DEFAULT 0,
  
  UNIQUE(user_id)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('DAILY_CHALLENGE', 'CHAT_INTERACTION', 'TIME_BASED', 'CUSTOM')),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat memories table
CREATE TABLE public.chat_memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creature_id UUID REFERENCES public.creatures(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  sentiment_score FLOAT NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  mood_score FLOAT NOT NULL CHECK (mood_score >= 0 AND mood_score <= 100),
  keywords TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_important BOOLEAN DEFAULT FALSE
);

-- Evolution logs table
CREATE TABLE public.evolution_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  from_stage TEXT NOT NULL CHECK (from_stage IN ('EGG', 'HATCHLING', 'JUVENILE', 'ASCENDED', 'CELESTIAL')),
  to_stage TEXT NOT NULL CHECK (to_stage IN ('EGG', 'HATCHLING', 'JUVENILE', 'ASCENDED', 'CELESTIAL')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- Token claims table
CREATE TABLE public.token_claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount TEXT NOT NULL,
  tx_hash TEXT,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_claims ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Creatures policies
CREATE POLICY "Users can view own creatures" ON public.creatures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own creatures" ON public.creatures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own creatures" ON public.creatures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat memories policies
CREATE POLICY "Users can view own chat memories" ON public.chat_memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat memories" ON public.chat_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Evolution logs policies
CREATE POLICY "Users can view own evolution logs" ON public.evolution_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evolution logs" ON public.evolution_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Token claims policies
CREATE POLICY "Users can view own token claims" ON public.token_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own token claims" ON public.token_claims
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own token claims" ON public.token_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creatures_updated_at BEFORE UPDATE ON public.creatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
