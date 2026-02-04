-- Add policy for public access to published cloned pages
CREATE POLICY "Anyone can view published cloned pages"
ON public.cloned_pages FOR SELECT
USING (is_published = true);