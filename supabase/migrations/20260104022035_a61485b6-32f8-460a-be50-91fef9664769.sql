-- Create a function to check if a slug is a legal page
CREATE OR REPLACE FUNCTION public.is_legal_page_slug(page_slug text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT page_slug IN ('politica-de-privacidade', 'termos-de-uso', 'contato')
$$;

-- Update can_create_page to not count legal pages in the limit
CREATE OR REPLACE FUNCTION public.can_create_page(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE
      -- Not active subscription = cannot create
      WHEN NOT public.is_subscription_active(check_user_id) THEN false
      -- Check limits based on plan (excluding legal pages from count)
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 8
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 8
          WHEN 'essential' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 2
          ELSE (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 1 -- FREE plan: 1 page only
        END
    END;
$$;

-- Create a separate policy for legal pages that bypasses the limit
CREATE POLICY "Users can create legal pages" 
ON public.landing_pages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND public.is_legal_page_slug(slug)
  AND public.is_subscription_active(auth.uid())
);

-- Add comment for documentation
COMMENT ON FUNCTION public.is_legal_page_slug(text) IS 'Checks if a slug is reserved for legal pages (privacy, terms, contact)';