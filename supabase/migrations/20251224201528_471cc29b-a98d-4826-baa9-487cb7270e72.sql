-- Add is_featured and status columns to products table
ALTER TABLE public.products 
ADD COLUMN is_featured boolean DEFAULT false,
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'paused'));

-- Create index for featured products query
CREATE INDEX idx_products_featured ON public.products (is_featured) WHERE is_featured = true;

-- Create index for status query
CREATE INDEX idx_products_status ON public.products (status);