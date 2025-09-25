-- Create demo data for EcoHunt AI
-- Run this SQL in Supabase SQL Editor

-- Update existing real user profiles with demo points for leaderboard
UPDATE public.profiles
SET total_points = CASE
  WHEN username LIKE '%eco%' OR username LIKE '%green%' THEN 2340
  WHEN username LIKE '%clean%' OR username LIKE '%warrior%' THEN 1850
  ELSE 1450 + (RANDOM() * 500)::INTEGER
END,
updated_at = NOW()
WHERE total_points = 0;

-- Create some fake profiles for demo (without auth users - will be display only)
-- These are for leaderboard display only, not real accounts
DO $$
BEGIN
  -- Insert demo profiles if they don't exist (ignore foreign key for demo)
  BEGIN
    INSERT INTO public.profiles (id, username, avatar_url, total_points, created_at, updated_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'EcoWarrior2024', null, 2340, NOW() - INTERVAL '30 days', NOW()),
    ('22222222-2222-2222-2222-222222222222', 'GreenGuardian', null, 1850, NOW() - INTERVAL '25 days', NOW()),
    ('33333333-3333-3333-3333-333333333333', 'CleanupCrusader', null, 1620, NOW() - INTERVAL '20 days', NOW()),
    ('44444444-4444-4444-4444-444444444444', 'EarthHero', null, 1280, NOW() - INTERVAL '15 days', NOW()),
    ('55555555-5555-5555-5555-555555555555', 'PlasticHunter', null, 980, NOW() - INTERVAL '10 days', NOW()),
    ('66666666-6666-6666-6666-666666666666', 'RecycleRanger', null, 750, NOW() - INTERVAL '5 days', NOW())
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      total_points = EXCLUDED.total_points,
      updated_at = NOW();
  EXCEPTION
    WHEN foreign_key_violation THEN
      -- Ignore foreign key errors for demo data
      RAISE NOTICE 'Skipping demo user creation due to foreign key constraints';
  END;
END $$;

-- Create a second demo group for the specific user
INSERT INTO public.groups (id, name, description, invite_code, created_by, created_at, updated_at) VALUES
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Campus EcoWarriors', 'University cleanup group', 'CAMPUS-CLEAN', '14a2243a-428d-4435-911b-5ae8555e7617', NOW(), NOW())
ON CONFLICT (invite_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Add the specific user to this new group as admin
INSERT INTO public.group_members (group_id, user_id, role, joined_at) VALUES
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '14a2243a-428d-4435-911b-5ae8555e7617', 'admin', NOW())
ON CONFLICT (group_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  joined_at = EXCLUDED.joined_at;

-- Add some dummy users to both groups for populated leaderboards

-- Add existing real users to groups (skip fake IDs)
-- Add real users to Global Cleanup Community
INSERT INTO public.group_members (group_id, user_id, role, joined_at)
SELECT
  (SELECT id FROM public.groups WHERE invite_code = 'GLOBAL-ECO'),
  p.id,
  'member',
  NOW() - (random() * INTERVAL '30 days')
FROM public.profiles p
WHERE p.id != '14a2243a-428d-4435-911b-5ae8555e7617'  -- Don't duplicate the specific user
AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id) -- Only real auth users
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Add some real users to Campus EcoWarriors too (for multiple group membership)
INSERT INTO public.group_members (group_id, user_id, role, joined_at)
SELECT
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  p.id,
  'member',
  NOW() - (random() * INTERVAL '20 days')
FROM public.profiles p
WHERE p.id != '14a2243a-428d-4435-911b-5ae8555e7617'  -- Don't duplicate the admin
AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id) -- Only real auth users
LIMIT 2  -- Add up to 2 additional members
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Also add the specific user to Global group as member (if they want to switch between groups)
INSERT INTO public.group_members (group_id, user_id, role, joined_at) VALUES
((SELECT id FROM public.groups WHERE invite_code = 'GLOBAL-ECO'), '14a2243a-428d-4435-911b-5ae8555e7617', 'member', NOW())
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Create some sample achievements for real users
INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
SELECT
  p.id,
  a.id,
  NOW() - (random() * INTERVAL '10 days')
FROM public.profiles p
CROSS JOIN public.achievements a
WHERE p.total_points >= a.points_required
AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id)
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Verify the demo data
SELECT 'Demo data created!' as status;

SELECT 'Groups:' as type, name, invite_code, 
  (SELECT COUNT(*) FROM public.group_members gm WHERE gm.group_id = groups.id) as member_count
FROM public.groups;

SELECT 'Global group members:' as type, p.username, gm.role 
FROM public.group_members gm
JOIN public.profiles p ON gm.user_id = p.id
JOIN public.groups g ON gm.group_id = g.id
WHERE g.invite_code = 'GLOBAL-ECO'
ORDER BY p.total_points DESC;

SELECT 'Campus group members:' as type, p.username, gm.role
FROM public.group_members gm
JOIN public.profiles p ON gm.user_id = p.id  
JOIN public.groups g ON gm.group_id = g.id
WHERE g.invite_code = 'CAMPUS-CLEAN'
ORDER BY p.total_points DESC;

SELECT 'Demo data complete! Leaderboards should be populated! 🎉' as status;