-- Create bucket for blog content images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-content', 'blog-content', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload to blog-content bucket
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-content' AND auth.role() = 'authenticated');

-- Allow public to view blog images
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-content');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-content' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete blog images
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-content' AND auth.role() = 'authenticated');