-- Create a function that directly updates the booking date with raw SQL
CREATE OR REPLACE FUNCTION direct_update_booking_date(
  p_booking_id TEXT,
  p_date TEXT,
  p_time TEXT,
  p_day_of_week TEXT
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  special_instructions TEXT;
  day_of_week_pattern TEXT := '\[Day of Week: .*?\]';
BEGIN
  -- Get current special instructions
  SELECT bookings.special_instructions INTO special_instructions
  FROM bookings
  WHERE id::TEXT = p_booking_id;
  
  -- Remove any existing day of week tag
  IF special_instructions ~ day_of_week_pattern THEN
    special_instructions := regexp_replace(special_instructions, day_of_week_pattern, '');
  END IF;
  
  -- Add new day of week tag
  special_instructions := COALESCE(special_instructions, '') || ' [Day of Week: ' || p_day_of_week || ']';
  
  -- Trim extra spaces
  special_instructions := btrim(special_instructions);
  
  -- Execute direct SQL update to avoid any date conversion
  EXECUTE 'UPDATE bookings SET 
    booking_date = $1::TEXT, 
    booking_time = $2, 
    special_instructions = $3
    WHERE id::TEXT = $4
    RETURNING id, booking_date, booking_time, special_instructions'
  INTO result
  USING p_date, p_time, special_instructions, p_booking_id;
  
  -- Log the update for debugging
  INSERT INTO logs (message, data)
  VALUES (
    'Direct booking date update', 
    jsonb_build_object(
      'booking_id', p_booking_id,
      'new_date', p_date,
      'new_time', p_time,
      'day_of_week', p_day_of_week,
      'result', result
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message TEXT,
  data JSONB
);
