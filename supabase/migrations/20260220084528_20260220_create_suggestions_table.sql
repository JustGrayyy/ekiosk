/*
  # Create suggestions table

  1. New Tables
    - `suggestions`
      - `id` (uuid, primary key) - Unique identifier for each suggestion
      - `message` (text) - The suggestion text submitted by kiosk users
      - `created_at` (timestamp) - When the suggestion was submitted

  2. Security
    - Enable RLS on `suggestions` table
    - Add policy for anyone to read suggestions
    - Add policy for anyone to insert new suggestions
    - Add policy for anyone to delete suggestions (for admin use)

  3. Notes
    - This table stores user feedback and suggestions from the recycling kiosk
    - No user authentication required for submission
*/

CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read suggestions"
  ON suggestions
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert suggestions"
  ON suggestions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can delete suggestions"
  ON suggestions
  FOR DELETE
  TO authenticated, anon
  USING (true);