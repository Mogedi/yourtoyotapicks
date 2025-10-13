#!/usr/bin/env tsx
/**
 * Fetch Marketcheck Sample Data
 *
 * Makes API call(s) to Marketcheck API and saves the raw response to a JSON file.
 * Supports pagination to fetch multiple batches of 50 cars each.
 *
 * Usage:
 *   npx tsx scripts/fetch-marketcheck-sample.ts           # Fetch 50 cars (1 API call)
 *   npx tsx scripts/fetch-marketcheck-sample.ts --batches=3  # Fetch 150 cars (3 API calls)
 *   npx tsx scripts/fetch-marketcheck-sample.ts --batches=5  # Fetch 250 cars (5 API calls)
 *
 * Output:
 *   data/marketcheck-sample.json
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.MARKETCHECK_API_KEY;
const API_BASE_URL = 'https://api.marketcheck.com/v2';

// Generate filename with timestamp for each run
const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const timeHHMM = new Date().toISOString().split('T')[1].substring(0, 5).replace(':', ''); // HHMM
const OUTPUT_FILE = path.join(process.cwd(), 'data', `marketcheck-${timestamp}-${timeHHMM}.json`);

// Parse command-line arguments
const args = process.argv.slice(2);
const batchesArg = args.find(arg => arg.startsWith('--batches='));
const NUM_BATCHES = batchesArg ? parseInt(batchesArg.split('=')[1]) : 1;

// Search parameters (optimized for quality Toyota/Honda vehicles)
const SEARCH_PARAMS = {
  api_key: API_KEY,

  // Vehicle filters (RELAXED for more results)
  make: 'Toyota,Honda',
  model: 'RAV4,CR-V,Camry,Accord,Highlander,Pilot',
  year_range: '2013-2023',  // Extended back 2 years
  price_range: '10000-25000',  // Extended upper range by $5K
  miles_range: '0-100000',

  // Quality filters
  carfax_clean_title: 'true',
  carfax_1_owner: 'true',  // ONLY single-owner cars
  car_type: 'used',

  // Location (Atlanta metro)
  zip: '30301',
  radius: 100,
  country: 'us',

  // Pagination (maximum per call)
  rows: 50,
  start: 0,

  // Sorting (newest listings first)
  sort_by: 'dom_active',
  sort_order: 'asc',

  // Exclude unnecessary data
  include_finance: 'false',
  include_lease: 'false',
};

async function fetchMarketCheckSample() {
  console.log('🚀 Fetching Marketcheck sample data...\n');

  // Validate API key
  if (!API_KEY) {
    console.error('❌ Error: MARKETCHECK_API_KEY not found in .env.local');
    console.error('   Please add: MARKETCHECK_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // Validate batches parameter
  if (isNaN(NUM_BATCHES) || NUM_BATCHES < 1 || NUM_BATCHES > 10) {
    console.error('❌ Error: --batches must be a number between 1 and 10');
    console.error('   Example: npx tsx scripts/fetch-marketcheck-sample.ts --batches=3');
    process.exit(1);
  }

  const totalCars = NUM_BATCHES * 50;
  console.log('📋 Fetch Configuration:');
  console.log(`   Batches: ${NUM_BATCHES}`);
  console.log(`   Expected Total: ${totalCars} cars`);
  console.log(`   API Calls: ${NUM_BATCHES}`);
  console.log(`   Quota Used: ${(NUM_BATCHES / 500 * 100).toFixed(1)}%\n`);

  console.log('📋 Search Parameters:');
  console.log(`   Makes: ${SEARCH_PARAMS.make}`);
  console.log(`   Models: ${SEARCH_PARAMS.model}`);
  console.log(`   Years: ${SEARCH_PARAMS.year_range}`);
  console.log(`   Price: $${SEARCH_PARAMS.price_range.replace('-', ' - $')}`);
  console.log(`   Mileage: ${SEARCH_PARAMS.miles_range.replace('-', ' - ')} miles`);
  console.log(`   Location: ZIP ${SEARCH_PARAMS.zip}, ${SEARCH_PARAMS.radius} mile radius`);
  console.log(`   Clean Title: ${SEARCH_PARAMS.carfax_clean_title}\n`);

  try {
    const allListings: any[] = [];
    let totalFound = 0;

    // Fetch multiple batches with pagination
    for (let batch = 0; batch < NUM_BATCHES; batch++) {
      const startIndex = batch * 50;

      console.log(`\n🌐 Making API request ${batch + 1}/${NUM_BATCHES}...`);
      console.log(`   Pagination: start=${startIndex}, rows=50`);

      const response = await axios.get(`${API_BASE_URL}/search/car/active`, {
        params: {
          ...SEARCH_PARAMS,
          start: startIndex,
          rows: 50,
        },
        headers: {
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      const data = response.data;

      // Track total available
      if (batch === 0) {
        totalFound = data.num_found || 0;
        console.log(`✅ API request successful!`);
        console.log(`   Total available: ${totalFound} vehicles`);
      } else {
        console.log(`✅ Batch ${batch + 1} successful!`);
      }

      // Add listings from this batch
      if (data.listings && data.listings.length > 0) {
        allListings.push(...data.listings);
        console.log(`   Retrieved: ${data.listings.length} listings`);
        console.log(`   Running total: ${allListings.length} listings`);
      } else {
        console.log(`   ⚠️  No more listings available (reached end of results)`);
        break; // Stop if no more results
      }

      // Rate limiting: wait 250ms between requests (max 4 requests/second)
      if (batch < NUM_BATCHES - 1) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }

    // Create combined response object
    const combinedData = {
      num_found: totalFound,
      listings: allListings,
      metadata: {
        fetched_at: new Date().toISOString(),
        batches: NUM_BATCHES,
        total_listings: allListings.length,
      }
    };

    // Log final summary
    console.log('\n\n📊 Final Summary:');
    console.log(`   Total available: ${totalFound} vehicles`);
    console.log(`   Total fetched: ${allListings.length} listings`);
    console.log(`   Unique VINs: ${new Set(allListings.map(car => car.vin)).size}`);
    console.log(`   API calls made: ${NUM_BATCHES}`);
    console.log(`   Quota used: ${NUM_BATCHES}/500 (${(NUM_BATCHES / 500 * 100).toFixed(1)}%)`);

    if (allListings.length > 0) {
      const firstCar = allListings[0];
      const lastCar = allListings[allListings.length - 1];

      console.log(`\n📍 Sample Listings:`);
      console.log(`   First: ${firstCar.build?.year || ''} ${firstCar.build?.make || ''} ${firstCar.build?.model || ''} - $${firstCar.price?.toLocaleString() || 'N/A'}`);
      console.log(`   Last:  ${lastCar.build?.year || ''} ${lastCar.build?.make || ''} ${lastCar.build?.model || ''} - $${lastCar.price?.toLocaleString() || 'N/A'}`);
    }

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      console.log(`\n📁 Creating data directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to JSON file (pretty-printed for readability)
    console.log(`\n💾 Saving response to: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combinedData, null, 2), 'utf-8');

    // Calculate file size
    const stats = fs.statSync(OUTPUT_FILE);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ File saved successfully!`);
    console.log(`   File size: ${fileSizeInKB} KB`);

    // Add to .gitignore if not already there
    const gitignorePath = path.join(dataDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      console.log(`\n🔒 Creating .gitignore in data/ directory`);
      fs.writeFileSync(gitignorePath, 'marketcheck-sample.json\n*.json\n', 'utf-8');
      console.log(`✅ Added marketcheck-sample.json to .gitignore`);
    }

    // Next steps
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Inspect the data: cat data/marketcheck-sample.json | jq '.' | less`);
    console.log(`   2. Review field structure: cat data/marketcheck-sample.json | jq '.listings[0]' | less`);
    console.log(`   3. Count listings: cat data/marketcheck-sample.json | jq '.listings | length'`);
    console.log(`   4. Create database migration based on actual fields`);
    console.log(`   5. Run import script: npx tsx scripts/import-marketcheck-data.ts\n`);

    // API usage reminder
    console.log(`⚠️  API Usage: ${NUM_BATCHES} call${NUM_BATCHES > 1 ? 's' : ''} used (${500 - NUM_BATCHES} remaining this month)`);

  } catch (error: any) {
    console.error('\n❌ Error fetching data from Marketcheck API:\n');

    if (error.response) {
      // API returned an error response
      console.error(`   Status: ${error.response.status} ${error.response.statusText}`);
      console.error(`   Message: ${error.response.data?.message || 'Unknown error'}`);

      if (error.response.status === 401) {
        console.error('\n   💡 Tip: Check that your API key is correct in .env.local');
      } else if (error.response.status === 422) {
        console.error('\n   💡 Tip: Check search parameters (pagination limits, invalid filters)');
      } else if (error.response.status === 429) {
        console.error('\n   💡 Tip: Rate limit exceeded. Wait a few seconds and try again.');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('   No response received from API');
      console.error('   💡 Tip: Check your internet connection');
    } else {
      // Something else went wrong
      console.error(`   ${error.message}`);
    }

    console.error('\n   Full error details:');
    console.error(error);

    process.exit(1);
  }
}

// Run the script
fetchMarketCheckSample()
  .then(() => {
    console.log('✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
