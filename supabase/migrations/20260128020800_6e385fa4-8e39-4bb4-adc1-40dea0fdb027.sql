-- =====================================================
-- FIX 1: Blog Storage - Restrict to Admins Only
-- =====================================================

-- Drop existing policies that allow any authenticated user
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;

-- Create admin-only policies using public.is_admin() function
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-content' AND 
  public.is_admin()
);

CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-content' AND 
  public.is_admin()
);

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-content' AND 
  public.is_admin()
);

-- =====================================================
-- FIX 2: Landing Pages - Restrict direct SELECT to owners
-- The public view is handled by get_published_page_by_slug RPC
-- =====================================================

-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Public can view pages from active users" ON public.landing_pages;

-- Users can only view their own landing pages directly
-- Public access is handled via SECURITY DEFINER RPC functions

-- =====================================================
-- FIX 3: Leads - Add rate limiting and security improvements
-- Add a function to rate limit lead submissions per landing page
-- =====================================================

-- Create rate limiting function for lead submissions
CREATE OR REPLACE FUNCTION public.can_submit_lead(target_page_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_count integer;
  page_exists boolean;
BEGIN
  -- First verify the page exists, is published, and owner has active subscription
  SELECT EXISTS(
    SELECT 1 FROM public.landing_pages lp
    WHERE lp.id = target_page_id
      AND lp.is_published = true
      AND public.is_subscription_active(lp.user_id)
  ) INTO page_exists;
  
  IF NOT page_exists THEN
    RETURN false;
  END IF;
  
  -- Check rate limit: max 50 leads per page per hour (protects against spam)
  SELECT COUNT(*) INTO submission_count
  FROM public.leads
  WHERE landing_page_id = target_page_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow if under rate limit
  RETURN submission_count < 50;
END;
$$;

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Anyone can submit leads to valid pages" ON public.leads;

-- Create new rate-limited INSERT policy
CREATE POLICY "Rate limited lead submissions"
ON public.leads FOR INSERT
WITH CHECK (
  landing_page_id IS NOT NULL AND 
  public.can_submit_lead(landing_page_id)
);