-- Create table for multiple custom domains per user
CREATE TABLE public.user_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(domain)
);

-- Create index for faster lookups
CREATE INDEX idx_user_domains_user_id ON public.user_domains(user_id);
CREATE INDEX idx_user_domains_domain ON public.user_domains(domain);

-- Enable RLS
ALTER TABLE public.user_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own domains"
ON public.user_domains
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own domains"
ON public.user_domains
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
ON public.user_domains
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains"
ON public.user_domains
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to check domain limits based on plan
CREATE OR REPLACE FUNCTION public.can_add_domain(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE
      WHEN NOT public.is_subscription_active(check_user_id) THEN false
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.user_domains WHERE user_id = check_user_id) < 3
          WHEN 'pro_yearly' THEN (SELECT COUNT(*) FROM public.user_domains WHERE user_id = check_user_id) < 3
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.user_domains WHERE user_id = check_user_id) < 10
          ELSE false -- Free and Essential plans cannot add domains
        END
    END;
$$;

-- Create function to get domain count for user
CREATE OR REPLACE FUNCTION public.get_user_domain_count(check_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER FROM public.user_domains WHERE user_id = check_user_id;
$$;

-- Create function to get max domains for plan
CREATE OR REPLACE FUNCTION public.get_max_domains_for_plan(check_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
      WHEN 'pro' THEN 3
      WHEN 'pro_yearly' THEN 3
      WHEN 'elite' THEN 10
      ELSE 0
    END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_user_domains_updated_at
BEFORE UPDATE ON public.user_domains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing domains from profiles to new table
INSERT INTO public.user_domains (user_id, domain, verified, is_primary)
SELECT id, custom_domain, COALESCE(domain_verified, false), true
FROM public.profiles
WHERE custom_domain IS NOT NULL AND custom_domain != '';