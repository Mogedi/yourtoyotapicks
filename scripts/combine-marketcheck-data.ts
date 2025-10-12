#!/usr/bin/env tsx
/**
 * Combine Marketcheck Data Files
 *
 * Reads all marketcheck-*.json files in data/ directory, deduplicates by VIN,
 * and creates a single combined file.
 *
 * Usage:
 *   npx tsx scripts/combine-marketcheck-data.ts
 *
 * Output:
 *   data/marketcheck-combined.json
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'marketcheck-combined.json');

interface Listing {
  vin: string;
  [key: string]: any;
}

async function combineMarketCheckData() {
  console.log('🔄 Combining Marketcheck data files...\n');

  try {
    // Find all marketcheck-*.json files (excluding combined)
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('marketcheck-') && f.endsWith('.json') && f !== 'marketcheck-combined.json')
      .sort();

    if (files.length === 0) {
      console.error('❌ No marketcheck-*.json files found in data/ directory');
      process.exit(1);
    }

    console.log(`📂 Found ${files.length} data files:\n`);
    files.forEach((file, idx) => {
      const stats = fs.statSync(path.join(DATA_DIR, file));
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${idx + 1}. ${file} (${sizeKB} KB)`);
    });

    // Read all files and collect listings
    const allListings: Listing[] = [];
    const vinMap = new Map<string, Listing>(); // For deduplication
    let totalRead = 0;

    console.log('\n📖 Reading files...\n');

    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      const listings = data.listings || [];
      totalRead += listings.length;

      console.log(`   ${file}: ${listings.length} listings`);

      // Add to VIN map (later entries with same VIN will overwrite earlier ones)
      for (const listing of listings) {
        if (listing.vin) {
          vinMap.set(listing.vin, listing);
        } else {
          console.warn(`   ⚠️  Warning: Listing without VIN found in ${file}`);
        }
      }
    }

    // Convert map back to array
    const uniqueListings = Array.from(vinMap.values());

    console.log('\n📊 Deduplication Summary:');
    console.log(`   Total listings read: ${totalRead}`);
    console.log(`   Duplicate VINs removed: ${totalRead - uniqueListings.length}`);
    console.log(`   Unique listings: ${uniqueListings.length}`);

    // Analyze data
    console.log('\n📈 Data Analysis:');

    // Count by make
    const makeCount: Record<string, number> = {};
    uniqueListings.forEach(listing => {
      const make = listing.build?.make || 'Unknown';
      makeCount[make] = (makeCount[make] || 0) + 1;
    });
    console.log(`   Makes: ${Object.entries(makeCount).map(([make, count]) => `${make} (${count})`).join(', ')}`);

    // Count single-owner vs multi-owner
    const singleOwner = uniqueListings.filter(l => l.carfax_1_owner === true).length;
    const multiOwner = uniqueListings.filter(l => l.carfax_1_owner === false).length;
    console.log(`   Single-owner: ${singleOwner}`);
    console.log(`   Multi-owner: ${multiOwner}`);

    // Price range
    const prices = uniqueListings.map(l => l.price).filter(p => p != null).sort((a, b) => a - b);
    console.log(`   Price range: $${prices[0]?.toLocaleString()} - $${prices[prices.length - 1]?.toLocaleString()}`);

    // Year range
    const years = uniqueListings.map(l => l.build?.year).filter(y => y != null).sort((a, b) => a - b);
    console.log(`   Year range: ${years[0]} - ${years[years.length - 1]}`);

    // Create combined data structure
    const combinedData = {
      num_found: uniqueListings.length,
      listings: uniqueListings,
      metadata: {
        combined_at: new Date().toISOString(),
        source_files: files,
        total_read: totalRead,
        duplicates_removed: totalRead - uniqueListings.length,
        unique_count: uniqueListings.length,
      }
    };

    // Save to file
    console.log(`\n💾 Saving combined data to: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combinedData, null, 2), 'utf-8');

    // Calculate file size
    const stats = fs.statSync(OUTPUT_FILE);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ File saved successfully!`);
    console.log(`   File size: ${fileSizeInKB} KB`);

    console.log('\n📝 Next Steps:');
    console.log('   1. Review combined data: cat data/marketcheck-combined.json | jq \'.listings | length\'');
    console.log('   2. Import to database: npx tsx scripts/import-marketcheck-data.ts --file=marketcheck-combined.json');
    console.log('   3. Verify no duplicates: cat data/marketcheck-combined.json | jq \'[.listings[].vin] | group_by(.) | map({vin: .[0], count: length}) | map(select(.count > 1))\'');

  } catch (error: any) {
    console.error('\n❌ Error combining files:\n');

    if (error instanceof SyntaxError) {
      console.error('   Invalid JSON file format');
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
combineMarketCheckData()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
