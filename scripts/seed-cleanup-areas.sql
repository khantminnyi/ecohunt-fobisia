-- Insert real cleanup areas for EcoHunt AI
-- Run this SQL in Supabase SQL Editor after running setup-database.sql

-- First, create a system user profile if no profiles exist
DO $$
DECLARE
  system_user_id UUID;
  first_auth_user_id UUID;
BEGIN
  -- Get the first auth user
  SELECT id INTO first_auth_user_id FROM auth.users LIMIT 1;
  
  -- If there's an auth user but no profile, create one
  IF first_auth_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, total_points, created_at, updated_at)
    VALUES (first_auth_user_id, 'SystemReporter', 0, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- If no auth users exist, create a placeholder UUID for demo
    system_user_id := gen_random_uuid();
    INSERT INTO public.profiles (id, username, total_points, created_at, updated_at)
    VALUES (system_user_id, 'SystemReporter', 0, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Insert cleanup areas at the specified Malaysia coordinates
INSERT INTO public.cleanup_areas (
  location,
  severity,
  status,
  description,
  cleanup_instructions,
  photos_before,
  reported_by
) VALUES
-- High priority area
(
  ST_GeogFromText('POINT(101.763832 2.747749)'),
  'high',
  'available',
  'Large accumulation of plastic bottles and food waste near park entrance',
  'Wear gloves for safety. Separate recyclables from general waste. Use provided bins for proper disposal. Watch for sharp objects hidden in debris. Focus on plastic bottles which can be recycled.',
  ARRAY['/demo-trash-1.jpg'],
  (SELECT id FROM public.profiles WHERE username = 'SystemReporter' LIMIT 1)
),
-- Medium priority area
(
  ST_GeogFromText('POINT(101.764506 2.747656)'),
  'medium',
  'available',
  'Scattered cigarette butts and paper litter around bus stop',
  'Use litter picker to collect cigarette butts. Focus on areas under benches and in bushes. Separate paper waste for recycling. Dispose of cigarette butts in designated waste bins.',
  ARRAY['/demo-trash-2.jpg'],
  (SELECT id FROM public.profiles WHERE username = 'SystemReporter' LIMIT 1)
),
-- Low priority area
(
  ST_GeogFromText('POINT(101.763534 2.747317)'),
  'low',
  'available',
  'Few pieces of paper and empty cans on sidewalk',
  'Quick pickup task. Separate aluminum cans for recycling. Dispose of paper waste in general bin. Use grabber tool for efficient collection.',
  ARRAY['/demo-trash-3.jpg'],
  (SELECT id FROM public.profiles WHERE username = 'SystemReporter' LIMIT 1)
);

-- Verify the areas were inserted correctly
SELECT 
  id,
  ST_X(location::geometry) as longitude,
  ST_Y(location::geometry) as latitude,
  severity,
  status,
  description,
  created_at
FROM public.cleanup_areas
ORDER BY created_at DESC;

-- Success message
SELECT 'Cleanup areas inserted successfully! 🌍' as status;