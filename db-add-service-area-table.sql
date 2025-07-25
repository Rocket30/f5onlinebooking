-- Check if service_area_zip_codes table exists and create it if not
CREATE TABLE IF NOT EXISTS public.service_area_zip_codes (
    id SERIAL PRIMARY KEY,
    zip_code VARCHAR(10) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_service_area_zip_codes_zip_code ON public.service_area_zip_codes(zip_code);

-- Insert your existing ZIP codes (based on what I saw in your admin panel)
INSERT INTO public.service_area_zip_codes (zip_code, city, state) 
VALUES 
    ('33503', 'balm', 'FL'),
    ('33508', 'brandon', 'FL'),
    ('33509', 'brandon', 'FL'),
    ('33510', 'brandon', 'FL')
ON CONFLICT (zip_code) DO NOTHING;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.service_area_zip_codes ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    -- Check if the policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_area_zip_codes' 
        AND policyname = 'Allow public read access'
    ) THEN
        -- Create policy to allow public read access
        CREATE POLICY "Allow public read access" ON public.service_area_zip_codes
            FOR SELECT USING (true);
    END IF;
    
    -- Check if the policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_area_zip_codes' 
        AND policyname = 'Allow authenticated users full access'
    ) THEN
        -- Create policy to allow authenticated users to insert/update/delete
        CREATE POLICY "Allow authenticated users full access" ON public.service_area_zip_codes
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- Check if the table has data
SELECT COUNT(*) FROM public.service_area_zip_codes;
