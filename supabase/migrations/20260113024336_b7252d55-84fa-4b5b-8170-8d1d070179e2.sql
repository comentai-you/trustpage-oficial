-- Tabela para logar cada visita individualmente
CREATE TABLE public.page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  page_id UUID REFERENCES public.landing_pages(id) ON DELETE CASCADE NOT NULL,
  referrer TEXT,
  utm_source TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  device_type TEXT -- 'mobile', 'desktop', 'tablet'
);

-- Segurança
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Qualquer um (anonimo) pode CRIAR um registro (visitar a página)
CREATE POLICY "Anonimos registram visitas" ON public.page_visits 
FOR INSERT WITH CHECK (true);

-- Apenas o dono da página pode LER as visitas
CREATE POLICY "Dono vê analytics" ON public.page_visits 
FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.landing_pages WHERE id = page_visits.page_id)
);

-- Index para melhorar performance de queries de analytics
CREATE INDEX idx_page_visits_page_id ON public.page_visits(page_id);
CREATE INDEX idx_page_visits_created_at ON public.page_visits(created_at DESC);