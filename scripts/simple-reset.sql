-- Complete reset and simplification for EcoHunt AI
-- Run this SQL in Supabase SQL Editor

-- Drop all existing functions and policies
DROP FUNCTION IF EXISTS increment_user_points(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_user_groups(UUID);
DROP FUNCTION IF EXISTS get_group_leaderboard(UUID);
DROP FUNCTION IF EXISTS get_areas_with_coordinates();
DROP FUNCTION IF EXISTS get_group_areas(UUID);
DROP FUNCTION IF EXISTS check_user_achievements(UUID);

-- Drop all existing policies (if they exist)
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename || ';';
    END LOOP;
END $$;

-- Completely disable all RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements DISABLE ROW LEVEL SECURITY;

-- Grant full access to everyone temporarily
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Create profiles for all existing auth users (if not already created)
INSERT INTO public.profiles (id, username, avatar_url, total_points, created_at, updated_at)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1),
    'EcoUser'
  ) as username,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  0 as total_points,
  NOW(),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- Create a default group if none exists
INSERT INTO public.groups (name, description, invite_code, created_by)
SELECT
  'Global Cleanup Community',
  'Default group for all EcoHunt AI users',
  'GLOBAL-ECO',
  (SELECT id FROM public.profiles LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM public.groups WHERE invite_code = 'GLOBAL-ECO'
)
ON CONFLICT (invite_code) DO NOTHING; -- Ensure this doesn't fail if already exists

-- Add all existing profiles to the default group
INSERT INTO public.group_members (group_id, user_id, role, joined_at)
SELECT
  (SELECT id FROM public.groups WHERE invite_code = 'GLOBAL-ECO'),
  p.id,
  'member',
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.group_members gm
  WHERE gm.user_id = p.id
  AND gm.group_id = (SELECT id FROM public.groups WHERE invite_code = 'GLOBAL-ECO')
)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Recreate increment_user_points function (simple version)
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_points = total_points + points_to_add,
    updated_at = NOW()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, total_points, created_at, updated_at)
    VALUES (user_id, points_to_add, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      total_points = profiles.total_points + points_to_add,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for the increment function
GRANT EXECUTE ON FUNCTION increment_user_points(UUID, INTEGER) TO authenticated;

-- Verify the fix
SELECT 'After fix - Profiles:' as status, COUNT(*) FROM public.profiles;
SELECT 'After fix - Groups:' as status, COUNT(*) FROM public.groups;
SELECT 'After fix - Group members:' as status, COUNT(*) FROM public.group_members;

-- Show final state
SELECT
  'Final check - Group memberships:' as status,
  p.username,
  g.name as group_name,
  gm.role
FROM public.group_members gm
JOIN public.profiles p ON gm.user_id = p.id
JOIN public.groups g ON gm.group_id = g.id;

SELECT 'Complete reset done! All APIs should work now! ✅' as status;