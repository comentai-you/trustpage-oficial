-- Fix admin_logs RLS to explicitly block all non-admin access
-- Drop existing policy first
DROP POLICY IF EXISTS "Admins can view all logs" ON public.admin_logs;

-- Create explicit deny-first policy approach
-- Policy 1: Admins can SELECT
CREATE POLICY "Only admins can view admin logs" 
ON public.admin_logs 
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Policy 2: Only admins can INSERT (via log_admin_action function, but add policy for safety)
CREATE POLICY "Only admins can insert admin logs" 
ON public.admin_logs 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

-- Policy 3: No one can UPDATE admin logs (audit trail integrity)
CREATE POLICY "No one can update admin logs" 
ON public.admin_logs 
FOR UPDATE 
TO authenticated
USING (false);

-- Policy 4: No one can DELETE admin logs (audit trail integrity)
CREATE POLICY "No one can delete admin logs" 
ON public.admin_logs 
FOR DELETE 
TO authenticated
USING (false);