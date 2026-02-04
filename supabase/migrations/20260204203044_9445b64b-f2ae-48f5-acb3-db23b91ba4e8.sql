-- Create/replace RPC to fetch legal pages from the NEW legal_pages table
CREATE OR REPLACE FUNCTION public.get_legal_page_from_legal_table(page_slug text, owner_user_id uuid)
RETURNS TABLE(
  id uuid,
  slug text,
  title text,
  description text,
  content jsonb,
  is_published boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    lp.id,
    lp.slug,
    lp.title,
    lp.description,
    lp.content,
    lp.is_published
  FROM public.legal_pages lp
  WHERE lp.slug = page_slug
    AND lp.user_id = owner_user_id
    AND lp.is_published = true
  LIMIT 1;
$$;

-- Grant execute permission to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_legal_page_from_legal_table(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_legal_page_from_legal_table(text, uuid) TO authenticated;