-- Fix update_user_plan function to require admin authorization
-- This prevents privilege escalation attacks where any authenticated user could upgrade themselves

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
BEGIN
  -- Only allow admins or service role (for webhooks)
  -- Check if caller is admin using the existing is_admin() function
  IF NOT public.is_admin() AND current_setting('role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Only admins can modify user plans';
  END IF;
  
  UPDATE public.profiles
  SET 
    plan_type = new_plan_type,
    subscription_status = new_status,
    subscription_updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;