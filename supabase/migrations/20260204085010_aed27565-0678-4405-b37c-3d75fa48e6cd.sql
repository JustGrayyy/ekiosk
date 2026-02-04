-- Create the student_points table for loyalty points tracking
CREATE TABLE public.student_points (
  lrn TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  points_balance INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;

-- Public access policies (kiosk operates without authentication)
CREATE POLICY "Allow public read" ON public.student_points
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.student_points
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.student_points
  FOR UPDATE USING (true);

-- Create function to update last_updated timestamp on changes
CREATE OR REPLACE FUNCTION public.update_student_points_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_student_points_timestamp
  BEFORE UPDATE ON public.student_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_points_timestamp();