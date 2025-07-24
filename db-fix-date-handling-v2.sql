-- Create a function to properly handle date conversions
CREATE OR REPLACE FUNCTION fix_booking_date(booking_id UUID, new_date TEXT, new_time TEXT, day_of_week TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update the booking with the exact date string provided
  UPDATE bookings 
  SET 
    booking_date = new_date,
    booking_time = new_time,
    special_instructions = COALESCE(special_instructions, '') || ' [Day of Week: ' || day_of_week || ']'
  WHERE id = booking_id
  RETURNING jsonb_build_object(
    'id', id,
    'booking_date', booking_date,
    'booking_time', booking_time,
    'day_of_week', day_of_week
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get the day of week for a booking
CREATE OR REPLACE FUNCTION get_booking_day_of_week(booking_id UUID)
RETURNS TEXT AS $$
DECLARE
  day_of_week TEXT;
  special_instructions TEXT;
BEGIN
  -- Get the special instructions
  SELECT bookings.special_instructions INTO special_instructions
  FROM bookings
  WHERE id = booking_id;
  
  -- Extract day of week from special instructions
  IF special_instructions ~ '\[Day of Week: (.*?)\]' THEN
    day_of_week := substring(special_instructions FROM '\[Day of Week: (.*?)\]' FOR '#');
    RETURN day_of_week;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;
