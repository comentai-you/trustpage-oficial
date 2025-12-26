-- Drop and recreate the view with SECURITY INVOKER (default)
-- The filtering will be done differently - we'll create a helper function
DROP VIEW IF EXISTS public.public_landing_pages;

-- Create a SECURITY DEFINER function that returns published page IDs for active subscribers
-- This safely hides the subscription check logic
CREATE OR REPLACE FUNCTION public.get_published_page_by_slug(page_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  template_id integer,
  template_type text,
  page_name text,
  profile_image_url text,
  headline text,
  subheadline text,
  video_url text,
  video_storage_path text,
  description text,
  image_url text,
  cover_image_url text,
  cta_text text,
  cta_url text,
  cta_delay_enabled boolean,
  cta_delay_percentage integer,
  whatsapp_number text,
  pix_pixel_id text,
  colors jsonb,
  primary_color text,
  content jsonb,
  views integer,
  is_published boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    lp.id,
    lp.slug,
    lp.template_id,
    lp.template_type,
    lp.page_name,
    lp.profile_image_url,
    lp.headline,
    lp.subheadline,
    lp.video_url,
    lp.video_storage_path,
    lp.description,
    lp.image_url,
    lp.cover_image_url,
    lp.cta_text,
    lp.cta_url,
    lp.cta_delay_enabled,
    lp.cta_delay_percentage,
    lp.whatsapp_number,
    lp.pix_pixel_id,
    lp.colors,
    lp.primary_color,
    lp.content,
    lp.views,
    lp.is_published,
    lp.created_at,
    lp.updated_at
  FROM public.landing_pages lp
  WHERE lp.slug = page_slug
    AND lp.is_published = true 
    AND public.is_subscription_active(lp.user_id)
  LIMIT 1;
$$;