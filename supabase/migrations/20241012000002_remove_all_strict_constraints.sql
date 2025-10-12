-- Remove all strict check constraints to allow diverse mock data
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_title_status_check;
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_accident_count_check;
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_owner_count_check;
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_is_rental_check;
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_is_fleet_check;
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_has_lien_check;
ALTER TABLE curated_listings DROP CONSTRAINT IF EXISTS curated_listings_flood_damage_check;
