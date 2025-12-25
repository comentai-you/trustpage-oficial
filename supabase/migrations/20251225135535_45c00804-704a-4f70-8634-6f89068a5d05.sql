-- Add CTA delay columns to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS cta_delay_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cta_delay_percentage integer DEFAULT 50;