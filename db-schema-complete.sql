-- Complete database schema for F5 Carpet Cleaning
-- Run this in your NEW Supabase project after restoration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_zip_code VARCHAR(10) NOT NULL,
    unit_number VARCHAR(50),
    selected_services TEXT[] NOT NULL,
    selected_rooms TEXT[] NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    confirmation_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_areas table
CREATE TABLE IF NOT EXISTS service_areas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zip_code VARCHAR(10) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_area_zip_codes table (for compatibility)
CREATE TABLE IF NOT EXISTS service_area_zip_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zip_code VARCHAR(10) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Tampa Bay area ZIP codes
INSERT INTO service_areas (zip_code, city, state) VALUES
('33602', 'Tampa', 'FL'),
('33603', 'Tampa', 'FL'),
('33604', 'Tampa', 'FL'),
('33605', 'Tampa', 'FL'),
('33606', 'Tampa', 'FL'),
('33607', 'Tampa', 'FL'),
('33608', 'Tampa', 'FL'),
('33609', 'Tampa', 'FL'),
('33610', 'Tampa', 'FL'),
('33611', 'Tampa', 'FL'),
('33612', 'Tampa', 'FL'),
('33613', 'Tampa', 'FL'),
('33614', 'Tampa', 'FL'),
('33615', 'Tampa', 'FL'),
('33616', 'Tampa', 'FL'),
('33617', 'Tampa', 'FL'),
('33618', 'Tampa', 'FL'),
('33619', 'Tampa', 'FL'),
('33620', 'Tampa', 'FL'),
('33621', 'Tampa', 'FL'),
('33622', 'Tampa', 'FL'),
('33623', 'Tampa', 'FL'),
('33624', 'Tampa', 'FL'),
('33625', 'Tampa', 'FL'),
('33626', 'Tampa', 'FL'),
('33629', 'Tampa', 'FL'),
('33634', 'Tampa', 'FL'),
('33635', 'Tampa', 'FL'),
('33637', 'Tampa', 'FL'),
('33647', 'Tampa', 'FL'),
('33701', 'St. Petersburg', 'FL'),
('33702', 'St. Petersburg', 'FL'),
('33703', 'St. Petersburg', 'FL'),
('33704', 'St. Petersburg', 'FL'),
('33705', 'St. Petersburg', 'FL'),
('33706', 'St. Petersburg', 'FL'),
('33707', 'St. Petersburg', 'FL'),
('33708', 'St. Petersburg', 'FL'),
('33709', 'St. Petersburg', 'FL'),
('33710', 'St. Petersburg', 'FL'),
('33711', 'St. Petersburg', 'FL'),
('33712', 'St. Petersburg', 'FL'),
('33713', 'St. Petersburg', 'FL'),
('33714', 'St. Petersburg', 'FL'),
('33715', 'St. Petersburg', 'FL'),
('33716', 'St. Petersburg', 'FL'),
('33781', 'St. Petersburg', 'FL'),
('33782', 'St. Petersburg', 'FL'),
('33785', 'St. Petersburg', 'FL'),
('33786', 'St. Petersburg', 'FL')
ON CONFLICT (zip_code) DO NOTHING;

-- Also insert into service_area_zip_codes for compatibility
INSERT INTO service_area_zip_codes (zip_code, city, state)
SELECT zip_code, city, state FROM service_areas
ON CONFLICT (zip_code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_service_areas_zip ON service_areas(zip_code);
CREATE INDEX IF NOT EXISTS idx_service_area_zip_codes_zip ON service_area_zip_codes(zip_code);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for bookings table
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
