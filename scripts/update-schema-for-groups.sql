-- Update database schema to make groups central to cleanup areas
-- Run this SQL in Supabase SQL Editor

-- Add group_id to cleanup_areas table
ALTER TABLE public.cleanup_areas 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id);

-- Create index for group-based area queries
CREATE INDEX IF NOT EXISTS idx_cleanup_areas_group_id ON public.cleanup_areas(group_id);

-- Update RLS policies to be group-aware
DROP POLICY IF EXISTS "Cleanup areas are viewable by everyone" ON public.cleanup_areas;
DROP POLICY IF EXISTS "Authenticated users can report areas" ON public.cleanup_areas;

-- New RLS policies for group-based areas
CREATE POLICY "Users can view areas from their groups" ON public.cleanup_areas 
FOR SELECT USING (
  group_id IN (
    SELECT gm.group_id 
    FROM public.group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can report areas" ON public.cleanup_areas 
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  group_id IN (
    SELECT gm.group_id 
    FROM public.group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);

-- Update claims to be group-aware
ALTER TABLE public.cleanup_claims 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id);

-- Update RLS for claims
DROP POLICY IF EXISTS "Cleanup claims are viewable by everyone" ON public.cleanup_claims;
DROP POLICY IF EXISTS "Users can claim areas" ON public.cleanup_claims;
DROP POLICY IF EXISTS "Users can update their claims" ON public.cleanup_claims;

CREATE POLICY "Users can view claims from their groups" ON public.cleanup_claims 
FOR SELECT USING (
  group_id IN (
    SELECT gm.group_id 
    FROM public.group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can claim areas" ON public.cleanup_claims 
FOR INSERT WITH CHECK (
  auth.uid() = claimed_by AND
  group_id IN (
    SELECT gm.group_id 
    FROM public.group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);

-- Create a default group for existing data
DO $$
DECLARE
  default_group_id UUID;
BEGIN
  -- Create a default "Global Cleanup" group
  INSERT INTO public.groups (name, description, invite_code, created_by)
  VALUES (
    'Global Cleanup Community',
    'Default group for all cleanup activities',
    'GLOBAL-ECO',
    (SELECT id FROM public.profiles LIMIT 1)
  )
  ON CONFLICT (invite_code) DO NOTHING
  RETURNING id INTO default_group_id;
  
  -- Get the group ID if it already exists
  IF default_group_id IS NULL THEN
    SELECT id INTO default_group_id FROM public.groups WHERE invite_code = 'GLOBAL-ECO';
  END IF;
  
  -- Update existing cleanup areas to belong to default group
  UPDATE public.cleanup_areas 
  SET group_id = default_group_id 
  WHERE group_id IS NULL;
  
  -- Add all existing users to the default group
  INSERT INTO public.group_members (group_id, user_id, role)
  SELECT default_group_id, id, 'member'
  FROM public.profiles
  WHERE NOT EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.user_id = profiles.id
  )
  ON CONFLICT (group_id, user_id) DO NOTHING;
END $$;

-- Function to get user's groups
CREATE OR REPLACE FUNCTION get_user_groups(user_id UUID)
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
  WHERE gm.user_id = get_user_groups.user_id
  ORDER BY gm.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get group leaderboard
CREATE OR REPLACE FUNCTION get_group_leaderboard(group_id UUID)
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
  WHERE gm.group_id = get_group_leaderboard.group_id
  ORDER BY p.total_points DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get areas for specific group
CREATE OR REPLACE FUNCTION get_group_areas(group_id UUID)
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
  WHERE ca.group_id = get_group_areas.group_id
  ORDER BY ca.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_groups(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_leaderboard(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_areas(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_areas(UUID) TO anon;

-- Success message
SELECT 'Group-based schema updated successfully! 👥' as status;