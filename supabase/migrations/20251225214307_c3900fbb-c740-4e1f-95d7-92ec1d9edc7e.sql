-- Add cover image field for template identification in dashboard
ALTER TABLE public.landing_pages 
ADD COLUMN cover_image_url TEXT DEFAULT NULL;