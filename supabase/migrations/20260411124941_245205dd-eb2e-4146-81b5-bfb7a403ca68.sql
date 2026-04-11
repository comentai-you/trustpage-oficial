UPDATE public.profiles
SET plan_type = 'pro',
    subscription_status = 'active',
    subscription_updated_at = now()
WHERE id = 'c148e4cb-4bfe-4b29-b77c-40df7faf2aeb';

INSERT INTO public.subscription_audit_logs (target_user_id, actor_type, old_plan_type, new_plan_type, old_subscription_status, new_subscription_status)
VALUES ('c148e4cb-4bfe-4b29-b77c-40df7faf2aeb', 'service_role', 'free', 'pro', 'free', 'active');