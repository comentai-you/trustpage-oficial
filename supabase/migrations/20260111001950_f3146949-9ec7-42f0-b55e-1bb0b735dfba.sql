-- Função update_user_plan (recriada para garantir existência)
CREATE OR REPLACE FUNCTION public.update_user_plan(
  target_user_id uuid,
  new_plan_type text,
  new_status text DEFAULT 'active'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    plan_type = new_plan_type,
    subscription_status = new_status,
    subscription_updated_at = now(),
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;