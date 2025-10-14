-- YourToyotaPicks Database Schema
-- This file contains the complete database schema for the car listing application
-- Run this in your Supabase SQL Editor after creating your project

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: curated_listings
-- ============================================================================
-- Stores all vehicles that have passed through the complete filtering pipeline
-- Only high-quality, accident-free, clean-title vehicles are stored here

CREATE TABLE curated_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vehicle Info
  vin VARCHAR(17) NOT NULL UNIQUE,
  make VARCHAR(20) NOT NULL CHECK (make IN ('Toyota', 'Honda')),
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 2015 AND year <= 2025),
  body_type VARCHAR(50), -- SUV, Crossover, Sedan, etc.

  -- Pricing & Mileage
  price INTEGER NOT NULL CHECK (price >= 10000 AND price <= 20000),
  mileage INTEGER NOT NULL CHECK (mileage <= 160000),
  age_in_years INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM CURRENT_DATE) - year) STORED,
  mileage_per_year DECIMAL GENERATED ALWAYS AS (mileage::DECIMAL / NULLIF(age_in_years, 0)) STORED,
  mileage_rating VARCHAR(20), -- 'excellent' | 'good' | 'acceptable'

  -- Title & History
  title_status VARCHAR(20) NOT NULL DEFAULT 'clean' CHECK (title_status = 'clean'),
  accident_count INTEGER NOT NULL DEFAULT 0 CHECK (accident_count = 0),
  owner_count INTEGER NOT NULL CHECK (owner_count IN (1, 2)),
  is_rental BOOLEAN NOT NULL DEFAULT false CHECK (is_rental = false),
  is_fleet BOOLEAN NOT NULL DEFAULT false CHECK (is_fleet = false),
  has_lien BOOLEAN NOT NULL DEFAULT false CHECK (has_lien = false),
  flood_damage BOOLEAN NOT NULL DEFAULT false CHECK (flood_damage = false),

  -- Location
  state_of_origin CHAR(2) NOT NULL,
  is_rust_belt_state BOOLEAN NOT NULL DEFAULT false,
  current_location VARCHAR(100) NOT NULL,
  distance_miles INTEGER NOT NULL CHECK (distance_miles <= 30),
  dealer_name VARCHAR(200),

  -- Priority & Scoring
  priority_score INTEGER DEFAULT 5,
  flag_rust_concern BOOLEAN DEFAULT false,
  overall_rating VARCHAR(20), -- 'high' | 'medium' | 'low'

  -- Source Info
  source_platform VARCHAR(50) NOT NULL, -- 'Marketcheck' | 'Auto.dev' | 'Carapis'
  source_url TEXT NOT NULL,
  source_listing_id VARCHAR(100),
  images_url JSONB, -- Array of image URLs

  -- VIN Data
  vin_decode_data JSONB, -- Full NHTSA response
  vin_history_data JSONB, -- Full VinAudit response

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
-- Tracks execution metrics for each daily search run
-- Useful for monitoring API costs and filter effectiveness

CREATE TABLE search_logs (
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
-- Optimized indexes for common query patterns

-- Curated Listings Indexes
CREATE INDEX idx_curated_vin ON curated_listings(vin);
CREATE INDEX idx_curated_make_model ON curated_listings(make, model);
CREATE INDEX idx_curated_price ON curated_listings(price);
CREATE INDEX idx_curated_mileage ON curated_listings(mileage);
CREATE INDEX idx_curated_year ON curated_listings(year);
CREATE INDEX idx_curated_priority ON curated_listings(priority_score DESC, mileage ASC);
CREATE INDEX idx_curated_created ON curated_listings(created_at DESC);
CREATE INDEX idx_curated_reviewed ON curated_listings(reviewed_by_user);
CREATE INDEX idx_curated_rating ON curated_listings(overall_rating);

-- Search Logs Indexes
CREATE INDEX idx_search_logs_date ON search_logs(search_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on tables
ALTER TABLE curated_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for curated_listings
-- Anyone can view listings (useful for public dashboard)
CREATE POLICY "Allow public read access to curated_listings"
  ON curated_listings
  FOR SELECT
  USING (true);

-- Public read access for search_logs
-- Anyone can view search statistics
CREATE POLICY "Allow public read access to search_logs"
  ON search_logs
  FOR SELECT
  USING (true);

-- Service role can do everything (for cron jobs)
-- Note: Service role bypasses RLS, these policies are for additional security
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

-- Function to automatically update last_updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_updated_at on curated_listings
CREATE TRIGGER update_curated_listings_updated_at
  BEFORE UPDATE ON curated_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE QUERIES (for testing)
-- ============================================================================

-- Get all listings ordered by priority
-- SELECT * FROM curated_listings
-- ORDER BY priority_score DESC, mileage ASC, price ASC;

-- Get listings by specific model
-- SELECT * FROM curated_listings
-- WHERE model = 'RAV4'
-- ORDER BY price ASC;

-- Get excellent condition vehicles (under 100k miles)
-- SELECT * FROM curated_listings
-- WHERE mileage < 100000
-- ORDER BY created_at DESC;

-- Get latest search statistics
-- SELECT * FROM search_logs
-- ORDER BY search_date DESC
-- LIMIT 7;

-- Get average curated count per day
-- SELECT
--   AVG(final_curated_count) as avg_listings_per_day,
--   AVG(api_cost_usd) as avg_cost_per_day
-- FROM search_logs
-- WHERE search_date >= CURRENT_DATE - INTERVAL '30 days';
