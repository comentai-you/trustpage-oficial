-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Public can view published pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can view own landing pages" ON public.landing_pages;

-- Create PERMISSIVE policies (OR logic - any one of them can allow access)
CREATE POLICY "Public can view published pages" 
ON public.landing_pages 
FOR SELECT 
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Users can view own landing pages" 
ON public.landing_pages 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());