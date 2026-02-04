-- Add cover_image_url and page_name columns to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS page_name text;

-- Update the QuizQuestion type to support image_url (this is stored in JSONB so no migration needed)
-- The JSONB structure will now support: { id, text, options, imageUrl? }