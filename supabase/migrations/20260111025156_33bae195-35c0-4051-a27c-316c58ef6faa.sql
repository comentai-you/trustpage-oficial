-- Create a new function that gets legal pages by slug filtered by owner
CREATE OR REPLACE FUNCTION public.get_legal_page_by_owner(page_slug text, owner_user_id uuid)
RETURNS TABLE(id uuid, slug text, template_type text, page_name text, headline text, description text, content jsonb, colors jsonb, is_published boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    lp.id,
    lp.slug,
    lp.template_type,
    lp.page_name,
    lp.headline,
    lp.description,
    lp.content,
    lp.colors,
    lp.is_published
  FROM public.landing_pages lp
  WHERE lp.slug = page_slug
    AND lp.user_id = owner_user_id
    AND lp.is_published = true 
    AND public.is_subscription_active(lp.user_id)
  LIMIT 1;
$$;