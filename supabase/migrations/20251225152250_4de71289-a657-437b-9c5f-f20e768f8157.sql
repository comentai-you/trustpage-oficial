-- Create page view tracking table for server-side deduplication
CREATE TABLE public.page_view_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  viewer_fingerprint text NOT NULL DEFAULT 'anonymous',
  viewed_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient lookups and cleanup
CREATE INDEX idx_view_tracking_page_fingerprint ON public.page_view_tracking(page_id, viewer_fingerprint, viewed_at);
CREATE INDEX idx_view_tracking_cleanup ON public.page_view_tracking(viewed_at);

-- Enable RLS (no direct access, only via function)
ALTER TABLE public.page_view_tracking ENABLE ROW LEVEL SECURITY;

-- Drop old function and create enhanced version with deduplication
DROP FUNCTION IF EXISTS public.increment_page_views(uuid);

CREATE OR REPLACE FUNCTION public.increment_page_views(
  page_id uuid,
  viewer_fingerprint text DEFAULT 'anonymous'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_view boolean;
BEGIN
  -- Check for recent view from same fingerprint (within 5 minutes)
  SELECT EXISTS(
    SELECT 1 FROM page_view_tracking pvt
    WHERE pvt.page_id = increment_page_views.page_id
    AND pvt.viewer_fingerprint = increment_page_views.viewer_fingerprint
    AND pvt.viewed_at > now() - interval '5 minutes'
  ) INTO recent_view;
  
  IF NOT recent_view THEN
    -- Update counter
    UPDATE landing_pages 
    SET views = COALESCE(views, 0) + 1
    WHERE id = increment_page_views.page_id AND is_published = true;
    
    -- Track this view (for deduplication)
    INSERT INTO page_view_tracking (page_id, viewer_fingerprint)
    VALUES (increment_page_views.page_id, increment_page_views.viewer_fingerprint);
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.increment_page_views(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_page_views(uuid, text) TO authenticated;