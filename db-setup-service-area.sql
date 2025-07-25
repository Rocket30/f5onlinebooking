-- Create the service_area_zip_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS service_area_zip_codes (
    id SERIAL PRIMARY KEY,
    zip_code VARCHAR(10) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_area_zip_codes_zip_code ON service_area_zip_codes(zip_code);

-- Insert your existing ZIP codes (based on what I saw in your admin panel)
INSERT INTO service_area_zip_codes (zip_code, city, state) VALUES
('33503', 'balm', 'FL'),
('33508', 'brandon', 'FL'),
('33509', 'brandon', 'FL'),
('33510', 'brandon', 'FL')
ON CONFLICT (zip_code) DO NOTHING;

-- Add some additional Tampa Bay area ZIP codes
INSERT INTO service_area_zip_codes (zip_code, city, state) VALUES
('33511', 'brandon', 'FL'),
('33527', 'wesley chapel', 'FL'),
('33534', 'lutz', 'FL'),
('33549', 'lutz', 'FL'),
('33556', 'odessa', 'FL'),
('33558', 'lutz', 'FL'),
('33559', 'lutz', 'FL'),
('33602', 'tampa', 'FL'),
('33603', 'tampa', 'FL'),
('33604', 'tampa', 'FL'),
('33605', 'tampa', 'FL'),
('33606', 'tampa', 'FL'),
('33607', 'tampa', 'FL'),
('33609', 'tampa', 'FL'),
('33610', 'tampa', 'FL'),
('33611', 'tampa', 'FL'),
('33612', 'tampa', 'FL'),
('33613', 'tampa', 'FL'),
('33614', 'tampa', 'FL'),
('33615', 'tampa', 'FL'),
('33616', 'tampa', 'FL'),
('33617', 'tampa', 'FL'),
('33618', 'tampa', 'FL'),
('33619', 'tampa', 'FL'),
('33620', 'tampa', 'FL'),
('33621', 'tampa', 'FL'),
('33624', 'tampa', 'FL'),
('33625', 'tampa', 'FL'),
('33626', 'tampa', 'FL'),
('33629', 'tampa', 'FL'),
('33634', 'tampa', 'FL'),
('33635', 'tampa', 'FL'),
('33637', 'tampa', 'FL'),
('33647', 'tampa', 'FL'),
('33701', 'st petersburg', 'FL'),
('33702', 'st petersburg', 'FL'),
('33703', 'st petersburg', 'FL'),
('33704', 'st petersburg', 'FL'),
('33705', 'st petersburg', 'FL'),
('33706', 'st petersburg', 'FL'),
('33707', 'st petersburg', 'FL'),
('33708', 'st petersburg', 'FL'),
('33709', 'st petersburg', 'FL'),
('33710', 'st petersburg', 'FL'),
('33711', 'st petersburg', 'FL'),
('33712', 'st petersburg', 'FL'),
('33713', 'st petersburg', 'FL'),
('33714', 'st petersburg', 'FL'),
('33715', 'st petersburg', 'FL'),
('33716', 'st petersburg', 'FL'),
('33781', 'pinellas park', 'FL'),
('33782', 'pinellas park', 'FL')
ON CONFLICT (zip_code) DO NOTHING;
