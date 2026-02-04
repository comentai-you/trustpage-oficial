
-- Allow admins to view all landing pages
CREATE POLICY "Admins can view all landing pages" 
ON public.landing_pages 
FOR SELECT 
USING (public.is_admin());

-- Allow admins to view all legal pages
CREATE POLICY "Admins can view all legal pages" 
ON public.legal_pages 
FOR SELECT 
USING (public.is_admin());
