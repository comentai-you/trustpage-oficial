-- Atualizar função can_create_page para novos limites de páginas
-- FREE: 1 página, ESSENTIAL: 5 páginas, PRO: 20 páginas
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
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 20
          WHEN 'pro_yearly' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 20
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 20
          WHEN 'essential' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 5
          WHEN 'essential_yearly' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 5
          ELSE (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 1 -- FREE plan: 1 page only
        END
    END;
$function$;

-- Atualizar função can_add_domain para novos limites
-- FREE: 0 domínios, ESSENTIAL: 1 domínio, PRO: 5 domínios
CREATE OR REPLACE FUNCTION public.can_add_domain(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    CASE
      WHEN NOT public.is_subscription_active(check_user_id) THEN false
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.user_domains WHERE user_id = check_user_id) < 5
          WHEN 'pro_yearly' THEN (SELECT COUNT(*) FROM public.user_domains WHERE user_id = check_user_id) < 5
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.user_domains WHERE user_id = check_user_id) < 10
          WHEN 'essential' THEN (SELECT COUNT(*) FROM public.user_domains WHERE user_id = check_user_id) < 1
          WHEN 'essential_yearly' THEN (SELECT COUNT(*) FROM public.user_domains WHERE user_id = check_user_id) < 1
          ELSE false -- Free plans cannot add domains
        END
    END;
$function$;

-- Atualizar função get_max_domains_for_plan para novos limites
CREATE OR REPLACE FUNCTION public.get_max_domains_for_plan(check_user_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
      WHEN 'pro' THEN 5
      WHEN 'pro_yearly' THEN 5
      WHEN 'elite' THEN 10
      WHEN 'essential' THEN 1
      WHEN 'essential_yearly' THEN 1
      ELSE 0
    END;
$function$;

-- Atualizar função get_page_owner_plan para remover watermark em ESSENTIAL e PRO
CREATE OR REPLACE FUNCTION public.get_page_owner_plan(page_id uuid)
 RETURNS TABLE(plan_type text, is_trial boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.plan_type,
    -- Mostrar watermark APENAS para FREE (essential e pro não mostram)
    (p.plan_type = 'free') as is_trial
  FROM public.profiles p
  INNER JOIN public.landing_pages lp ON lp.user_id = p.id
  WHERE lp.id = page_id
    AND lp.is_published = true
    AND public.is_subscription_active(lp.user_id);
$function$;