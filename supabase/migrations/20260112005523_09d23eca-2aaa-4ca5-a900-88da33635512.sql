-- Atualizar limite de páginas PRO de 8 para 10
CREATE OR REPLACE FUNCTION public.can_create_page(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    CASE
      -- Not active subscription = cannot create
      WHEN NOT public.is_subscription_active(check_user_id) THEN false
      -- Check limits based on plan (excluding legal pages from count)
      -- Annual plans have same limits as their monthly counterparts
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 10
          WHEN 'pro_yearly' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 10
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 10
          WHEN 'essential' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 2
          WHEN 'essential_yearly' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 2
          ELSE (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 1 -- FREE plan: 1 page only
        END
    END;
$function$;