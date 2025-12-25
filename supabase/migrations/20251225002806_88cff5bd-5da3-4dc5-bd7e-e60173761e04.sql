-- Create function to increment page views (can be called by anyone)
CREATE OR REPLACE FUNCTION public.increment_page_views(page_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.landing_pages
  SET views = COALESCE(views, 0) + 1
  WHERE id = page_id AND is_published = true;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.increment_page_views(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_page_views(uuid) TO authenticated;