-- Add tags column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];