#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function verifyImport() {
  console.log('🔍 Verifying imported data...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results: { test: string; expected: any; actual: any; status: string }[] = [];

  // Test 1: Total row count
  console.log('Test 1: Verify total row count...');
  const { data: countData, count, error: countError } = await supabase
    .from('marketcheck_listings')
    .select('*', { count: 'exact', head: false });

  const actualCount = countData?.length || 0;
  results.push({
    test: 'Total row count',
    expected: 88,
    actual: actualCount,
    status: actualCount === 88 ? '✅' : '❌'
  });
  console.log(`   Expected: 88, Actual: ${actualCount} ${actualCount === 88 ? '✅' : '❌'}\n`);

  // Test 2: No NULL VINs
  console.log('Test 2: Verify no NULL VINs...');
  const { data: nullVins } = await supabase
    .from('marketcheck_listings')
    .select('vin')
    .is('vin', null);

  const nullVinCount = nullVins?.length || 0;
  results.push({
    test: 'NULL VINs',
    expected: 0,
    actual: nullVinCount,
    status: nullVinCount === 0 ? '✅' : '❌'
  });
  console.log(`   Expected: 0, Actual: ${nullVinCount} ${nullVinCount === 0 ? '✅' : '❌'}\n`);

  // Test 3: Make distribution
  console.log('Test 3: Verify make distribution...');
  const { data: makeData } = await supabase
    .from('marketcheck_listings')
    .select('make');

  const makeCount: Record<string, number> = {};
  makeData?.forEach(row => {
    makeCount[row.make] = (makeCount[row.make] || 0) + 1;
  });

  console.log(`   Honda: ${makeCount['Honda'] || 0} (expected ~45)`);
  console.log(`   Toyota: ${makeCount['Toyota'] || 0} (expected ~43)`);
  results.push({
    test: 'Make distribution',
    expected: 'Honda: ~45, Toyota: ~43',
    actual: `Honda: ${makeCount['Honda'] || 0}, Toyota: ${makeCount['Toyota'] || 0}`,
    status: (makeCount['Honda'] >= 40 && makeCount['Toyota'] >= 40) ? '✅' : '⚠️'
  });
  console.log();

  // Test 4: Single-owner vs Multi-owner
  console.log('Test 4: Verify owner distribution...');
  const { data: ownerData } = await supabase
    .from('marketcheck_listings')
    .select('carfax_1_owner');

  const singleOwner = ownerData?.filter(r => r.carfax_1_owner === true).length || 0;
  const multiOwner = ownerData?.filter(r => r.carfax_1_owner === false).length || 0;

  console.log(`   Single-owner: ${singleOwner} (expected 32)`);
  console.log(`   Multi-owner: ${multiOwner} (expected 56)`);
  results.push({
    test: 'Owner distribution',
    expected: 'Single: 32, Multi: 56',
    actual: `Single: ${singleOwner}, Multi: ${multiOwner}`,
    status: (singleOwner === 32 && multiOwner === 56) ? '✅' : '⚠️'
  });
  console.log();

  // Test 5: Photo coverage
  console.log('Test 5: Verify photo coverage...');
  const { data: photoData } = await supabase
    .from('marketcheck_listings')
    .select('vin, photo_links');

  const withPhotos = photoData?.filter(r => r.photo_links && r.photo_links.length > 0).length || 0;
  const photoCoverage = ((withPhotos / (photoData?.length || 1)) * 100).toFixed(1);

  console.log(`   Cars with photos: ${withPhotos}/${photoData?.length} (${photoCoverage}%)`);
  results.push({
    test: 'Photo coverage',
    expected: '100%',
    actual: `${photoCoverage}%`,
    status: photoCoverage === '100.0' ? '✅' : '⚠️'
  });
  console.log();

  // Test 6: Sample queries
  console.log('Test 6: Test sample queries...');

  // Query 1: Toyota RAV4s
  const { data: rav4s, error: rav4Error } = await supabase
    .from('marketcheck_listings')
    .select('vin, year, model, price')
    .eq('make', 'Toyota')
    .eq('model', 'RAV4')
    .limit(5);

  console.log(`   Toyota RAV4s found: ${rav4s?.length || 0} ${!rav4Error ? '✅' : '❌'}`);

  // Query 2: Price range filter
  const { data: priceFiltered, error: priceError } = await supabase
    .from('marketcheck_listings')
    .select('vin, price')
    .gte('price', 15000)
    .lte('price', 20000)
    .limit(5);

  console.log(`   Cars $15K-$20K: ${priceFiltered?.length || 0} ${!priceError ? '✅' : '❌'}`);

  // Query 3: Single-owner clean title
  const { data: premium, error: premiumError } = await supabase
    .from('marketcheck_listings')
    .select('vin, year, make, model')
    .eq('carfax_1_owner', true)
    .eq('carfax_clean_title', true)
    .limit(5);

  console.log(`   Single-owner clean title: ${premium?.length || 0} ${!premiumError ? '✅' : '❌'}`);
  console.log();

  // Summary
  console.log('═'.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('═'.repeat(60));
  results.forEach(r => {
    console.log(`${r.status} ${r.test}`);
    console.log(`   Expected: ${r.expected}`);
    console.log(`   Actual: ${r.actual}`);
  });
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.status === '✅').length;
  const warnings = results.filter(r => r.status === '⚠️').length;
  const failed = results.filter(r => r.status === '❌').length;

  console.log(`\n✅ Passed: ${passed}`);
  if (warnings > 0) console.log(`⚠️  Warnings: ${warnings}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 All critical tests passed! Data import successful.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the results above.\n');
    process.exit(1);
  }
}

verifyImport();
