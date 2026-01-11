-- Update can_create_page to recognize annual plans
CREATE OR REPLACE FUNCTION public.can_create_page(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE
      -- Not active subscription = cannot create
      WHEN NOT public.is_subscription_active(check_user_id) THEN false
      -- Check limits based on plan (excluding legal pages from count)
      -- Annual plans have same limits as their monthly counterparts
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 8
          WHEN 'pro_yearly' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 8
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 8
          WHEN 'essential' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 2
          WHEN 'essential_yearly' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 2
          ELSE (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) < 1 -- FREE plan: 1 page only
        END
    END;
$$;

-- Update is_subscription_active to recognize annual plans as active
CREATE OR REPLACE FUNCTION public.is_subscription_active(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(
      -- Active paid subscription (monthly or yearly)
      subscription_status = 'active' OR
      -- Free plan is always active
      subscription_status = 'free',
      false
    )
  FROM public.profiles
  WHERE id = check_user_id;
$$;

-- Update get_page_owner_plan to recognize annual plans for watermark logic
CREATE OR REPLACE FUNCTION public.get_page_owner_plan(page_id uuid)
RETURNS TABLE(plan_type text, is_trial boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.plan_type,
    -- Show watermark for free/essential (monthly), but NOT for pro or annual plans
    (p.plan_type = 'free' OR p.plan_type = 'essential') as is_trial
  FROM public.profiles p
  INNER JOIN public.landing_pages lp ON lp.user_id = p.id
  WHERE lp.id = page_id
    AND lp.is_published = true
    AND public.is_subscription_active(lp.user_id);
$$;

-- Update admin_get_stats to count annual plans with their base plan type
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS TABLE(total_users bigint, pro_users bigint, essential_users bigint, free_users bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_users,
    COUNT(*) FILTER (WHERE plan_type IN ('pro', 'pro_yearly'))::bigint as pro_users,
    COUNT(*) FILTER (WHERE plan_type IN ('essential', 'essential_yearly'))::bigint as essential_users,
    COUNT(*) FILTER (WHERE plan_type = 'free' OR plan_type IS NULL)::bigint as free_users
  FROM public.profiles;
END;
$$;