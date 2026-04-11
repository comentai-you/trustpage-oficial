-- Desativar o trigger que bloqueia alterações de plano
ALTER TABLE public.profiles DISABLE TRIGGER protect_plan_fields_trigger;

-- Atualizar o plano do usuário para PRO
UPDATE public.profiles
SET plan_type = 'pro',
    subscription_status = 'active',
    subscription_updated_at = now(),
    updated_at = now()
WHERE id = 'c148e4cb-4bfe-4b29-b77c-40df7faf2aeb';

-- Reativar o trigger imediatamente
ALTER TABLE public.profiles ENABLE TRIGGER protect_plan_fields_trigger;

-- Registrar no audit log
INSERT INTO public.subscription_audit_logs (
  target_user_id, actor_user_id, actor_type,
  old_plan_type, new_plan_type,
  old_subscription_status, new_subscription_status
) VALUES (
  'c148e4cb-4bfe-4b29-b77c-40df7faf2aeb', NULL, 'manual_admin_fix',
  'free', 'pro', 'free', 'active'
);