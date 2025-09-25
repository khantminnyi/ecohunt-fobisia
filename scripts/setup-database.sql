-- EcoHunt AI Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create group memberships table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create cleanup areas table
CREATE TABLE IF NOT EXISTS public.cleanup_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'completed')),
  description TEXT,
  cleanup_instructions TEXT,
  photos_before TEXT[],
  reported_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_cleanup_areas_location ON public.cleanup_areas USING GIST (location);

-- Create cleanup claims table
CREATE TABLE IF NOT EXISTS public.cleanup_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID REFERENCES public.cleanup_areas(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES public.profiles(id),
  collaborators UUID[],
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'verified')),
  photos_after TEXT[],
  points_earned INTEGER DEFAULT 0,
  quality_score INTEGER,
  claimed_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  verified_at TIMESTAMP
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- Add UNIQUE constraint for ON CONFLICT
  description TEXT,
  icon TEXT,
  points_required INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group members are viewable by everyone" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Cleanup areas are viewable by everyone" ON public.cleanup_areas;
DROP POLICY IF EXISTS "Authenticated users can report areas" ON public.cleanup_areas;
DROP POLICY IF EXISTS "Cleanup claims are viewable by everyone" ON public.cleanup_claims;
DROP POLICY IF EXISTS "Users can claim areas" ON public.cleanup_claims;
DROP POLICY IF EXISTS "Users can update their claims" ON public.cleanup_claims;
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can earn achievements" ON public.user_achievements;

-- Create RLS policies
-- Profiles: Users can view all profiles, update only their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups: Anyone can view and join groups
CREATE POLICY "Groups are viewable by everyone" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Group members: Users can view all memberships, manage their own
CREATE POLICY "Group members are viewable by everyone" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Cleanup areas: Anyone can view and report areas
CREATE POLICY "Cleanup areas are viewable by everyone" ON public.cleanup_areas FOR SELECT USING (true);
CREATE POLICY "Authenticated users can report areas" ON public.cleanup_areas FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Cleanup claims: Users can view all claims, create their own
CREATE POLICY "Cleanup claims are viewable by everyone" ON public.cleanup_claims FOR SELECT USING (true);
CREATE POLICY "Users can claim areas" ON public.cleanup_claims FOR INSERT WITH CHECK (auth.uid() = claimed_by);
CREATE POLICY "Users can update their claims" ON public.cleanup_claims FOR UPDATE USING (auth.uid() = claimed_by);

-- Achievements: Read-only for all users
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- User achievements: Users can view all, earn their own
CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default achievements (only if they don't exist)
INSERT INTO public.achievements (name, description, icon, points_required, category)
SELECT * FROM (VALUES
  ('First Cleanup', 'Complete your first cleanup', '🌟', 0, 'cleanup'),
  ('Recycling Expert', 'Properly sort 50 recyclable items', '♻️', 500, 'cleanup'),
  ('Team Player', 'Complete 10 collaborative cleanups', '👥', 1000, 'social'),
  ('Area Reporter', 'Report 5 new cleanup areas', '📸', 300, 'social'),
  ('Streak Master', 'Maintain a 7-day activity streak', '🔥', 700, 'streak'),
  ('Eco Warrior', 'Earn 2000 points', '⚔️', 2000, 'cleanup'),
  ('Community Leader', 'Help 20 other users', '👑', 1500, 'social'),
  ('Green Guardian', 'Complete 100 cleanups', '🛡️', 5000, 'cleanup')
) AS v(name, description, icon, points_required, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.achievements WHERE achievements.name = v.name
);

-- Success message
SELECT 'EcoHunt AI database setup complete!' as status;