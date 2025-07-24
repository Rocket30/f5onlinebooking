-- Function to update booking date and time directly
CREATE OR REPLACE FUNCTION public.update_booking_directly(
  p_booking_id UUID,
  p_booking_date TEXT,
  p_booking_time TEXT
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update the booking using direct SQL to avoid ORM issues
  UPDATE public.bookings
  SET 
    booking_date = p_booking_date::TEXT,
    booking_time = p_booking_time
  WHERE id = p_booking_id;
  
  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'booking_date', p_booking_date,
    'booking_time', p_booking_time
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
