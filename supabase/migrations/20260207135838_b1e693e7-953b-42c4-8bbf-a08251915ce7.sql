
-- 1. Add section column to student_points
ALTER TABLE public.student_points ADD COLUMN IF NOT EXISTS section TEXT;

-- 2. Add section and points_added columns to scan_logs
ALTER TABLE public.scan_logs ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE public.scan_logs ADD COLUMN IF NOT EXISTS points_added INTEGER DEFAULT 1;

-- 3. Update increment_points function to accept student_section
CREATE OR REPLACE FUNCTION public.increment_points(
  student_lrn text,
  student_name text,
  points_to_add integer DEFAULT 1,
  student_section text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  new_balance INTEGER;
BEGIN
  INSERT INTO public.student_points (lrn, full_name, points_balance, section)
  VALUES (student_lrn, student_name, points_to_add, student_section)
  ON CONFLICT (lrn)
  DO UPDATE SET
    points_balance = student_points.points_balance + points_to_add,
    section = COALESCE(EXCLUDED.section, student_points.section),
    last_updated = now()
  RETURNING points_balance INTO new_balance;

  RETURN new_balance;
END;
$function$;

-- 4. Enable Realtime on scan_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_logs;
