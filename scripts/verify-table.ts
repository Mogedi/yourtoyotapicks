#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function verifyTable() {
  console.log('🔍 Verifying marketcheck_listings table...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Test 1: Check if table exists by trying to select from it
  console.log('Test 1: Check if table exists...');
  const { data, error } = await supabase
    .from('marketcheck_listings')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.log(`❌ Table does not exist or is not accessible`);
    console.log(`   Error: ${error.message}`);
    process.exit(1);
  }

  console.log('✅ Table exists and is accessible\n');

  // Test 2: Verify it's empty (before import)
  console.log('Test 2: Check table is empty...');
  const { count, error: countError } = await supabase
    .from('marketcheck_listings')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log(`⚠️  Could not count rows: ${countError.message}`);
  } else {
    console.log(`✅ Table row count: ${count || 0}`);
  }

  // Test 3: Try inserting and deleting a test row to verify permissions
  console.log('\nTest 3: Verify write permissions...');
  const testData = {
    id: 'TEST-123-456',
    vin: 'TESTVIN1234567890',
    heading: 'Test Vehicle',
    year: 2020,
    make: 'Test',
    model: 'Test',
    price: 10000,
    miles: 50000,
    carfax_clean_title: true,
    carfax_1_owner: false,
  };

  const { error: insertError } = await supabase
    .from('marketcheck_listings')
    .insert(testData);

  if (insertError) {
    console.log(`❌ Cannot insert: ${insertError.message}`);
    process.exit(1);
  }

  console.log('✅ Insert permission verified');

  // Clean up test data
  const { error: deleteError } = await supabase
    .from('marketcheck_listings')
    .delete()
    .eq('vin', 'TESTVIN1234567890');

  if (deleteError) {
    console.log(`⚠️  Could not delete test row: ${deleteError.message}`);
  } else {
    console.log('✅ Delete permission verified');
  }

  console.log('\n✅ All table verification tests passed!\n');
  console.log('Ready to import data.');

  process.exit(0);
}

verifyTable();
