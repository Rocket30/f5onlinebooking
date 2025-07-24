-- Function to ensure dates are stored correctly without timezone conversion issues
CREATE OR REPLACE FUNCTION store_exact_date(date_string TEXT)
RETURNS DATE AS $$
BEGIN
  -- Simply parse the date string directly without timezone conversion
  RETURN date_string::DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to get the day of week for a date
CREATE OR REPLACE FUNCTION get_day_of_week(date_string TEXT)
RETURNS TEXT AS $$
DECLARE
  day_name TEXT;
BEGIN
  -- Extract the day of week name from the date
  SELECT TO_CHAR(date_string::DATE, 'Day') INTO day_name;
  -- Trim trailing spaces
  RETURN TRIM(day_name);
END;
$$ LANGUAGE plpgsql;

-- Function to create a booking with exact date
CREATE OR REPLACE FUNCTION create_booking_with_exact_date(
  p_customer_id UUID,
  p_date TEXT,
  p_time TEXT,
  p_total_price NUMERIC,
  p_zip_code TEXT,
  p_special_instructions TEXT,
  p_status TEXT DEFAULT 'pending'
) RETURNS UUID AS $$
DECLARE
  new_booking_id UUID;
  day_of_week TEXT;
BEGIN
  -- Get the day of week
  SELECT get_day_of_week(p_date) INTO day_of_week;
  
  -- Add day of week to special instructions
  p_special_instructions := COALESCE(p_special_instructions, '') || E'\n[Day of Week: ' || day_of_week || ']';
  
  -- Insert the booking with the exact date
  INSERT INTO bookings (
    customer_id,
    booking_date,
    booking_time,
    total_price,
    zip_code,
    special_instructions,
    status
  ) VALUES (
    p_customer_id,
    store_exact_date(p_date),
    p_time,
    p_total_price,
    p_zip_code,
    p_special_instructions,
    p_status
  ) RETURNING id INTO new_booking_id;
  
  RETURN new_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log date information for debugging
CREATE OR REPLACE FUNCTION log_date_info(
  booking_id UUID,
  original_date TEXT,
  processed_date DATE,
  notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Create the date_logs table if it doesn't exist
  EXECUTE '
    CREATE TABLE IF NOT EXISTS date_logs (
      id SERIAL PRIMARY KEY,
      booking_id UUID,
      original_date TEXT,
      processed_date DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  ';
  
  -- Insert the log entry
  INSERT INTO date_logs (booking_id, original_date, processed_date, notes)
  VALUES (booking_id, original_date, processed_date, notes);
END;
$$ LANGUAGE plpgsql;
