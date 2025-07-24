-- Function to add confirmation_number column if it doesn't exist
CREATE OR REPLACE FUNCTION add_confirmation_number_column_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings'
    AND column_name = 'confirmation_number'
  ) THEN
    -- Add the column
    EXECUTE 'ALTER TABLE bookings ADD COLUMN confirmation_number TEXT';
  END IF;
END;
$$ LANGUAGE plpgsql;
