-- =====================================================
-- FIX 1: PROFILES PUBLIC EXPOSURE
-- Restrict profile access to owner only
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create policy for users to view only their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- =====================================================
-- FIX 2: SERVER-SIDE SLUG VALIDATION
-- Add database constraints and trigger for slug validation
-- =====================================================

-- Add CHECK constraint for slug format
ALTER TABLE public.landing_pages
ADD CONSTRAINT slug_format_check
CHECK (
  slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' AND
  slug !~ '--' AND
  LENGTH(slug) >= 2 AND
  LENGTH(slug) <= 50
);

-- Create reserved slugs table
CREATE TABLE IF NOT EXISTS public.reserved_slugs (
  slug text PRIMARY KEY,
  reason text NOT NULL
);

-- Insert reserved slugs (system routes)
INSERT INTO public.reserved_slugs (slug, reason) VALUES
  ('admin', 'System administration'),
  ('api', 'API endpoints'),
  ('auth', 'Authentication'),
  ('dashboard', 'User dashboard'),
  ('login', 'Login page'),
  ('signup', 'Signup page'),
  ('register', 'Register page'),
  ('edit', 'Edit route'),
  ('new', 'Create route'),
  ('create', 'Create route'),
  ('delete', 'Delete route'),
  ('settings', 'Settings route'),
  ('profile', 'Profile route'),
  ('user', 'User route'),
  ('users', 'Users route'),
  ('pages', 'Pages route'),
  ('page', 'Page route'),
  ('app', 'App route'),
  ('home', 'Home route'),
  ('about', 'About route'),
  ('contact', 'Contact route'),
  ('blog', 'Blog route'),
  ('checkout', 'Checkout route'),
  ('cart', 'Cart route'),
  ('account', 'Account route'),
  ('pricing', 'Pricing route'),
  ('suporte', 'Support route'),
  ('ajuda', 'Help route'),
  ('termos', 'Terms route'),
  ('404', 'Error page')
ON CONFLICT (slug) DO NOTHING;

-- Create validation trigger function
CREATE OR REPLACE FUNCTION public.validate_landing_page_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Normalize slug
  NEW.slug = lower(trim(NEW.slug));
  
  -- Check reserved slugs
  IF EXISTS (SELECT 1 FROM public.reserved_slugs WHERE slug = NEW.slug) THEN
    RAISE EXCEPTION 'Slug "%" is reserved by the system', NEW.slug;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_slug_before_insert_update ON public.landing_pages;
CREATE TRIGGER validate_slug_before_insert_update
BEFORE INSERT OR UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.validate_landing_page_slug();

-- =====================================================
-- FIX 3: SERVER-SIDE SUBSCRIPTION/TRIAL LIMITS
-- Create helper function and update RLS policies
-- =====================================================

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION public.is_subscription_active(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(
      subscription_status = 'active' OR
      (
        subscription_status = 'trial' AND 
        created_at > now() - interval '14 days'
      ),
      false
    )
  FROM public.profiles
  WHERE id = check_user_id;
$$;

-- Create function to check page creation limit
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
      -- Active paid subscription = unlimited (or high limit)
      WHEN (SELECT subscription_status FROM public.profiles WHERE id = check_user_id) = 'active' THEN true
      -- Trial user = check page count based on plan
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id) < 20
          WHEN 'elite' THEN (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id) < 20
          ELSE (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id) < 5 -- essential
        END
    END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can update own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Public can view published pages" ON public.landing_pages;

-- Create new INSERT policy with subscription and limit checks
CREATE POLICY "Users can create pages based on subscription"
ON public.landing_pages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  public.can_create_page(auth.uid())
);

-- Create new UPDATE policy with subscription check
CREATE POLICY "Active users can update own pages"
ON public.landing_pages FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND
  public.is_subscription_active(auth.uid())
);

-- Create new SELECT policy for public pages (only from active users)
CREATE POLICY "Public can view pages from active users"
ON public.landing_pages FOR SELECT
USING (
  -- Owner can always see their own pages
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Public can see published pages from active/valid trial users
  (is_published = true AND public.is_subscription_active(user_id))
);