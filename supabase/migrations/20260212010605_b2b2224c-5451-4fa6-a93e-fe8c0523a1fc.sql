
-- Table to track CTA button clicks on published pages
CREATE TABLE public.cta_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid NOT NULL,
  page_type text NOT NULL DEFAULT 'landing', -- 'landing', 'cloned', 'quiz'
  ip_hash text,
  user_agent text,
  device_type text,
  referrer text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for efficient querying by page and date
CREATE INDEX idx_cta_clicks_page_id ON public.cta_clicks(page_id);
CREATE INDEX idx_cta_clicks_created_at ON public.cta_clicks(created_at);

-- Enable RLS
ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;

-- Page owners can view their CTA clicks (landing_pages)
CREATE POLICY "Owners can view landing page cta clicks"
ON public.cta_clicks FOR SELECT
USING (
  page_type = 'landing' AND page_id IN (
    SELECT id FROM public.landing_pages WHERE user_id = auth.uid()
  )
);

-- Page owners can view their CTA clicks (cloned_pages)
CREATE POLICY "Owners can view cloned page cta clicks"
ON public.cta_clicks FOR SELECT
USING (
  page_type = 'cloned' AND page_id IN (
    SELECT id FROM public.cloned_pages WHERE user_id = auth.uid()
  )
);

-- Page owners can view their CTA clicks (quizzes)
CREATE POLICY "Owners can view quiz cta clicks"
ON public.cta_clicks FOR SELECT
USING (
  page_type = 'quiz' AND page_id IN (
    SELECT id FROM public.quizzes WHERE user_id = auth.uid()
  )
);

-- Service role can insert (via edge function)
CREATE POLICY "Service role can insert cta clicks"
ON public.cta_clicks FOR INSERT
WITH CHECK (true);

-- No updates or deletes
CREATE POLICY "No updates on cta clicks"
ON public.cta_clicks FOR UPDATE
USING (false);

CREATE POLICY "No deletes on cta clicks"
ON public.cta_clicks FOR DELETE
USING (false);
