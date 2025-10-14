#!/usr/bin/env ts-node
/**
 * Seed Supabase Database with Mock Data
 *
 * This script inserts all 32 curated vehicles from mock-data.ts into Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { mockListings } from '../lib/data/mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('🌱 Seeding Supabase database with mock data...\n');
  console.log(`📊 Total vehicles to insert: ${mockListings.length}\n`);

  // Calculate age and mileage per year for each vehicle
  const currentYear = new Date().getFullYear();
  const vehiclesWithCalculations = mockListings.map((vehicle) => ({
    ...vehicle,
    age_in_years: currentYear - vehicle.year,
    mileage_per_year: Math.round(
      vehicle.mileage / (currentYear - vehicle.year)
    ),
  }));

  // Insert all vehicles
  const { data, error } = await supabase
    .from('curated_listings')
    .insert(vehiclesWithCalculations)
    .select();

  if (error) {
    console.error('❌ Error inserting data:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data?.length || 0} vehicles\n`);

  // Verify the data
  const { count } = await supabase
    .from('curated_listings')
    .select('*', { count: 'exact', head: true });

  console.log(`📈 Total records in database: ${count}\n`);

  // Show breakdown by make
  const { data: toyotas } = await supabase
    .from('curated_listings')
    .select('vin')
    .eq('make', 'Toyota');

  const { data: hondas } = await supabase
    .from('curated_listings')
    .select('vin')
    .eq('make', 'Honda');

  console.log('📊 Breakdown:');
  console.log(`  • Toyota: ${toyotas?.length || 0} vehicles`);
  console.log(`  • Honda: ${hondas?.length || 0} vehicles`);
  console.log('');
  console.log('✨ Database seeding complete!');
}

seedDatabase().catch(console.error);
