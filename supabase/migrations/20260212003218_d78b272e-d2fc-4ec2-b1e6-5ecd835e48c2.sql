
ALTER TABLE public.landing_pages ADD COLUMN IF NOT EXISTS back_redirect_enabled boolean DEFAULT false;
ALTER TABLE public.landing_pages ADD COLUMN IF NOT EXISTS back_redirect_url text DEFAULT NULL;
