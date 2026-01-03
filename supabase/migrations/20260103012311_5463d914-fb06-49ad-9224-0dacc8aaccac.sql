-- Create index for fast custom domain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON public.profiles (custom_domain) WHERE custom_domain IS NOT NULL AND domain_verified = true;

-- Also create a partial index for verified domains only (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_profiles_domain_verified ON public.profiles (custom_domain, domain_verified) WHERE domain_verified = true;