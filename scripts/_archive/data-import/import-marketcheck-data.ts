#!/usr/bin/env tsx
/**
 * Import Marketcheck Data to Supabase
 *
 * Reads JSON file from data/ directory and imports into marketcheck_listings table.
 * Supports upsert (on conflict: update) to handle duplicate VINs.
 *
 * Usage:
 *   npx tsx scripts/import-marketcheck-data.ts                    # Use latest marketcheck-YYYY-MM-DD.json
 *   npx tsx scripts/import-marketcheck-data.ts --file=custom.json # Use specific file
 *
 * Requirements:
 *   - Supabase local instance running (supabase start)
 *   - OR production Supabase configured in .env.local
 *   - Database migration already applied
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Parse command-line arguments
const args = process.argv.slice(2);
const fileArg = args.find(arg => arg.startsWith('--file='));
const specifiedFile = fileArg ? fileArg.split('=')[1] : null;

// Find the most recent marketcheck-*.json file if not specified
function findLatestMarketCheckFile(): string {
  const dataDir = path.join(process.cwd(), 'data');
  const files = fs.readdirSync(dataDir);

  // Filter for date-based files only (marketcheck-YYYY-MM-DD.json)
  const dateBasedFiles = files
    .filter(f => f.match(/^marketcheck-\d{4}-\d{2}-\d{2}\.json$/))
    .sort()
    .reverse(); // Most recent first (YYYY-MM-DD sorts correctly)

  if (dateBasedFiles.length > 0) {
    return path.join(dataDir, dateBasedFiles[0]);
  }

  // Fallback to any marketcheck-*.json file
  const allMarketCheckFiles = files
    .filter(f => f.startsWith('marketcheck-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (allMarketCheckFiles.length === 0) {
    throw new Error('No marketcheck-*.json files found in data/ directory');
  }

  return path.join(dataDir, allMarketCheckFiles[0]);
}

const INPUT_FILE = specifiedFile
  ? path.join(process.cwd(), 'data', specifiedFile)
  : findLatestMarketCheckFile();

/**
 * Convert Unix timestamp to PostgreSQL timestamp
 */
function timestampToDate(timestamp: number | null | undefined): string | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Map API listing to database row
 */
