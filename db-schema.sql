-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(10) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  unit_number VARCHAR(50),
  property_type VARCHAR(20),
  floors INTEGER,
  floor_level VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  fixed_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time VARCHAR(50) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  zip_code VARCHAR(10) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create booking_services table (many-to-many)
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create booking_rooms table
CREATE TABLE IF NOT EXISTS booking_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  room_type VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create service_area_zip_codes table
CREATE TABLE IF NOT EXISTS service_area_zip_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code VARCHAR(10) UNIQUE NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert some default service area zip codes (Tampa Bay area examples)
INSERT INTO service_area_zip_codes (zip_code, city, state) VALUES
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

-- Create index for zip code lookups
CREATE INDEX IF NOT EXISTS idx_service_area_zip_codes_zip ON service_area_zip_codes(zip_code);

-- Insert default services
INSERT INTO services (name, description, icon, fixed_price) VALUES
('Carpet Cleaning', 'Deep clean your carpets to remove dirt, stains, and allergens', '🧹', 89.00),
('Upholstery Cleaning', 'Refresh your furniture and remove embedded dirt and odors', '🛋️', 79.00),
('Tile & Grout Cleaning', 'Restore the original beauty of your tile floors and surfaces', '🧽', 225.00)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
