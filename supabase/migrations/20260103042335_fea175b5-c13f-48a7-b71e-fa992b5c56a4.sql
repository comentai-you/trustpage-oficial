-- Update can_create_page function with new limits:
-- Essential: 2 pages
-- PRO: 8 pages

CREATE OR REPLACE FUNCTION public.can_create_page(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE
      -- Not active subscription = cannot create
      WHEN NOT public.is_subscription_active(check_user_id) THEN false
      -- Check limits based on plan
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id) < 8
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id) < 8
          WHEN 'essential' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id) < 2
          ELSE (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id) < 1 -- FREE plan: 1 page only
        END
    END;
$$;