function mapListingToRow(listing: any): any {
  return {
    // Primary identity
    id: listing.id,
    vin: listing.vin,

    // Basic vehicle info
    heading: listing.heading,
    year: listing.build?.year,
    make: listing.build?.make,
    model: listing.build?.model,
    trim: listing.build?.trim || null,
    version: listing.build?.version || null,

    // Pricing
    price: listing.price,
    msrp: listing.msrp || null,
    ref_price: listing.ref_price || null,
    price_change_percent: listing.price_change_percent || null,
    ref_price_dt: listing.ref_price_dt || null,

    // Mileage
    miles: listing.miles,
    ref_miles: listing.ref_miles || null,
    ref_miles_dt: listing.ref_miles_dt || null,

    // Quality indicators
    carfax_1_owner: listing.carfax_1_owner || false,
    carfax_clean_title: listing.carfax_clean_title || true,

    // Colors
    exterior_color: listing.exterior_color || null,
    interior_color: listing.interior_color || null,
    base_ext_color: listing.base_ext_color || null,
    base_int_color: listing.base_int_color || null,

    // Timing (Days on Market)
    dom: listing.dom || null,
    dom_180: listing.dom_180 || null,
    dom_active: listing.dom_active || null,
    dos_active: listing.dos_active || null,

    // Timestamps (Unix epoch and PostgreSQL)
    last_seen_at: listing.last_seen_at || null,
    last_seen_at_date: timestampToDate(listing.last_seen_at),
    scraped_at: listing.scraped_at || null,
    scraped_at_date: timestampToDate(listing.scraped_at),
    first_seen_at: listing.first_seen_at || null,
    first_seen_at_date: timestampToDate(listing.first_seen_at),
    first_seen_at_source: listing.first_seen_at_source || null,
    first_seen_at_source_date: timestampToDate(listing.first_seen_at_source),
    first_seen_at_mc: listing.first_seen_at_mc || null,
    first_seen_at_mc_date: timestampToDate(listing.first_seen_at_mc),

    // Listing metadata
    data_source: listing.data_source || null,
    vdp_url: listing.vdp_url || null,
    seller_type: listing.seller_type || null,
    inventory_type: listing.inventory_type || null,
    stock_no: listing.stock_no || null,
    source: listing.source || null,
    in_transit: listing.in_transit || false,

    // Distance
    dist: listing.dist || null,

    // Dealer information (flattened)
    dealer_id: listing.dealer?.id || null,
    dealer_name: listing.dealer?.name || null,
    dealer_type: listing.dealer?.dealer_type || null,
    dealer_website: listing.dealer?.website || null,
    dealer_street: listing.dealer?.street || null,
    dealer_city: listing.dealer?.city || null,
    dealer_state: listing.dealer?.state || null,
    dealer_zip: listing.dealer?.zip || null,
    dealer_country: listing.dealer?.country || null,
    dealer_latitude: listing.dealer?.latitude ? parseFloat(listing.dealer.latitude) : null,
    dealer_longitude: listing.dealer?.longitude ? parseFloat(listing.dealer.longitude) : null,
    dealer_phone: listing.dealer?.phone || null,
    dealer_msa_code: listing.dealer?.msa_code || null,

    // Vehicle build specs (flattened)
    body_type: listing.build?.body_type || null,
    vehicle_type: listing.build?.vehicle_type || null,
    transmission: listing.build?.transmission || null,
    drivetrain: listing.build?.drivetrain || null,
    fuel_type: listing.build?.fuel_type || null,
    engine: listing.build?.engine || null,
    engine_size: listing.build?.engine_size || null,
    engine_block: listing.build?.engine_block || null,
    cylinders: listing.build?.cylinders || null,
    doors: listing.build?.doors || null,
    std_seating: listing.build?.std_seating || null,
    highway_mpg: listing.build?.highway_mpg || null,
    city_mpg: listing.build?.city_mpg || null,
    powertrain_type: listing.build?.powertrain_type || null,
    made_in: listing.build?.made_in || null,
    overall_height: listing.build?.overall_height ? parseFloat(listing.build.overall_height) : null,
    overall_length: listing.build?.overall_length ? parseFloat(listing.build.overall_length) : null,
    overall_width: listing.build?.overall_width ? parseFloat(listing.build.overall_width) : null,

    // Media (store as JSONB)
    photo_links: listing.media?.photo_links || null,
    photo_links_cached: listing.media?.photo_links_cached || null,
  };
}

