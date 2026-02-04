-- Create function to check cloned page limits per plan
CREATE OR REPLACE FUNCTION public.can_create_cloned_page(check_user_id uuid)
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
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.cloned_pages WHERE user_id = check_user_id) < 6
          WHEN 'pro_yearly' THEN (SELECT COUNT(*) FROM public.cloned_pages WHERE user_id = check_user_id) < 6
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.cloned_pages WHERE user_id = check_user_id) < 10
          WHEN 'essential' THEN (SELECT COUNT(*) FROM public.cloned_pages WHERE user_id = check_user_id) < 2
          WHEN 'essential_yearly' THEN (SELECT COUNT(*) FROM public.cloned_pages WHERE user_id = check_user_id) < 2
          ELSE false -- FREE plan: cannot create cloned pages
        END
    END;
$$;

-- Create helper function to get max cloned pages for plan
CREATE OR REPLACE FUNCTION public.get_max_cloned_pages_for_plan(check_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
      WHEN 'pro' THEN 6
      WHEN 'pro_yearly' THEN 6
      WHEN 'elite' THEN 10
      WHEN 'essential' THEN 2
      WHEN 'essential_yearly' THEN 2
      ELSE 0 -- FREE plan: 0 cloned pages
    END;
$$;

-- Update RLS policy for cloned_pages to use the new function
DROP POLICY IF EXISTS "Users can create cloned pages based on subscription" ON public.cloned_pages;

CREATE POLICY "Users can create cloned pages based on subscription" 
ON public.cloned_pages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND can_create_cloned_page(auth.uid())
);