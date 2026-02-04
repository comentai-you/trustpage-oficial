-- Insert a test cloned page directly to validate the serve-proxy flow
INSERT INTO public.cloned_pages (
  user_id,
  slug,
  page_name,
  source_url,
  html_content,
  head_code,
  links,
  is_published
) VALUES (
  'c51fa5e9-ffe6-443f-bd32-6802ed7c48b7',
  'test-proxy-page',
  'Teste Proxy',
  'https://example.com',
  '',
  NULL,
  '[]'::jsonb,
  true
);