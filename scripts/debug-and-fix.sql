-- Debug and fix all group issues for EcoHunt AI
-- Run this SQL in Supabase SQL Editor

-- First, let's see what we have
SELECT 'Current state check:' as status;

-- Check if tables exist
SELECT 
  'Tables:' as type,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'groups', 'group_members', 'cleanup_areas');

-- Check if functions exist
SELECT 
  'Functions:' as type,
  routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_groups', 'get_group_leaderboard', 'get_areas_with_coordinates');

-- Check current data
SELECT 'Profiles count:' as type, COUNT(*) as count FROM public.profiles;
SELECT 'Groups count:' as type, COUNT(*) as count FROM public.groups;
SELECT 'Group members count:' as type, COUNT(*) as count FROM public.group_members;

-- Drop and recreate the problematic functions
DROP FUNCTION IF EXISTS get_user_groups(UUID);
DROP FUNCTION IF EXISTS get_group_leaderboard(UUID);
DROP FUNCTION IF EXISTS get_areas_with_coordinates();

-- Simple function to get user groups
CREATE OR REPLACE FUNCTION get_user_groups(input_user_id UUID)
RETURNS TABLE (
  group_id UUID,
  group_name TEXT,
  group_description TEXT,
  invite_code TEXT,
  member_role TEXT,
  member_count BIGINT,
  joined_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.description,
    g.invite_code,
    gm.role,
    (SELECT COUNT(*) FROM public.group_members gm2 WHERE gm2.group_id = g.id),
    gm.joined_at
  FROM public.groups g
  JOIN public.group_members gm ON g.id = gm.group_id
  WHERE gm.user_id = input_user_id
  ORDER BY gm.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple function to get group leaderboard
CREATE OR REPLACE FUNCTION get_group_leaderboard(input_group_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_points INTEGER,
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.total_points,
    RANK() OVER (ORDER BY p.total_points DESC)::INTEGER
  FROM public.profiles p
  JOIN public.group_members gm ON p.id = gm.user_id
  WHERE gm.group_id = input_group_id
  ORDER BY p.total_points DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple function to get areas with coordinates
CREATE OR REPLACE FUNCTION get_areas_with_coordinates()
RETURNS TABLE (
  id UUID,
  location JSONB,
  severity TEXT,
  status TEXT,
  description TEXT,
  cleanup_instructions TEXT,
  photos_before TEXT[],
  reported_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    jsonb_build_object(
      'lat', ST_Y(ca.location::geometry),
      'lng', ST_X(ca.location::geometry)
    ) as location,
    ca.severity,
    ca.status,
    ca.description,
    ca.cleanup_instructions,
    ca.photos_before,
    ca.reported_by,
    ca.created_at,
    ca.updated_at
  FROM public.cleanup_areas ca
  ORDER BY ca.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to everyone
GRANT EXECUTE ON FUNCTION get_user_groups(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_leaderboard(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_areas_with_coordinates() TO authenticated;
GRANT EXECUTE ON FUNCTION get_areas_with_coordinates() TO anon;

-- Test the functions
SELECT 'Testing functions:' as status;
SELECT * FROM get_areas_with_coordinates();
SELECT * FROM public.profiles;
SELECT * FROM public.groups;
SELECT * FROM public.group_members;

-- Success message
SELECT 'Debug complete! Functions recreated! 🎉' as status;