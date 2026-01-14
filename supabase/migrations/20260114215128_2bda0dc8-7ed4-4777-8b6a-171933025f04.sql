-- Remover o trigger temporariamente para atualizar o plano
DROP TRIGGER IF EXISTS protect_plan_fields_trigger ON public.profiles;

-- Atualizar o plano do Dr. Traição para PRO
UPDATE public.profiles
SET 
  plan_type = 'pro',
  subscription_status = 'active',
  subscription_updated_at = now()
WHERE id = 'bc34bf82-e5cf-4680-a1fd-dfb35c94af2b';

-- Recriar o trigger corrigido - agora verifica se é admin também
CREATE OR REPLACE FUNCTION public.protect_plan_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  NEW.kiwify_customer_id := OLD.kiwify_customer_id;
  
  RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER protect_plan_fields_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_plan_fields();