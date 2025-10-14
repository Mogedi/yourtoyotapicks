-- YourToyotaPicks Database Schema (Relaxed Constraints for Testing)
-- This version allows seeding with mock data that includes "failing" vehicles
-- Use this for development/testing, then switch to strict schema for production

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: curated_listings
-- ============================================================================

CREATE TABLE IF NOT EXISTS curated_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vehicle Info
  vin VARCHAR(17) NOT NULL UNIQUE,
  make VARCHAR(20) NOT NULL CHECK (make IN ('Toyota', 'Honda')),
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 2015 AND year <= 2025),
  body_type VARCHAR(50),

  -- Pricing & Mileage (RELAXED: Allow any price/mileage for testing)
  price INTEGER NOT NULL CHECK (price > 0),
  mileage INTEGER NOT NULL CHECK (mileage > 0),
  age_in_years INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM CURRENT_DATE) - year) STORED,
  mileage_per_year DECIMAL GENERATED ALWAYS AS (mileage::DECIMAL / NULLIF(age_in_years, 0)) STORED,
  mileage_rating VARCHAR(20),

  -- Title & History (RELAXED: Allow any values)
  title_status VARCHAR(20) NOT NULL DEFAULT 'clean',
  accident_count INTEGER NOT NULL DEFAULT 0 CHECK (accident_count >= 0),
  owner_count INTEGER NOT NULL CHECK (owner_count >= 1),
  is_rental BOOLEAN NOT NULL DEFAULT false,
  is_fleet BOOLEAN NOT NULL DEFAULT false,
  has_lien BOOLEAN NOT NULL DEFAULT false,
  flood_damage BOOLEAN NOT NULL DEFAULT false,

  -- Location (RELAXED: Allow any distance)
  state_of_origin CHAR(2) NOT NULL,
  is_rust_belt_state BOOLEAN NOT NULL DEFAULT false,
  current_location VARCHAR(100) NOT NULL,
  distance_miles INTEGER NOT NULL CHECK (distance_miles > 0),
  dealer_name VARCHAR(200),

  -- Priority & Scoring
  priority_score INTEGER DEFAULT 5,
  flag_rust_concern BOOLEAN DEFAULT false,
  overall_rating VARCHAR(20),

  -- Source Info
  source_platform VARCHAR(50) NOT NULL,
  source_url TEXT NOT NULL,
  source_listing_id VARCHAR(100),
  images_url JSONB,

  -- VIN Data
  vin_decode_data JSONB,
  vin_history_data JSONB,

  -- User Interaction
  reviewed_by_user BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_notes TEXT,

  -- Timestamps
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TABLE: search_logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_date DATE NOT NULL,
  total_listings_fetched INTEGER,
  listings_after_basic_filter INTEGER,
  listings_after_vin_validation INTEGER,
  listings_after_history_check INTEGER,
  final_curated_count INTEGER,
  api_calls_made INTEGER,
  api_cost_usd DECIMAL(10, 2),
  execution_time_seconds DECIMAL(10, 2),
  error_count INTEGER DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_curated_vin ON curated_listings(vin);
CREATE INDEX IF NOT EXISTS idx_curated_make_model ON curated_listings(make, model);
CREATE INDEX IF NOT EXISTS idx_curated_price ON curated_listings(price);
CREATE INDEX IF NOT EXISTS idx_curated_mileage ON curated_listings(mileage);
CREATE INDEX IF NOT EXISTS idx_curated_year ON curated_listings(year);
CREATE INDEX IF NOT EXISTS idx_curated_priority ON curated_listings(priority_score DESC, mileage ASC);
CREATE INDEX IF NOT EXISTS idx_curated_created ON curated_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_curated_reviewed ON curated_listings(reviewed_by_user);
CREATE INDEX IF NOT EXISTS idx_curated_rating ON curated_listings(overall_rating);
CREATE INDEX IF NOT EXISTS idx_search_logs_date ON search_logs(search_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE curated_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to curated_listings" ON curated_listings;
  DROP POLICY IF EXISTS "Allow public read access to search_logs" ON search_logs;
  DROP POLICY IF EXISTS "Allow service role full access to curated_listings" ON curated_listings;
  DROP POLICY IF EXISTS "Allow service role full access to search_logs" ON search_logs;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Public read access
CREATE POLICY "Allow public read access to curated_listings"
  ON curated_listings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to search_logs"
  ON search_logs
  FOR SELECT
  USING (true);

-- Service role full access
CREATE POLICY "Allow service role full access to curated_listings"
  ON curated_listings
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to search_logs"
  ON search_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_curated_listings_updated_at ON curated_listings;
CREATE TRIGGER update_curated_listings_updated_at
  BEFORE UPDATE ON curated_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
