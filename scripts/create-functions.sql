-- Create database functions for EcoHunt AI
-- Run this SQL in Supabase SQL Editor after running setup-database.sql

-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Update user's total points in profiles table
  UPDATE public.profiles 
  SET 
    total_points = total_points + points_to_add,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- If user doesn't exist in profiles, create entry
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, total_points, created_at, updated_at)
    VALUES (user_id, points_to_add, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      total_points = profiles.total_points + points_to_add,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all areas with coordinates extracted from PostGIS geography
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

-- Function to get areas within bounds (for map filtering)
CREATE OR REPLACE FUNCTION get_areas_in_bounds(
  north_lat FLOAT,
  south_lat FLOAT,
  east_lng FLOAT,
  west_lng FLOAT
)
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
  WHERE ST_Within(
    ca.location::geometry,
    ST_MakeEnvelope(west_lng, south_lat, east_lng, north_lat, 4326)
  )
  ORDER BY ca.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user achievements
CREATE OR REPLACE FUNCTION check_user_achievements(user_id UUID)
RETURNS TABLE (
  achievement_id UUID,
  achievement_name TEXT,
  points_required INTEGER
) AS $$
DECLARE
  user_points INTEGER;
  user_cleanups INTEGER;
BEGIN
  -- Get user's current points and cleanup count
  SELECT total_points INTO user_points 
  FROM public.profiles 
  WHERE id = user_id;
  
  SELECT COUNT(*) INTO user_cleanups
  FROM public.cleanup_claims
  WHERE claimed_by = user_id AND status = 'completed';
  
  -- Return achievements the user qualifies for but hasn't earned yet
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.points_required
  FROM public.achievements a
  WHERE 
    a.points_required <= COALESCE(user_points, 0)
    AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua 
      WHERE ua.user_id = check_user_achievements.user_id 
      AND ua.achievement_id = a.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_user_points(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_areas_with_coordinates() TO authenticated;
GRANT EXECUTE ON FUNCTION get_areas_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_achievements(UUID) TO authenticated;

-- Also grant to anon users for public access to areas
GRANT EXECUTE ON FUNCTION get_areas_with_coordinates() TO anon;
GRANT EXECUTE ON FUNCTION get_areas_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT) TO anon;

-- Success message
SELECT 'Database functions created successfully! 🚀' as status;