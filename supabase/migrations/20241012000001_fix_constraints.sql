-- Remove strict check constraints
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_price_check;
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_mileage_check;
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_distance_miles_check;

-- Add more flexible constraints
ALTER TABLE curated_listings ADD CONSTRAINT curated_listings_price_check CHECK (price >= 10000);
ALTER TABLE curated_listings ADD CONSTRAINT curated_listings_mileage_check CHECK (mileage >= 0);
