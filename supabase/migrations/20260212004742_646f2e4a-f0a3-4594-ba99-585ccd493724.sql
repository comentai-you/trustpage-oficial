
ALTER TABLE public.cloned_pages
  ADD COLUMN back_redirect_enabled boolean DEFAULT false,
  ADD COLUMN back_redirect_url text;
