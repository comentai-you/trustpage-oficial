-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS support_email text,
ADD COLUMN IF NOT EXISTS document_id text;

-- Add template_type 'legal' for system-generated legal pages
COMMENT ON COLUMN public.profiles.company_name IS 'Company or person name for legal pages';
COMMENT ON COLUMN public.profiles.support_email IS 'Support email for legal pages and contact';
COMMENT ON COLUMN public.profiles.document_id IS 'CPF/CNPJ (optional) for legal pages';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);