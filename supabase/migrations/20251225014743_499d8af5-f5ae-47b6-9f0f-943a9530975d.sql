-- Enable RLS on reserved_slugs table
ALTER TABLE public.reserved_slugs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reserved slugs (needed for validation)
CREATE POLICY "Anyone can read reserved slugs"
ON public.reserved_slugs FOR SELECT
USING (true);

-- Only allow system (service role) to modify reserved slugs
-- No INSERT/UPDATE/DELETE policies for authenticated users