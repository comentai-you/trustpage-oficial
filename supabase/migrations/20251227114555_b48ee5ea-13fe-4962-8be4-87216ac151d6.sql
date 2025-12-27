-- Add custom_domain column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN custom_domain text DEFAULT NULL,
ADD COLUMN domain_verified boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.custom_domain IS 'Custom domain configured by the user via Vercel API';
COMMENT ON COLUMN public.profiles.domain_verified IS 'Whether the custom domain DNS is verified';