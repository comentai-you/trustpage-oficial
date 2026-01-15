-- Fix: Add validation to leads INSERT policy
-- This ensures leads can only be submitted to valid, published pages from active users

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
DROP POLICY IF EXISTS "Anonimos inserem leads" ON public.leads;

-- Create policy with validation
CREATE POLICY "Anyone can submit leads to valid pages"
ON public.leads
FOR INSERT
WITH CHECK (
  landing_page_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.landing_pages 
    WHERE id = landing_page_id 
    AND is_published = true
    AND public.is_subscription_active(user_id)
  )
);