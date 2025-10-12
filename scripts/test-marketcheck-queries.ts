#!/usr/bin/env tsx
import { getMarketcheckListings, getMarketcheckListingByVin, getMarketcheckStats } from '../lib/supabase';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🧪 Testing Marketcheck Queries...\n');

async function runTests() {
  let passCount = 0;
  let failCount = 0;

  // Test 1: Get all listings
  console.log('Test 1: Get all listings...');
  try {
    const all = await getMarketcheckListings({ limit: 100 });
    if (all.data.length === 88) {
      console.log(`✅ Returned ${all.data.length} listings (expected 88)`);
      passCount++;
    } else {
      console.log(`❌ Expected 88 cars, got ${all.data.length}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 2: Filter by make (Honda)
  console.log('Test 2: Filter by make (Honda)...');
  try {
    const hondas = await getMarketcheckListings({ makes: ['Honda'] });
    if (hondas.data.length === 45) {
      console.log(`✅ Returned ${hondas.data.length} Hondas (expected 45)`);
      passCount++;
    } else {
      console.log(`❌ Expected 45 Hondas, got ${hondas.data.length}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 3: Filter by make (Toyota)
  console.log('Test 3: Filter by make (Toyota)...');
  try {
    const toyotas = await getMarketcheckListings({ makes: ['Toyota'] });
    if (toyotas.data.length === 43) {
      console.log(`✅ Returned ${toyotas.data.length} Toyotas (expected 43)`);
      passCount++;
    } else {
      console.log(`❌ Expected 43 Toyotas, got ${toyotas.data.length}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 4: Filter by price range
  console.log('Test 4: Filter by price range ($15K-$20K)...');
  try {
    const inBudget = await getMarketcheckListings({ priceMin: 15000, priceMax: 20000 });
    console.log(`✅ Found ${inBudget.data.length} cars in range`);

    // Verify all are in range
    const outOfRange = inBudget.data.filter(car => car.price < 15000 || car.price > 20000);
    if (outOfRange.length === 0) {
      console.log(`✅ All cars in price range`);
      passCount++;
    } else {
      console.log(`❌ ${outOfRange.length} cars out of range`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 5: Single-owner filter
  console.log('Test 5: Filter single-owner only...');
  try {
    const singleOwner = await getMarketcheckListings({ maxOwners: 1 });
    if (singleOwner.data.length === 32) {
      console.log(`✅ Returned ${singleOwner.data.length} single-owner cars (expected 32)`);
      passCount++;
    } else {
      console.log(`❌ Expected 32 single-owner, got ${singleOwner.data.length}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 6: Get by VIN (uppercase)
  console.log('Test 6: Get by VIN (uppercase)...');
  try {
    const car1 = await getMarketcheckListingByVin('1HGCV1F38KA025118');
    if (car1) {
      console.log(`✅ Found: ${car1.year} ${car1.make} ${car1.model}`);
      passCount++;
    } else {
      console.log(`❌ Car not found`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 7: Get by VIN (lowercase - case insensitive)
  console.log('Test 7: Get by VIN (lowercase)...');
  try {
    const car2 = await getMarketcheckListingByVin('1hgcv1f38ka025118');
    if (car2) {
      console.log(`✅ Found: ${car2.year} ${car2.make} ${car2.model}`);
      console.log(`✅ Case-insensitive lookup works`);
      passCount++;
    } else {
      console.log(`❌ Car not found (case-insensitive lookup failed)`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 8: Invalid VIN
  console.log('Test 8: Invalid VIN...');
  try {
    const invalid = await getMarketcheckListingByVin('INVALID123');
    if (invalid === null) {
      console.log(`✅ Returns null for invalid VIN`);
      passCount++;
    } else {
      console.log(`❌ Should return null for invalid VIN`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 9: Get stats
  console.log('Test 9: Get dashboard stats...');
  try {
    const stats = await getMarketcheckStats();
    console.log(`   Total: ${stats.total}`);
    console.log(`   Single-owner: ${stats.singleOwner}`);
    console.log(`   Avg Price: $${stats.avgPrice.toFixed(0)}`);
    console.log(`   Avg Mileage: ${stats.avgMileage.toFixed(0)} mi`);

    if (stats.total === 88 && stats.singleOwner === 32) {
      console.log(`✅ Stats calculated correctly`);
      passCount++;
    } else {
      console.log(`❌ Stats incorrect (expected total: 88, single-owner: 32)`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Test 10: Verify priority sorting
  console.log('Test 10: Verify priority sorting...');
  try {
    const sorted = await getMarketcheckListings({ sortBy: 'priority', sortOrder: 'desc' });

    // Check that priority scores are in descending order
    let isDescending = true;
    for (let i = 0; i < sorted.data.length - 1; i++) {
      if (sorted.data[i].priority_score < sorted.data[i + 1].priority_score) {
        isDescending = false;
        break;
      }
    }

    if (isDescending) {
      console.log(`✅ Priority sorting works correctly`);
      console.log(`   Top score: ${sorted.data[0].priority_score}`);
      console.log(`   Bottom score: ${sorted.data[sorted.data.length - 1].priority_score}`);
      passCount++;
    } else {
      console.log(`❌ Priority sorting not working correctly`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }
  console.log();

  // Summary
  console.log('═'.repeat(60));
  console.log('TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Passed: ${passCount}/10`);
  console.log(`❌ Failed: ${failCount}/10`);
  console.log('═'.repeat(60));

  if (failCount === 0) {
    console.log('\n🎉 All query tests passed! Ready for deployment.\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failCount} test(s) failed. Please review before deploying.\n`);
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
