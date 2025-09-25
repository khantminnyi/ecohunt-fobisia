-- Fix database functions for EcoHunt AI
-- Run this SQL in Supabase SQL Editor to fix the function conflict

-- Drop existing functions that might have different signatures
DROP FUNCTION IF EXISTS get_areas_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT);
DROP FUNCTION IF EXISTS get_areas_with_coordinates();

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_areas_with_coordinates() TO authenticated;
GRANT EXECUTE ON FUNCTION get_areas_with_coordinates() TO anon;

-- Test the function
SELECT * FROM get_areas_with_coordinates();

-- Success message
SELECT 'Functions fixed successfully! Markers should now appear on map! 🗺️' as status;