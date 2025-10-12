-- Create marketcheck_listings table
-- Based on actual Marketcheck API response structure (2025-10-12)
-- Data source: data/marketcheck-2025-10-12.json (56 cars)

CREATE TABLE IF NOT EXISTS marketcheck_listings (
  -- Primary identity
  id TEXT PRIMARY KEY,                      -- Marketcheck listing ID (e.g., "1HGCY1F20PA010005-d0eb1b46-297b")
  vin TEXT NOT NULL UNIQUE,                 -- Vehicle Identification Number (17 chars)

  -- Basic vehicle info
  heading TEXT NOT NULL,                    -- Formatted title (e.g., "Pre-Owned 2023 Honda Accord Sedan LX")
  year INTEGER NOT NULL,                    -- Model year (from build object)
  make TEXT NOT NULL,                       -- Manufacturer (from build object)
  model TEXT NOT NULL,                      -- Model name (from build object)
  trim TEXT,                                -- Trim level (from build object)
  version TEXT,                             -- Full version string (from build object)

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,           -- Current asking price
  msrp DECIMAL(10, 2),                     -- Manufacturer's suggested retail price
  ref_price DECIMAL(10, 2),                -- Previous/reference price
  price_change_percent DECIMAL(6, 2),      -- Percentage change from ref_price
  ref_price_dt BIGINT,                     -- Unix timestamp of ref_price

  -- Mileage
  miles INTEGER NOT NULL,                   -- Odometer reading
  ref_miles INTEGER,                        -- Previous mileage reading
  ref_miles_dt BIGINT,                     -- Unix timestamp of ref_miles

  -- Quality indicators
  carfax_1_owner BOOLEAN NOT NULL DEFAULT false,     -- Single owner flag
  carfax_clean_title BOOLEAN NOT NULL DEFAULT true,  -- Clean title flag

  -- Colors
  exterior_color TEXT,                      -- Original color name
  interior_color TEXT,                      -- Original color name
  base_ext_color TEXT,                      -- Standardized exterior color
  base_int_color TEXT,                      -- Standardized interior color

  -- Timing (Days on Market)
  dom INTEGER,                              -- Total days on market
  dom_180 INTEGER,                          -- Days on market (last 180 days)
  dom_active INTEGER,                       -- Days actively listed
  dos_active INTEGER,                       -- Days on site

  -- Timestamps (Unix epoch format from API)
  last_seen_at BIGINT,                     -- Last update timestamp
  last_seen_at_date TIMESTAMP,             -- Converted to PostgreSQL timestamp
  scraped_at BIGINT,                       -- First scrape timestamp
  scraped_at_date TIMESTAMP,               -- Converted to PostgreSQL timestamp
  first_seen_at BIGINT,                    -- First seen timestamp
  first_seen_at_date TIMESTAMP,            -- Converted to PostgreSQL timestamp
  first_seen_at_source BIGINT,            -- First seen at source
  first_seen_at_source_date TIMESTAMP,     -- Converted to PostgreSQL timestamp
  first_seen_at_mc BIGINT,                 -- First seen at Marketcheck
  first_seen_at_mc_date TIMESTAMP,         -- Converted to PostgreSQL timestamp

  -- Listing metadata
  data_source TEXT,                         -- Data source identifier (e.g., "mc")
  vdp_url TEXT,                            -- Dealer listing URL
  seller_type TEXT,                         -- "dealer" or other
  inventory_type TEXT,                      -- "used", "new", etc.
  stock_no TEXT,                           -- Dealer stock number
  source TEXT,                             -- Website domain (e.g., "potamkinatlanta.com")
  in_transit BOOLEAN DEFAULT false,         -- Vehicle in transit flag

  -- Distance (if location-based search)
  dist DECIMAL(10, 2),                     -- Distance from search location (miles)

  -- Dealer information (flattened from dealer object)
  dealer_id INTEGER,                        -- Marketcheck dealer ID
  dealer_name TEXT,                         -- Dealer name
  dealer_type TEXT,                         -- "franchise" or "independent"
  dealer_website TEXT,                      -- Dealer website
  dealer_street TEXT,                       -- Street address
  dealer_city TEXT,                         -- City
  dealer_state TEXT,                        -- State code
  dealer_zip TEXT,                          -- ZIP code
  dealer_country TEXT,                      -- Country code
  dealer_latitude DECIMAL(10, 6),          -- Latitude
  dealer_longitude DECIMAL(10, 6),         -- Longitude
  dealer_phone TEXT,                        -- Phone number
  dealer_msa_code TEXT,                    -- Metropolitan Statistical Area code

  -- Vehicle build specs (flattened from build object)
  body_type TEXT,                           -- "Sedan", "SUV", etc.
  vehicle_type TEXT,                        -- "Car", "Truck", etc.
  transmission TEXT,                        -- Transmission type
  drivetrain TEXT,                          -- "FWD", "AWD", etc.
  fuel_type TEXT,                           -- "Unleaded", "Hybrid", etc.
  engine TEXT,                              -- Engine description (e.g., "2.5L I4")
  engine_size DECIMAL(4, 1),               -- Engine displacement in liters
  engine_block TEXT,                        -- Engine block type ("I", "V", etc.)
  cylinders INTEGER,                        -- Number of cylinders
  doors INTEGER,                            -- Number of doors
  std_seating TEXT,                         -- Standard seating capacity
  highway_mpg INTEGER,                      -- Highway fuel economy
  city_mpg INTEGER,                         -- City fuel economy
  powertrain_type TEXT,                     -- "Combustion", "Hybrid", "Electric"
  made_in TEXT,                             -- Manufacturing country
  overall_height DECIMAL(5, 1),            -- Height in inches
  overall_length DECIMAL(5, 1),            -- Length in inches
  overall_width DECIMAL(5, 1),             -- Width in inches

  -- Media (store as JSONB for flexibility)
  photo_links JSONB,                        -- Array of original photo URLs
  photo_links_cached JSONB,                 -- Array of cached photo URLs

  -- Internal tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_marketcheck_vin ON marketcheck_listings(vin);
CREATE INDEX IF NOT EXISTS idx_marketcheck_make_model ON marketcheck_listings(make, model);
CREATE INDEX IF NOT EXISTS idx_marketcheck_year ON marketcheck_listings(year);
CREATE INDEX IF NOT EXISTS idx_marketcheck_price ON marketcheck_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketcheck_miles ON marketcheck_listings(miles);
CREATE INDEX IF NOT EXISTS idx_marketcheck_dom_active ON marketcheck_listings(dom_active);
CREATE INDEX IF NOT EXISTS idx_marketcheck_clean_title ON marketcheck_listings(carfax_clean_title);
CREATE INDEX IF NOT EXISTS idx_marketcheck_dealer_city ON marketcheck_listings(dealer_city);
CREATE INDEX IF NOT EXISTS idx_marketcheck_updated_at ON marketcheck_listings(updated_at);

-- Composite index for priority scoring queries
CREATE INDEX IF NOT EXISTS idx_marketcheck_priority ON marketcheck_listings(
  carfax_clean_title,
  carfax_1_owner,
  make,
  model,
  year DESC,
  miles ASC
);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_marketcheck_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketcheck_updated_at
  BEFORE UPDATE ON marketcheck_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_marketcheck_updated_at();

-- Comments for documentation
COMMENT ON TABLE marketcheck_listings IS 'Vehicle listings from Marketcheck API with complete build and dealer information';
COMMENT ON COLUMN marketcheck_listings.id IS 'Marketcheck unique listing ID (format: VIN-hash)';
COMMENT ON COLUMN marketcheck_listings.vin IS 'Vehicle Identification Number (17 characters, unique)';
COMMENT ON COLUMN marketcheck_listings.dom_active IS 'Days on market (active listings only) - lower is better';
COMMENT ON COLUMN marketcheck_listings.photo_links IS 'Array of original dealer photo URLs (JSONB)';
COMMENT ON COLUMN marketcheck_listings.photo_links_cached IS 'Array of Marketcheck cached photo URLs (JSONB)';
