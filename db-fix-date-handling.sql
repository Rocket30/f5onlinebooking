-- Create a function to update booking dates consistently
CREATE OR REPLACE FUNCTION update_booking_date(
  p_booking_id UUID,
  p_booking_date TEXT,
  p_booking_time TEXT
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update the booking with the exact date string provided
  UPDATE bookings
  SET 
    booking_date = p_booking_date::TEXT,
    booking_time = p_booking_time
  WHERE id = p_booking_id
  RETURNING jsonb_build_object(
    'id', id,
    'booking_date', booking_date,
    'booking_time', booking_time
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get booking with exact date format
CREATE OR REPLACE FUNCTION get_booking_with_date(
  p_booking_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'booking_date', booking_date,
    'booking_time', booking_time,
    'status', status,
    'customer_id', customer_id
  )
  FROM bookings
  WHERE id = p_booking_id
  INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
