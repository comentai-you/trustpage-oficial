-- Add Asaas subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS asaas_customer_id text,
ADD COLUMN IF NOT EXISTS asaas_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_updated_at timestamp with time zone;

-- Create index for faster lookups by Asaas customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer_id ON public.profiles(asaas_customer_id);

-- Create index for Asaas subscription ID
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_subscription_id ON public.profiles(asaas_subscription_id);