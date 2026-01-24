-- Create a function to get the page owner ID for public pages
-- This is needed to construct correct legal footer links
CREATE OR REPLACE FUNCTION public.get_page_owner_id(page_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id
  FROM landing_pages
  WHERE id = page_id
    AND is_published = true
  LIMIT 1;
$$;

-- Grant execute permission to public (for visitors)
GRANT EXECUTE ON FUNCTION public.get_page_owner_id(uuid) TO public;