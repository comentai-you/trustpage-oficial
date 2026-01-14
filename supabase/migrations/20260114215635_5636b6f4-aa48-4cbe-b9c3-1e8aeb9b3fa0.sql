-- Remover o constraint antigo que não inclui planos anuais
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_type_check;

-- Adicionar novo constraint com todos os planos válidos
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_type_check 
CHECK (plan_type IN ('free', 'essential', 'essential_yearly', 'pro', 'pro_yearly', 'elite'));