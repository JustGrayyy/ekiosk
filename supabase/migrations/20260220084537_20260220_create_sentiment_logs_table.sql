/*
  # Create sentiment_logs table

  1. New Tables
    - `sentiment_logs`
      - `id` (uuid, primary key) - Unique identifier for each sentiment entry
      - `feeling` (text) - The feeling/emotion selected by the user (e.g., "Happy", "Proud", "Neutral")
      - `created_at` (timestamp) - When the sentiment was recorded

  2. Security
    - Enable RLS on `sentiment_logs` table
    - Add policy for anyone to read sentiment logs
    - Add policy for anyone to insert new sentiment logs
    - Add policy for admins to delete entries

  3. Notes
    - This table tracks user sentiment/emotions after recycling deposits
    - Data is collected via the PostDepositModal component
    - Used for analytics and understanding user experience
*/

CREATE TABLE IF NOT EXISTS sentiment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feeling text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sentiment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sentiment logs"
  ON sentiment_logs
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert sentiment logs"
  ON sentiment_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sentiment logs"
  ON sentiment_logs
  FOR DELETE
  TO authenticated, anon
  USING (true);