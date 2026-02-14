-- Remove is_admin() bypass from protect_plan_fields trigger
-- This ensures ALL plan changes flow through the audited update_user_plan() RPC
CREATE OR REPLACE FUNCTION public.protect_plan_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only service_role can modify plan fields directly
  -- Admins must use update_user_plan() RPC which has its own audit logging
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block all other direct modifications to sensitive fields
  NEW.plan_type := OLD.plan_type;
  NEW.subscription_status := OLD.subscription_status;
  NEW.subscription_updated_at := OLD.subscription_updated_at;

  RETURN NEW;
END;
$function$;