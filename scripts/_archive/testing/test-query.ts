import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://crehsfhbludetpafbnwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWhzZmhibHVkZXRwYWZibndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNjczNDIsImV4cCI6MjA3NTg0MzM0Mn0.WO3XSdRELqYNgx3y8UdFblaygjXFSI-7aMDai7Bpw9E'
);

async function testQuery() {
  console.log('Testing VIN query...\n');

  // Test 1: Uppercase VIN
  const { data: data1, error: error1 } = await supabase
    .from('curated_listings')
    .select('vin, make, model, year')
    .eq('vin', '4T1K61AK0MU123456')
    .single();

  console.log('Test 1 - Uppercase VIN (4T1K61AK0MU123456):');
  console.log('Data:', data1);
  console.log('Error:', error1);
  console.log('');

  // Test 2: Lowercase VIN
  const { data: data2, error: error2 } = await supabase
    .from('curated_listings')
    .select('vin, make, model, year')
    .eq('vin', '4t1k61ak0mu123456')
    .single();

  console.log('Test 2 - Lowercase VIN (4t1k61ak0mu123456):');
  console.log('Data:', data2);
  console.log('Error:', error2);
  console.log('');

  // Test 3: List all VINs
  const { data: allVins, error: error3 } = await supabase
    .from('curated_listings')
    .select('vin')
    .limit(5);

  console.log('Test 3 - First 5 VINs in database:');
  console.log(allVins);
  console.log('Error:', error3);
}

testQuery();
