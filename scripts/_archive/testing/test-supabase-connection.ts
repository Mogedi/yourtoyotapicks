#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  console.log('🔍 Testing Supabase connection...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', supabaseKey?.length, 'chars\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test 1: Count total records
  console.log('Test 1: Count total records...');
  const { count, error: countError } = await supabase
    .from('marketcheck_listings')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error:', countError.message);
    return;
  }

  console.log(`✅ Total records: ${count}\n`);

  // Test 2: Fetch one record
  console.log('Test 2: Fetch one record...');
  const { data, error } = await supabase
    .from('marketcheck_listings')
    .select('id, vin, make, model, year, price, miles')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log('✅ Sample record:');
  console.log(JSON.stringify(data?.[0], null, 2));
}

testConnection().catch(console.error);
