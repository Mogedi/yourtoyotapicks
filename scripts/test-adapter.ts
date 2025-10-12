#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { transformMarketcheckToListingSummary, isValidMarketcheckListing } from '../lib/marketcheck-adapter';

console.log('🧪 Testing Marketcheck Adapter...\n');

// Load real data
const data = JSON.parse(readFileSync('data/marketcheck-combined.json', 'utf-8'));
const listings = data.listings;

console.log(`📊 Testing ${listings.length} listings...\n`);

let successCount = 0;
let errorCount = 0;
const errors: string[] = [];

// Test each listing
for (const raw of listings) {
  try {
    // Validate raw data
    if (!isValidMarketcheckListing(raw)) {
      throw new Error('Invalid raw data structure');
    }

    const transformed = transformMarketcheckToListingSummary(raw);

    // Validate required fields
    if (!transformed.vin) throw new Error('Missing VIN');
    if (!transformed.make) throw new Error('Missing make');
    if (!transformed.model) throw new Error('Missing model');
    if (!transformed.year) throw new Error('Missing year');
    if (!transformed.price) throw new Error('Missing price');
    if (!transformed.mileage) throw new Error('Missing mileage');
    if (transformed.priority_score === undefined) throw new Error('Missing priority_score');

    // Validate priority_score range
    if (transformed.priority_score < 0 || transformed.priority_score > 133) {
      throw new Error(`Invalid priority_score: ${transformed.priority_score}`);
    }

    // Validate mileage_rating
    if (!['excellent', 'good', 'acceptable'].includes(transformed.mileage_rating || '')) {
      throw new Error(`Invalid mileage_rating: ${transformed.mileage_rating}`);
    }

    // Validate owner_count
    if (![1, 2].includes(transformed.owner_count)) {
      throw new Error(`Invalid owner_count: ${transformed.owner_count}`);
    }

    successCount++;
  } catch (error) {
    errorCount++;
    const msg = error instanceof Error ? error.message : String(error);
    errors.push(`VIN ${raw.vin}: ${msg}`);
  }
}

console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Errors: ${errorCount}\n`);

if (errors.length > 0) {
  console.log('Errors:');
  errors.forEach(err => console.log(`  - ${err}`));
  process.exit(1);
}

console.log('🎉 All listings transformed successfully!\n');

// Test priority score distribution
const scores = listings.map((l: any) =>
  transformMarketcheckToListingSummary(l).priority_score
);

console.log('📈 Priority Score Distribution:');
console.log(`   Min: ${Math.min(...scores)}`);
console.log(`   Max: ${Math.max(...scores)}`);
console.log(`   Avg: ${(scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)}`);

// Verify expected range
const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
if (avg < 50 || avg > 100) {
  console.warn(`\n⚠️  Warning: Average score (${avg.toFixed(1)}) outside expected range (50-100)`);
  console.warn('   This is using preliminary scoring - will be refined in Phase 6');
}

console.log('\n🎉 Adapter test complete!\n');

process.exit(0);