async function importMarketCheckData() {
  console.log('📦 Importing Marketcheck data to Supabase...\n');

  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Supabase credentials not found in .env.local');
    console.error('   Required variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\n   💡 Tip: Start local Supabase with: supabase start');
    process.exit(1);
  }

  // Check if input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Error: File not found: ${INPUT_FILE}`);
    console.error('\n   💡 Tip: Run fetch script first: npx tsx scripts/fetch-marketcheck-sample.ts');
    process.exit(1);
  }

  console.log('📋 Import Configuration:');
  console.log(`   Input file: ${path.basename(INPUT_FILE)}`);
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Table: marketcheck_listings\n`);

  try {
    // Read JSON file
    console.log('📖 Reading JSON file...');
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const data = JSON.parse(fileContent);

    const listings = data.listings || [];
    console.log(`✅ Loaded ${listings.length} listings from file`);

    if (listings.length === 0) {
      console.error('❌ No listings found in file');
      process.exit(1);
    }

    // Show sample listing info
    const firstListing = listings[0];
    console.log(`\n📍 Sample Listing:`);
    console.log(`   VIN: ${firstListing.vin}`);
    console.log(`   Vehicle: ${firstListing.build?.year} ${firstListing.build?.make} ${firstListing.build?.model}`);
    console.log(`   Price: $${firstListing.price?.toLocaleString()}`);
    console.log(`   Mileage: ${firstListing.miles?.toLocaleString()} miles`);

    // Initialize Supabase client
    console.log('\n🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Test connection
    const { error: connectionError } = await supabase.from('marketcheck_listings').select('count').limit(0);
    if (connectionError) {
      console.error('❌ Failed to connect to Supabase:');
      console.error(`   ${connectionError.message}`);
      console.error('\n   💡 Tip: Check that migration is applied and table exists');
      process.exit(1);
    }
    console.log('✅ Connected to Supabase');

    // Map listings to database rows
    console.log('\n🗺️  Mapping API data to database schema...');
    const rows = listings.map(mapListingToRow);
    console.log(`✅ Mapped ${rows.length} rows`);

    // Batch upsert (insert or update on conflict)
    console.log('\n💾 Inserting data into database...');
    console.log('   Strategy: Upsert (insert or update on VIN conflict)');

    // Insert in batches of 50 to avoid payload limits
    const BATCH_SIZE = 50;
    let totalInserted = 0;
    let totalUpdated = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

      console.log(`   Batch ${batchNum}/${totalBatches}: Inserting ${batch.length} rows...`);

      const { data: insertData, error: insertError } = await supabase
        .from('marketcheck_listings')
        .upsert(batch, {
          onConflict: 'vin',
          ignoreDuplicates: false, // Update if exists
        })
        .select('vin');

      if (insertError) {
        console.error(`   ❌ Batch ${batchNum} failed:`);
        console.error(`      ${insertError.message}`);

        // Try to identify which row caused the error
        console.error('\n   Problematic rows:');
        batch.forEach((row, idx) => {
          console.error(`      ${i + idx + 1}. VIN: ${row.vin} (${row.year} ${row.make} ${row.model})`);
        });

        process.exit(1);
      }

      totalInserted += batch.length;
      console.log(`   ✅ Batch ${batchNum} completed (${totalInserted}/${rows.length} total)`);
    }

    // Verify import
    console.log('\n📊 Verifying import...');
    const { data: countData, error: countError } = await supabase
      .from('marketcheck_listings')
      .select('vin', { count: 'exact', head: true });

    if (countError) {
      console.error('⚠️  Warning: Could not verify count');
      console.error(`   ${countError.message}`);
    } else {
      const dbCount = (countData as any)?.length || 0;
      console.log(`✅ Database contains ${dbCount} total listings`);
    }

    // Summary statistics
    console.log('\n📈 Import Summary:');
    console.log(`   Total rows processed: ${rows.length}`);
    console.log(`   Successfully imported: ${totalInserted}`);

    // Sample queries
    console.log('\n📝 Sample Queries:');
    console.log('   1. View all listings:');
    console.log('      SELECT vin, year, make, model, price, miles FROM marketcheck_listings;');
    console.log('\n   2. View Toyota RAV4s only:');
    console.log('      SELECT * FROM marketcheck_listings WHERE make = \'Toyota\' AND model = \'RAV4\';');
    console.log('\n   3. View clean title, single-owner vehicles:');
    console.log('      SELECT * FROM marketcheck_listings WHERE carfax_clean_title = true AND carfax_1_owner = true;');
    console.log('\n   4. Count by make and model:');
    console.log('      SELECT make, model, COUNT(*) FROM marketcheck_listings GROUP BY make, model ORDER BY count DESC;');

    // Next steps
    console.log('\n🎯 Next Steps:');
    console.log('   1. Query the data: supabase db sql --query "SELECT * FROM marketcheck_listings LIMIT 5;"');
    console.log('   2. Verify data quality: Check for NULL values, incorrect types, etc.');
    console.log('   3. Update dashboard to use Marketcheck data instead of mock data');
    console.log('   4. Test dashboard filters with real data');
    console.log('   5. Schedule periodic data refreshes (weekly cron job)\n');

  } catch (error: any) {
    console.error('\n❌ Error during import:\n');

    if (error instanceof SyntaxError) {
      console.error('   Invalid JSON file format');
      console.error(`   ${error.message}`);
    } else if (error.code === 'ENOENT') {
      console.error('   File not found');
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${error.message || error}`);
    }

    console.error('\n   Full error details:');
    console.error(error);

    process.exit(1);
  }
}

// Run the script
importMarketCheckData()
  .then(() => {
    console.log('✨ Import complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
