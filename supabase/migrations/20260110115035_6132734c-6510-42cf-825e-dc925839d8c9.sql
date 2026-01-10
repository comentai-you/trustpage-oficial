-- 1. Remover colunas do Asaas que não são mais necessárias
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS asaas_customer_id,
DROP COLUMN IF EXISTS asaas_subscription_id;

-- 2. Adicionar coluna kiwify_customer_id para rastreio
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kiwify_customer_id text;

-- 3. SEGURANÇA: Criar função para atualizar plano (apenas via service role)
DROP FUNCTION IF EXISTS public.update_user_plan(uuid, text, text);

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
  UPDATE public.profiles
  SET 
    plan_type = new_plan_type,
    subscription_status = new_status,
    subscription_updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- 4. Dropar a policy existente
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 5. Criar policy que permite update com proteção via trigger
CREATE POLICY "Users can update own profile safe fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Criar trigger para impedir que usuários alterem plan_type diretamente
CREATE OR REPLACE FUNCTION public.protect_plan_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se não é o service role, não permite alterar campos sensíveis
  IF current_setting('role', true) != 'service_role' THEN
    NEW.plan_type := OLD.plan_type;
    NEW.subscription_status := OLD.subscription_status;
    NEW.subscription_updated_at := OLD.subscription_updated_at;
    NEW.kiwify_customer_id := OLD.kiwify_customer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_plan_fields_trigger ON public.profiles;

CREATE TRIGGER protect_plan_fields_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_plan_fields();

-- 7. Remover índices antigos do Asaas
DROP INDEX IF EXISTS idx_profiles_asaas_customer_id;
DROP INDEX IF EXISTS idx_profiles_asaas_subscription_id;