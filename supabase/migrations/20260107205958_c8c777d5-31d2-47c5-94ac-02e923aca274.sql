-- Drop the old unique constraints that only check slug
ALTER TABLE public.landing_pages DROP CONSTRAINT IF EXISTS landing_pages_slug_key;
ALTER TABLE public.landing_pages DROP CONSTRAINT IF EXISTS landing_pages_slug_unique;

-- Create a new unique constraint that allows same slug for different users
-- This permits each user to have their own legal pages (politica-de-privacidade, termos-de-uso, contato)
CREATE UNIQUE INDEX landing_pages_user_slug_unique ON public.landing_pages (user_id, slug);