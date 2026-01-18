-- Create marketing_campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'processing', 'completed', 'failed')),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Only admins can manage campaigns
CREATE POLICY "Admins can view all campaigns"
ON public.marketing_campaigns
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can create campaigns"
ON public.marketing_campaigns
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update campaigns"
ON public.marketing_campaigns
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete campaigns"
ON public.marketing_campaigns
FOR DELETE
USING (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_marketing_campaigns_updated_at
BEFORE UPDATE ON public.marketing_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for scheduled campaigns lookup
CREATE INDEX idx_marketing_campaigns_scheduled 
ON public.marketing_campaigns(scheduled_at, status) 
WHERE status = 'pending';