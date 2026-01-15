-- Fix: Restrict page_visits INSERT to service_role only
-- This forces all analytics through the validated edge function with rate limiting

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anonimos registram visitas" ON public.page_visits;

-- Create restrictive policy for service_role only
CREATE POLICY "Service role can insert visits"
ON public.page_visits
FOR INSERT
TO service_role
WITH CHECK (true);

-- Also fix the page_view_tracking table if it has similar issues
DROP POLICY IF EXISTS "Anonimos podem inserir" ON public.page_view_tracking;

CREATE POLICY "Service role can insert tracking"
ON public.page_view_tracking
FOR INSERT
TO service_role
WITH CHECK (true);