-- Function to ensure dates are stored in the correct format
CREATE OR REPLACE FUNCTION public.fix_date_format(
  p_date TEXT
) RETURNS TEXT AS $$
BEGIN
  -- Simply return the date as text to avoid any automatic conversions
  RETURN p_date;
END;
$$ LANGUAGE plpgsql;

-- Function to create a booking with exact date format
CREATE OR REPLACE FUNCTION public.create_booking_with_exact_date(
  p_customer_id UUID,
  p_booking_date TEXT,
  p_booking_time TEXT,
  p_total_price NUMERIC,
  p_zip_code TEXT,
  p_special_instructions TEXT,
  p_status TEXT DEFAULT 'pending'
) RETURNS JSONB AS $$
DECLARE
  v_booking_id UUID;
  result JSONB;
BEGIN
  -- Insert the booking with the exact date format
  INSERT INTO public.bookings (
    customer_id,
    booking_date,
    booking_time,
    total_price,
    zip_code,
    special_instructions,
    status
  ) VALUES (
    p_customer_id,
    p_booking_date,
    p_booking_time,
    p_total_price,
    p_zip_code,
    p_special_instructions,
    p_status
  ) RETURNING id INTO v_booking_id;
  
  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_date', p_booking_date,
    'booking_time', p_booking_time
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
