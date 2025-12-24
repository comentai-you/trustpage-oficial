-- Add plan_type to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'essential' 
CHECK (plan_type IN ('essential', 'elite'));

-- Add video_storage_path to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS video_storage_path text;