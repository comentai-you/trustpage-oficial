-- Add subscription_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trial';

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.subscription_status IS 'User subscription status: trial, active, expired';