
ALTER TABLE public.landing_pages
ADD COLUMN webhook_url text,
ADD COLUMN webhook_enabled boolean DEFAULT false;
