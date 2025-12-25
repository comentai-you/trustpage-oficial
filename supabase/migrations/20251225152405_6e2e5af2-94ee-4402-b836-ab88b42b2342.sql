-- Add RLS policy to page_view_tracking (no direct access - only via function)
-- This table should only be accessed by the increment_page_views function
CREATE POLICY "No direct access to view tracking" 
ON public.page_view_tracking 
FOR ALL 
USING (false);