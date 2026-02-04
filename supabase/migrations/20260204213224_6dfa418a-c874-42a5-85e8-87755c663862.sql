-- Create quizzes table for Quiz Builder feature
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  redirect_url TEXT,
  primary_color TEXT DEFAULT '#8B5CF6',
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT quizzes_slug_unique UNIQUE (slug)
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Users can view their own quizzes
CREATE POLICY "Users can view own quizzes"
ON public.quizzes
FOR SELECT
USING (user_id = auth.uid());

-- Users can create quizzes based on subscription (counts as standard page)
CREATE POLICY "Users can create quizzes based on subscription"
ON public.quizzes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND can_create_page(auth.uid())
);

-- Active users can update their own quizzes
CREATE POLICY "Active users can update own quizzes"
ON public.quizzes
FOR UPDATE
USING (user_id = auth.uid() AND is_subscription_active(auth.uid()));

-- Users can delete their own quizzes
CREATE POLICY "Users can delete own quizzes"
ON public.quizzes
FOR DELETE
USING (user_id = auth.uid());

-- Admins can view all quizzes
CREATE POLICY "Admins can view all quizzes"
ON public.quizzes
FOR SELECT
USING (is_admin());

-- Anyone can view published quizzes (for public view)
CREATE POLICY "Anyone can view published quizzes"
ON public.quizzes
FOR SELECT
USING (is_published = true);

-- Create trigger for updated_at
CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for slug lookups
CREATE INDEX idx_quizzes_slug ON public.quizzes(slug);
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);

-- Update can_create_page function to also count quizzes
CREATE OR REPLACE FUNCTION public.can_create_page(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE
      -- Not active subscription = cannot create
      WHEN NOT public.is_subscription_active(check_user_id) THEN false
      -- Check limits based on plan (excluding legal pages, counting landing_pages + quizzes)
      ELSE
        CASE (SELECT plan_type FROM public.profiles WHERE id = check_user_id)
          WHEN 'pro' THEN (
            (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) +
            (SELECT COUNT(*) FROM public.quizzes WHERE user_id = check_user_id)
          ) < 20
          WHEN 'pro_yearly' THEN (
            (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) +
            (SELECT COUNT(*) FROM public.quizzes WHERE user_id = check_user_id)
          ) < 20
          WHEN 'elite' THEN (
            (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) +
            (SELECT COUNT(*) FROM public.quizzes WHERE user_id = check_user_id)
          ) < 20
          WHEN 'essential' THEN (
            (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) +
            (SELECT COUNT(*) FROM public.quizzes WHERE user_id = check_user_id)
          ) < 5
          WHEN 'essential_yearly' THEN (
            (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) +
            (SELECT COUNT(*) FROM public.quizzes WHERE user_id = check_user_id)
          ) < 5
          ELSE (
            (SELECT COUNT(*) FROM public.landing_pages WHERE user_id = check_user_id AND NOT public.is_legal_page_slug(slug)) +
            (SELECT COUNT(*) FROM public.quizzes WHERE user_id = check_user_id)
          ) < 1 -- FREE plan: 1 page only
        END
    END;
$$;