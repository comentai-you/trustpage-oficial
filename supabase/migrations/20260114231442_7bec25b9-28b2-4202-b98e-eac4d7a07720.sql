-- Create leads table for capturing form submissions
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert leads (public form submission)
CREATE POLICY "Anyone can submit leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- RLS Policy: Page owners can view their leads
CREATE POLICY "Page owners can view their leads"
ON public.leads
FOR SELECT
USING (
  landing_page_id IN (
    SELECT id FROM public.landing_pages WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Page owners can delete their leads
CREATE POLICY "Page owners can delete their leads"
ON public.leads
FOR DELETE
USING (
  landing_page_id IN (
    SELECT id FROM public.landing_pages WHERE user_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_leads_landing_page_id ON public.leads(landing_page_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- Create lead-magnets storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-magnets', 'lead-magnets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lead-magnets bucket
CREATE POLICY "Anyone can view lead magnets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lead-magnets');

CREATE POLICY "Authenticated users can upload lead magnets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'lead-magnets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own lead magnets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'lead-magnets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own lead magnets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'lead-magnets' AND auth.uid()::text = (storage.foldername(name))[1]);