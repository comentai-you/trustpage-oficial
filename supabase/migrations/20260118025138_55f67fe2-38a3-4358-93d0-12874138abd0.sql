-- Create blog_categories table
CREATE TABLE public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#8B5CF6',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_categories
CREATE POLICY "Anyone can read blog categories"
ON public.blog_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can create blog categories"
ON public.blog_categories
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update blog categories"
ON public.blog_categories
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete blog categories"
ON public.blog_categories
FOR DELETE
USING (is_admin());

-- Add category_id to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_blog_posts_category_id ON public.blog_posts(category_id);

-- Trigger to update updated_at
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();