-- Drop existing functions that need return type changes
DROP FUNCTION IF EXISTS public.admin_get_all_profiles();
DROP FUNCTION IF EXISTS public.admin_get_stats();

-- Update admin_get_all_profiles to log access
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
  email character varying
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check admin access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;
  
  -- Log the action
  PERFORM public.log_admin_action('admin_get_all_profiles', NULL, NULL);
  
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
  LEFT JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Update admin_get_stats to log access  
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
  -- Check admin access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;
  
  -- Log the action
  PERFORM public.log_admin_action('admin_get_stats', NULL, NULL);
  
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_users,
    COUNT(*) FILTER (WHERE p.plan_type IN ('pro', 'pro_yearly'))::bigint as pro_users,
    COUNT(*) FILTER (WHERE p.plan_type IN ('essential', 'essential_yearly'))::bigint as essential_users,
    COUNT(*) FILTER (WHERE p.plan_type = 'free' OR p.plan_type IS NULL)::bigint as free_users
  FROM public.profiles p;
END;
$$;

-- Update update_user_plan to log changes
CREATE OR REPLACE FUNCTION public.update_user_plan(
  target_user_id uuid,
  new_plan_type text,
  new_status text DEFAULT 'active'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_plan text;
  old_status text;
BEGIN
  -- Only allow admins or service role (for webhooks)
  IF NOT public.is_admin() AND current_setting('role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Only admins can modify user plans';
  END IF;
  
  -- Get old values for audit
  SELECT plan_type, subscription_status INTO old_plan, old_status
  FROM public.profiles WHERE id = target_user_id;
  
  -- Update the user plan
  UPDATE public.profiles
  SET 
    plan_type = new_plan_type,
    subscription_status = new_status,
    subscription_updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the action with details (only if called by admin, not service role)
  IF public.is_admin() THEN
    PERFORM public.log_admin_action(
      'update_user_plan',
      target_user_id,
      jsonb_build_object(
        'old_plan', old_plan,
        'new_plan', new_plan_type,
        'old_status', old_status,
        'new_status', new_status
      )
    );
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Update admin_update_user_status to log changes
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  target_user_id uuid,
  new_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_status text;
BEGIN
  -- Check admin access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;
  
  -- Get old status for audit
  SELECT subscription_status INTO old_status
  FROM public.profiles WHERE id = target_user_id;
  
  -- Update the user status
  UPDATE public.profiles
  SET 
    subscription_status = new_status,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the action with details
  PERFORM public.log_admin_action(
    'admin_update_user_status',
    target_user_id,
    jsonb_build_object(
      'old_status', old_status,
      'new_status', new_status
    )
  );
  
  RETURN FOUND;
END;
$$;