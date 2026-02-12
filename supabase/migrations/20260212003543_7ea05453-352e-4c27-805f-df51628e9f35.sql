
DROP FUNCTION IF EXISTS public.get_published_page_by_slug(text);
DROP FUNCTION IF EXISTS public.get_published_page_by_owner_and_slug(uuid, text);

CREATE FUNCTION public.get_published_page_by_slug(page_slug text)
 RETURNS TABLE(id uuid, slug text, template_id integer, template_type text, page_name text, profile_image_url text, headline text, subheadline text, video_url text, video_storage_path text, description text, image_url text, cover_image_url text, cta_text text, cta_url text, cta_delay_enabled boolean, cta_delay_percentage integer, colors jsonb, primary_color text, content jsonb, is_published boolean, created_at timestamp with time zone, updated_at timestamp with time zone, back_redirect_enabled boolean, back_redirect_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    lp.id, lp.slug, lp.template_id, lp.template_type, lp.page_name, lp.profile_image_url,
    lp.headline, lp.subheadline, lp.video_url, lp.video_storage_path, lp.description,
    lp.image_url, lp.cover_image_url, lp.cta_text, lp.cta_url, lp.cta_delay_enabled,
    lp.cta_delay_percentage, lp.colors, lp.primary_color, lp.content, lp.is_published,
    lp.created_at, lp.updated_at,
    lp.back_redirect_enabled, lp.back_redirect_url
  FROM public.landing_pages lp
  WHERE lp.slug = page_slug
    AND lp.is_published = true 
    AND public.is_subscription_active(lp.user_id)
  LIMIT 1;
$function$;

CREATE FUNCTION public.get_published_page_by_owner_and_slug(owner_id uuid, page_slug text)
 RETURNS TABLE(id uuid, slug text, template_id integer, template_type text, page_name text, profile_image_url text, headline text, subheadline text, video_url text, video_storage_path text, description text, image_url text, cover_image_url text, cta_text text, cta_url text, cta_delay_enabled boolean, cta_delay_percentage integer, colors jsonb, primary_color text, content jsonb, is_published boolean, created_at timestamp with time zone, updated_at timestamp with time zone, facebook_pixel_id text, pix_pixel_id text, whatsapp_number text, back_redirect_enabled boolean, back_redirect_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    lp.id, lp.slug, lp.template_id, lp.template_type, lp.page_name, lp.profile_image_url,
    lp.headline, lp.subheadline, lp.video_url, lp.video_storage_path, lp.description,
    lp.image_url, lp.cover_image_url, lp.cta_text, lp.cta_url, lp.cta_delay_enabled,
    lp.cta_delay_percentage, lp.colors, lp.primary_color, lp.content, lp.is_published,
    lp.created_at, lp.updated_at,
    lp.facebook_pixel_id, lp.pix_pixel_id, lp.whatsapp_number,
    lp.back_redirect_enabled, lp.back_redirect_url
  FROM public.landing_pages lp
  WHERE lp.user_id = owner_id
    AND lp.slug = page_slug
    AND lp.is_published = true 
    AND public.is_subscription_active(lp.user_id)
  LIMIT 1;
$function$;
