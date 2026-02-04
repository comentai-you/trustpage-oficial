-- Create dedicated table for cloned pages
CREATE TABLE public.cloned_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL,
  page_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  html_content TEXT NOT NULL,
  head_code TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on slug per user
ALTER TABLE public.cloned_pages
ADD CONSTRAINT cloned_pages_user_slug_unique UNIQUE (user_id, slug);

-- Enable RLS
ALTER TABLE public.cloned_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own cloned pages"
ON public.cloned_pages FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create cloned pages based on subscription"
ON public.cloned_pages FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND is_subscription_active(auth.uid())
  AND (SELECT plan_type FROM profiles WHERE id = auth.uid()) IN ('essential', 'essential_yearly', 'pro', 'pro_yearly', 'elite')
);

CREATE POLICY "Active users can update own cloned pages"
ON public.cloned_pages FOR UPDATE
USING (user_id = auth.uid() AND is_subscription_active(auth.uid()));

CREATE POLICY "Users can delete own cloned pages"
ON public.cloned_pages FOR DELETE
USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_cloned_pages_updated_at
BEFORE UPDATE ON public.cloned_pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_cloned_pages_user_id ON public.cloned_pages(user_id);
CREATE INDEX idx_cloned_pages_slug ON public.cloned_pages(slug);