CREATE OR REPLACE FUNCTION public.protect_plan_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_role text := '';
  bypass_enabled text := 'off';
BEGIN
  BEGIN
    jwt_role := COALESCE((current_setting('request.jwt.claims', true))::json ->> 'role', '');
  EXCEPTION WHEN OTHERS THEN
    jwt_role := '';
  END;

  bypass_enabled := COALESCE(current_setting('app.bypass_plan_protection', true), 'off');

  IF current_setting('role', true) = 'service_role'
     OR jwt_role = 'service_role'
     OR bypass_enabled = 'on' THEN
    RETURN NEW;
  END IF;

  NEW.plan_type := OLD.plan_type;
  NEW.subscription_status := OLD.subscription_status;
  NEW.subscription_updated_at := OLD.subscription_updated_at;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_plan(target_user_id uuid, new_plan_type text, new_status text DEFAULT 'active'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  old_plan text;
  old_status text;
  final_plan text;
  final_status text;
  jwt_role text := '';
  actor_type text;
  actor_id uuid;
BEGIN
  BEGIN
    jwt_role := COALESCE((current_setting('request.jwt.claims', true))::json ->> 'role', '');
  EXCEPTION WHEN OTHERS THEN
    jwt_role := '';
  END;

  IF NOT public.is_admin() AND jwt_role != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Only admins can modify user plans';
  END IF;

  SELECT plan_type, subscription_status
    INTO old_plan, old_status
  FROM public.profiles
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found for plan update: %', target_user_id;
  END IF;

  BEGIN
    PERFORM set_config('app.bypass_plan_protection', 'on', true);

    UPDATE public.profiles
    SET
      plan_type = new_plan_type,
      subscription_status = new_status,
      subscription_updated_at = now(),
      updated_at = now()
    WHERE id = target_user_id;

    PERFORM set_config('app.bypass_plan_protection', 'off', true);
  EXCEPTION WHEN OTHERS THEN
    PERFORM set_config('app.bypass_plan_protection', 'off', true);
    RAISE;
  END;

  SELECT plan_type, subscription_status
    INTO final_plan, final_status
  FROM public.profiles
  WHERE id = target_user_id;

  IF final_plan IS DISTINCT FROM new_plan_type OR final_status IS DISTINCT FROM new_status THEN
    RAISE EXCEPTION 'Plan update was not applied for user %', target_user_id;
  END IF;

  IF public.is_admin() THEN
    actor_type := 'admin';
    actor_id := auth.uid();
  ELSIF jwt_role = 'service_role' THEN
    actor_type := 'service_role';
    actor_id := NULL;
  ELSE
    actor_type := COALESCE(NULLIF(jwt_role, ''), current_setting('role', true), 'unknown');
    actor_id := auth.uid();
  END IF;

  INSERT INTO public.subscription_audit_logs (
    target_user_id,
    actor_user_id,
    actor_type,
    old_plan_type,
    new_plan_type,
    old_subscription_status,
    new_subscription_status
  ) VALUES (
    target_user_id,
    actor_id,
    actor_type,
    old_plan,
    new_plan_type,
    old_status,
    new_status
  );

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

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_user_status(target_user_id uuid, new_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  old_status text;
  final_status text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  SELECT subscription_status INTO old_status
  FROM public.profiles
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found for status update: %', target_user_id;
  END IF;

  BEGIN
    PERFORM set_config('app.bypass_plan_protection', 'on', true);

    UPDATE public.profiles
    SET 
      subscription_status = new_status,
      subscription_updated_at = now(),
      updated_at = now()
    WHERE id = target_user_id;

    PERFORM set_config('app.bypass_plan_protection', 'off', true);
  EXCEPTION WHEN OTHERS THEN
    PERFORM set_config('app.bypass_plan_protection', 'off', true);
    RAISE;
  END;

  SELECT subscription_status INTO final_status
  FROM public.profiles
  WHERE id = target_user_id;

  IF final_status IS DISTINCT FROM new_status THEN
    RAISE EXCEPTION 'Status update was not applied for user %', target_user_id;
  END IF;

  PERFORM public.log_admin_action(
    'admin_update_user_status',
    target_user_id,
    jsonb_build_object(
      'old_status', old_status,
      'new_status', new_status
    )
  );

  RETURN true;
END;
$function$;