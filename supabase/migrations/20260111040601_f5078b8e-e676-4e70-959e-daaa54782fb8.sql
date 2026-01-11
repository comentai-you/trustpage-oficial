-- Add admin role to the specific user
-- First, get the user ID from profiles by looking up via auth.users email
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get user ID from auth.users by email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'samueldasilvanonato6530@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Create a function to check if current user is admin (for use in frontend)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Create a function to get all profiles for admin (bypasses RLS)
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
  email text
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

-- Create a function to get admin stats
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS TABLE (
  total_users bigint,
  pro_users bigint,
  essential_users bigint,
  free_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_users,
    COUNT(*) FILTER (WHERE plan_type = 'pro')::bigint as pro_users,
    COUNT(*) FILTER (WHERE plan_type = 'essential')::bigint as essential_users,
    COUNT(*) FILTER (WHERE plan_type = 'free' OR plan_type IS NULL)::bigint as free_users
  FROM public.profiles;
END;
$$;

-- Create admin function to update user status
CREATE OR REPLACE FUNCTION public.admin_update_user_status(target_user_id uuid, new_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;
  
  UPDATE public.profiles
  SET 
    subscription_status = new_status,
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;