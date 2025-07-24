-- Run this SQL in your Supabase SQL Editor to add the unit_number column to the customers table if it doesn't exist

DO $$
BEGIN
    -- Add unit_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'unit_number'
    ) THEN
        ALTER TABLE customers ADD COLUMN unit_number VARCHAR(50);
    END IF;
END $$;
