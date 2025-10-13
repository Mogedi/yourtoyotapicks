#!/usr/bin/env tsx
/**
 * Simple database seeding script
 * Inserts all 32 mock vehicles into Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { mockListings } from '../lib/mock-data';

const supabaseUrl = 'https://crehsfhbludetpafbnwe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWhzZmhibHVkZXRwYWZibndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNjczNDIsImV4cCI6MjA3NTg0MzM0Mn0.WO3XSdRELqYNgx3y8UdFblaygjXFSI-7aMDai7Bpw9E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('🌱 Seeding database with 32 vehicles...\n');

  let success = 0;
  let failed = 0;

  for (const vehicle of mockListings) {
    try {
      const { data, error } = await supabase
        .from('curated_listings')
        .insert(vehicle)
        .select()
        .single();

      if (error) {
        console.log(`❌ ${vehicle.vin}: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ ${vehicle.year} ${vehicle.make} ${vehicle.model} (${data.id})`);
        success++;
      }
    } catch (err) {
      console.log(`❌ ${vehicle.vin}: ${err}`);
      failed++;
    }
  }

  console.log(`\n✅ Inserted: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${mockListings.length}\n`);

  // Verify
  const { count } = await supabase
    .from('curated_listings')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total records in database: ${count}\n`);
}

seed();
