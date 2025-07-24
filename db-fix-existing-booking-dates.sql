-- Function to fix existing bookings by adding day of week to special instructions
CREATE OR REPLACE FUNCTION fix_existing_bookings()
RETURNS TEXT AS $$
DECLARE
  fixed_count INTEGER := 0;
  booking_record RECORD;
  day_name TEXT;
BEGIN
  -- Loop through all bookings
  FOR booking_record IN 
    SELECT id, booking_date, special_instructions 
    FROM bookings
    WHERE special_instructions IS NULL OR special_instructions NOT LIKE '%[Day of Week:%'
  LOOP
    -- Get the day of week for this booking
    SELECT TRIM(TO_CHAR(booking_record.booking_date, 'Day')) INTO day_name;
    
    -- Update the special instructions to include the day of week
    UPDATE bookings
    SET special_instructions = CASE
      WHEN special_instructions IS NULL THEN '[Day of Week: ' || day_name || ']'
      ELSE special_instructions || E'\n[Day of Week: ' || day_name || ']'
    END
    WHERE id = booking_record.id;
    
    fixed_count := fixed_count + 1;
  END LOOP;
  
  RETURN 'Fixed ' || fixed_count || ' bookings';
END;
$$ LANGUAGE plpgsql;

-- Function to check if a booking has the correct day of week
CREATE OR REPLACE FUNCTION check_booking_day_of_week(booking_id UUID)
RETURNS TABLE(
  booking_date DATE,
  calculated_day_of_week TEXT,
  stored_day_of_week TEXT,
  is_correct BOOLEAN
) AS $$
DECLARE
  booking_record RECORD;
  day_from_date TEXT;
  day_from_instructions TEXT;
BEGIN
  -- Get the booking
  SELECT b.id, b.booking_date, b.special_instructions
  INTO booking_record
  FROM bookings b
  WHERE b.id = booking_id;
  
  IF booking_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Calculate the day of week from the date
  day_from_date := TRIM(TO_CHAR(booking_record.booking_date, 'Day'));
  
  -- Extract the day of week from special instructions
  day_from_instructions := NULL;
  IF booking_record.special_instructions LIKE '%[Day of Week:%' THEN
    day_from_instructions := substring(booking_record.special_instructions FROM '\[Day of Week: (.*?)\]');
  END IF;
  
  -- Return the results
  booking_date := booking_record.booking_date;
  calculated_day_of_week := day_from_date;
  stored_day_of_week := day_from_instructions;
  is_correct := day_from_date = day_from_instructions OR day_from_instructions IS NULL;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Execute the fix function
SELECT fix_existing_bookings();
