-- Atualizar o plano do Dr. Traição para PRO diretamente
-- Este UPDATE usa service role então não passa pela RPC
UPDATE public.profiles
SET 
  plan_type = 'pro',
  subscription_status = 'active',
  subscription_updated_at = now()
WHERE id = 'bc34bf82-e5cf-4680-a1fd-dfb35c94af2b';

-- Verificar e corrigir a função update_user_plan para garantir que funciona
CREATE OR REPLACE FUNCTION public.update_user_plan(target_user_id uuid, new_plan_type text, new_status text DEFAULT 'active'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  old_plan text;
  old_status text;
BEGIN
  -- Verificar se é admin OU service role
  IF NOT public.is_admin() AND current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
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
$function$;