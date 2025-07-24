-- Run this SQL in your Supabase SQL Editor to add the missing columns
-- This will add the property_type, floors, and floor_level columns to the customers table if they don't exist

DO $$
BEGIN
    -- Add property_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'property_type'
    ) THEN
        ALTER TABLE customers ADD COLUMN property_type VARCHAR(50);
    END IF;

    -- Add floors column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'floors'
    ) THEN
        ALTER TABLE customers ADD COLUMN floors INTEGER;
    END IF;

    -- Add floor_level column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'floor_level'
    ) THEN
        ALTER TABLE customers ADD COLUMN floor_level VARCHAR(20);
    END IF;

    -- Add unit_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'unit_number'
    ) THEN
        ALTER TABLE customers ADD COLUMN unit_number VARCHAR(50);
    END IF;
END $$;
