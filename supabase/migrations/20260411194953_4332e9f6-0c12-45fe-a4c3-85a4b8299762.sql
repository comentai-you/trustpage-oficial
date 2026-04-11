UPDATE public.profiles
SET plan_type = 'pro',
    subscription_status = 'active',
    subscription_updated_at = now(),
    updated_at = now()
WHERE id = 'c148e4cb-4bfe-4b29-b77c-40df7faf2aeb';

INSERT INTO public.subscription_audit_logs (
  target_user_id,
  actor_user_id,
  actor_type,
  old_plan_type,
  new_plan_type,
  old_subscription_status,
  new_subscription_status
)
SELECT
  'c148e4cb-4bfe-4b29-b77c-40df7faf2aeb'::uuid,
  NULL,
  'manual_admin_fix',
  'free',
  'pro',
  'free',
  'active';