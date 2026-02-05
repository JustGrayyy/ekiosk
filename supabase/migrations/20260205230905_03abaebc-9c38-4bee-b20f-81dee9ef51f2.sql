-- Create an atomic increment function for points
CREATE OR REPLACE FUNCTION public.increment_points(student_lrn TEXT, student_name TEXT, points_to_add INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Insert or update with atomic increment
  INSERT INTO public.student_points (lrn, full_name, points_balance)
  VALUES (student_lrn, student_name, points_to_add)
  ON CONFLICT (lrn) 
  DO UPDATE SET 
    points_balance = student_points.points_balance + points_to_add,
    last_updated = now()
  RETURNING points_balance INTO new_balance;
  
  RETURN new_balance;
END;
$$;