-- 1) Harden public lead collection: remove direct INSERT capability for anon/authenticated
DROP POLICY IF EXISTS "Rate limited lead submissions" ON public.leads;

-- Deny direct inserts even if someone later misconfigures RLS
REVOKE INSERT ON TABLE public.leads FROM anon, authenticated;


-- 2) Move payment processor identifiers out of profiles
CREATE TABLE IF NOT EXISTS public.billing_customers (
  user_id uuid PRIMARY KEY,
  kiwify_customer_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view billing customers" ON public.billing_customers;
CREATE POLICY "Admins can view billing customers"
ON public.billing_customers
FOR SELECT
USING (public.is_admin());

-- Backfill existing values (safe no-op if none)
INSERT INTO public.billing_customers (user_id, kiwify_customer_id)
SELECT p.id, p.kiwify_customer_id
FROM public.profiles p
WHERE p.kiwify_customer_id IS NOT NULL
ON CONFLICT (user_id)
DO UPDATE SET kiwify_customer_id = EXCLUDED.kiwify_customer_id;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS kiwify_customer_id;


-- 3) Add audit logging for subscription/plan changes
CREATE TABLE IF NOT EXISTS public.subscription_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  actor_user_id uuid NULL,
  actor_type text NOT NULL,
  old_plan_type text NULL,
  new_plan_type text NULL,
  old_subscription_status text NULL,
  new_subscription_status text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view; no direct writes/edits via RLS policies
DROP POLICY IF EXISTS "Admins can view subscription audit logs" ON public.subscription_audit_logs;
CREATE POLICY "Admins can view subscription audit logs"
ON public.subscription_audit_logs
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "No one can update subscription audit logs" ON public.subscription_audit_logs;
CREATE POLICY "No one can update subscription audit logs"
ON public.subscription_audit_logs
FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "No one can delete subscription audit logs" ON public.subscription_audit_logs;
CREATE POLICY "No one can delete subscription audit logs"
ON public.subscription_audit_logs
FOR DELETE
USING (false);


-- 4) Update functions to stop referencing removed column and to write audit logs
CREATE OR REPLACE FUNCTION public.protect_plan_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Permitir alteração se:
  -- 1. É service_role (webhooks, migrations)
  -- 2. É admin (via RPC is_admin())
  IF current_setting('role', true) = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Caso contrário, proteger os campos sensíveis
  NEW.plan_type := OLD.plan_type;
  NEW.subscription_status := OLD.subscription_status;
  NEW.subscription_updated_at := OLD.subscription_updated_at;

  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION public.update_user_plan(
  target_user_id uuid,
  new_plan_type text,
  new_status text DEFAULT 'active'::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_plan text;
  old_status text;
  jwt_role text;
  actor_type text;
  actor_id uuid;
BEGIN
  -- Verificar se é admin OU service role
  jwt_role := current_setting('request.jwt.claims', true)::json->>'role';

  IF NOT public.is_admin() AND jwt_role != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Only admins can modify user plans';
  END IF;

  -- Get old values for audit
  SELECT plan_type, subscription_status
    INTO old_plan, old_status
  FROM public.profiles
  WHERE id = target_user_id;

  -- Update the user plan
  UPDATE public.profiles
  SET
    plan_type = new_plan_type,
    subscription_status = new_status,
    subscription_updated_at = now()
  WHERE id = target_user_id;

  -- Identify actor
  IF public.is_admin() THEN
    actor_type := 'admin';
    actor_id := auth.uid();
  ELSIF jwt_role = 'service_role' THEN
    actor_type := 'service_role';
    actor_id := NULL;
  ELSE
    actor_type := COALESCE(jwt_role, current_setting('role', true), 'unknown');
    actor_id := auth.uid();
  END IF;

  -- Write audit log (bypasses RLS because this function is SECURITY DEFINER)
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

  -- Log the action with details (only if called by admin)
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
