
-- Create allowed_products table
CREATE TABLE public.allowed_products (
  barcode TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'bottle',
  points_value INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.allowed_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on allowed_products"
  ON public.allowed_products FOR SELECT USING (true);

CREATE POLICY "Allow public insert on allowed_products"
  ON public.allowed_products FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete on allowed_products"
  ON public.allowed_products FOR DELETE USING (true);

-- Seed data
INSERT INTO public.allowed_products (barcode, name, category) VALUES
  ('4801981126012', 'Nature''s Spring Water', 'bottle'),
  ('4800016055308', 'Coke Mismo', 'bottle'),
  ('4800016644830', 'Sprite 500ml', 'bottle'),
  ('8992760223011', 'Piattos Chips', 'snack');

-- Add product_name column to scan_logs
ALTER TABLE public.scan_logs ADD COLUMN product_name TEXT;
