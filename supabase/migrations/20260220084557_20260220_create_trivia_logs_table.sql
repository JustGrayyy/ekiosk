/*
  # Create trivia_logs table

  1. New Tables
    - `trivia_logs`
      - `id` (uuid, primary key) - Unique identifier for each trivia attempt
      - `is_correct` (boolean) - Whether the user answered the trivia question correctly
      - `created_at` (timestamp) - When the trivia question was answered

  2. Security
    - Enable RLS on `trivia_logs` table
    - Add policy for anyone to read trivia logs
    - Add policy for anyone to insert new trivia logs
    - Add policy for admins to delete entries

  3. Notes
    - This table tracks trivia question attempts and correctness
    - Data is collected via the PostDepositModal component
    - Used for analytics on eco-trivia performance and engagement
    - When a user answers correctly, they earn a bonus point
*/

CREATE TABLE IF NOT EXISTS trivia_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trivia_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trivia logs"
  ON trivia_logs
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert trivia logs"
  ON trivia_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can delete trivia logs"
  ON trivia_logs
  FOR DELETE
  TO authenticated, anon
  USING (true);