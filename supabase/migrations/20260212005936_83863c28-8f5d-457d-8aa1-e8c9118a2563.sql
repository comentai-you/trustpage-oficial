
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS back_redirect_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS back_redirect_url text;
