-- Fix the admin_get_all_profiles function - email column type mismatch
DROP FUNCTION IF EXISTS public.admin_get_all_profiles();

CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  plan_type text,
  subscription_status text,
  created_at timestamptz,
  updated_at timestamptz,
  email varchar(255)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.username,
    p.avatar_url,
    p.plan_type,
    p.subscription_status,
    p.created_at,
    p.updated_at,
    u.email
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;