-- Run this SQL in your Supabase SQL Editor to add the updated_at column
-- This is optional and not required for the current fix

DO $$
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;
