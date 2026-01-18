-- Add monthly views counter to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_views integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_views_reset_at timestamp with time zone DEFAULT now();

-- Create function to check if page should be blocked due to view limit
CREATE OR REPLACE FUNCTION public.check_page_view_limit(page_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
  owner_plan text;
  current_views integer;
  is_blocked boolean := false;
BEGIN
  -- Get the page owner
  SELECT user_id INTO owner_id
  FROM landing_pages
  WHERE id = page_id AND is_published = true;
  
  IF owner_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Page not found');
  END IF;
  
  -- Get owner's plan and current views
  SELECT plan_type, monthly_views INTO owner_plan, current_views
  FROM profiles
  WHERE id = owner_id;
  
  -- Only free plan has limits
  IF owner_plan = 'free' THEN
    is_blocked := current_views >= 1000;
  END IF;
  
  RETURN jsonb_build_object(
    'is_blocked', is_blocked,
    'plan_type', owner_plan,
    'current_views', current_views,
    'limit', CASE WHEN owner_plan = 'free' THEN 1000 ELSE NULL END
  );
END;
$$;

-- Create function to increment page views (only for free plan)
CREATE OR REPLACE FUNCTION public.increment_monthly_views(page_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
  owner_plan text;
  current_views integer;
  is_blocked boolean := false;
BEGIN
  -- Get the page owner
  SELECT user_id INTO owner_id
  FROM landing_pages
  WHERE id = page_id AND is_published = true;
  
  IF owner_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Page not found', 'is_blocked', false);
  END IF;
  
  -- Get owner's plan
  SELECT plan_type INTO owner_plan
  FROM profiles
  WHERE id = owner_id;
  
  -- Only increment and check for free plan
  IF owner_plan = 'free' THEN
    -- Increment the counter
    UPDATE profiles 
    SET monthly_views = monthly_views + 1
    WHERE id = owner_id
    RETURNING monthly_views INTO current_views;
    
    -- Check if blocked after increment
    is_blocked := current_views >= 1000;
    
    RETURN jsonb_build_object(
      'is_blocked', is_blocked,
      'plan_type', owner_plan,
      'current_views', current_views,
      'limit', 1000
    );
  ELSE
    -- Paid plans have unlimited views
    RETURN jsonb_build_object(
      'is_blocked', false,
      'plan_type', owner_plan,
      'current_views', NULL,
      'limit', NULL
    );
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_page_view_limit(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_monthly_views(uuid) TO anon, authenticated;