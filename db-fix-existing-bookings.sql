-- Function to extract day of week from a date
CREATE OR REPLACE FUNCTION get_day_of_week(date_str TEXT)
RETURNS TEXT AS $$
DECLARE
  date_val DATE;
  day_num INTEGER;
  day_names TEXT[] := ARRAY['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
BEGIN
  BEGIN
    date_val := date_str::DATE;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  
  day_num := EXTRACT(DOW FROM date_val)::INTEGER;
  RETURN day_names[day_num + 1];
END;
$$ LANGUAGE plpgsql;

-- Function to update all bookings with day of week in special instructions
CREATE OR REPLACE FUNCTION update_all_bookings_with_day_of_week()
RETURNS INTEGER AS $$
DECLARE
  booking_record RECORD;
  updated_count INTEGER := 0;
  day_of_week TEXT;
BEGIN
  FOR booking_record IN SELECT id, booking_date, special_instructions FROM bookings LOOP
    -- Skip if already has day of week
    IF booking_record.special_instructions ~ '\[Day of Week:' THEN
      CONTINUE;
    END IF;
    
    -- Get day of week
    day_of_week := get_day_of_week(booking_record.booking_date);
    
    -- Update booking
    IF day_of_week IS NOT NULL THEN
      UPDATE bookings
      SET special_instructions = COALESCE(special_instructions, '') || ' [Day of Week: ' || day_of_week || ']'
      WHERE id = booking_record.id;
      
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Run the update function
SELECT update_all_bookings_with_day_of_week();
