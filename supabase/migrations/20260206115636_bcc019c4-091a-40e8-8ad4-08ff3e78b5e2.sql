
-- Scan history for analytics
CREATE TABLE public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lrn TEXT NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

-- Redemption history for analytics
CREATE TABLE public.redemption_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lrn TEXT NOT NULL,
  reward_name TEXT NOT NULL,
  points_redeemed INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: public read/insert (kiosk, no auth)
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on scan_logs" ON public.scan_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on scan_logs" ON public.scan_logs FOR INSERT WITH CHECK (true);

ALTER TABLE public.redemption_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on redemption_logs" ON public.redemption_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on redemption_logs" ON public.redemption_logs FOR INSERT WITH CHECK (true);
