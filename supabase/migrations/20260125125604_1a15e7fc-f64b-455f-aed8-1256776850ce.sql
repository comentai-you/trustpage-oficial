-- Function to get user ID by username (for URL resolution)
-- This is SECURITY DEFINER so unauthenticated users can resolve usernames to IDs
CREATE OR REPLACE FUNCTION public.get_user_id_by_username(p_username text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id 
  FROM public.profiles 
  WHERE username = lower(trim(p_username))
  LIMIT 1;
$$;

-- Function to get username by user ID (for generating URLs)
-- This only returns the username, no sensitive data
CREATE OR REPLACE FUNCTION public.get_username_by_user_id(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT username 
  FROM public.profiles 
  WHERE id = p_user_id
  LIMIT 1;
$$;