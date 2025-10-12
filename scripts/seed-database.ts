#!/usr/bin/env tsx
/**
 * Database seeding script for YourToyotaPicks
 * Seeds the Supabase database with mock vehicle data from lib/mock-data.ts
 *
 * Usage:
 *   npx tsx scripts/seed-database.ts
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { mockListings } from '../lib/mock-data';
import type { VehicleInsert } from '../lib/types';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crehsfhbludetpafbnwe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWhzZmhibHVkZXRwYWZibndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNjczNDIsImV4cCI6MjA3NTg0MzM0Mn0.WO3XSdRELqYNgx3y8UdFblaygjXFSI-7aMDai7Bpw9E';

// Create Supabase client (using anon key for testing)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SeedResult {
  success: boolean;
  inserted: number;
  failed: number;
  errors: Array<{ vin: string; error: string }>;
}

/**
 * Seeds the curated_listings table with mock vehicle data
 */
async function seedDatabase(): Promise<SeedResult> {
  console.log('🚗 Starting database seeding...\n');
  console.log(`📊 Total vehicles to insert: ${mockListings.length}\n`);

  const result: SeedResult = {
    success: true,
    inserted: 0,
    failed: 0,
    errors: [],
  };

  // Insert vehicles one by one to track individual errors
  for (const vehicle of mockListings) {
    try {
      console.log(`📝 Inserting: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.vin})`);

      const { data, error } = await supabase
        .from('curated_listings')
        .insert(vehicle)
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        result.failed++;
        result.errors.push({
          vin: vehicle.vin,
          error: error.message,
        });
      } else {
        console.log(`   ✅ Success (ID: ${data.id})`);
        result.inserted++;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`   ❌ Exception: ${errorMessage}`);
      result.failed++;
      result.errors.push({
        vin: vehicle.vin,
        error: errorMessage,
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully inserted: ${result.inserted}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`📊 Total: ${mockListings.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(({ vin, error }) => {
      console.log(`   - ${vin}: ${error}`);
    });
    result.success = false;
  }

  return result;
}

/**
 * Verifies the data was inserted correctly
 */
async function verifyData(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VERIFYING DATA');
  console.log('='.repeat(60));

  try {
    // Count total records
    const { count, error: countError } = await supabase
      .from('curated_listings')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting records:', countError.message);
      return;
    }

    console.log(`\n📊 Total records in database: ${count}`);

    // Get sample records by make
    const { data: toyotaData, error: toyotaError } = await supabase
      .from('curated_listings')
      .select('make, model, year, price')
      .eq('make', 'Toyota')
      .limit(3);

    const { data: hondaData, error: hondaError } = await supabase
      .from('curated_listings')
      .select('make, model, year, price')
      .eq('make', 'Honda')
      .limit(3);

    if (!toyotaError && toyotaData) {
      console.log('\n🚙 Sample Toyota records:');
      toyotaData.forEach((vehicle) => {
        console.log(`   - ${vehicle.year} ${vehicle.model} - $${vehicle.price.toLocaleString()}`);
      });
    }

    if (!hondaError && hondaData) {
      console.log('\n🚗 Sample Honda records:');
      hondaData.forEach((vehicle) => {
        console.log(`   - ${vehicle.year} ${vehicle.model} - $${vehicle.price.toLocaleString()}`);
      });
    }

    // Check priority score distribution
    const { data: highPriority, error: highError } = await supabase
      .from('curated_listings')
      .select('priority_score', { count: 'exact', head: true })
      .gte('priority_score', 85);

    const { data: mediumPriority, error: mediumError } = await supabase
      .from('curated_listings')
      .select('priority_score', { count: 'exact', head: true })
      .gte('priority_score', 60)
      .lt('priority_score', 85);

    const { data: lowPriority, error: lowError } = await supabase
      .from('curated_listings')
      .select('priority_score', { count: 'exact', head: true })
      .lt('priority_score', 60);

    if (!highError && !mediumError && !lowError) {
      console.log('\n⭐ Priority score distribution:');
      console.log(`   - High (85+): ${highPriority?.count || 0} vehicles`);
      console.log(`   - Medium (60-84): ${mediumPriority?.count || 0} vehicles`);
      console.log(`   - Low (<60): ${lowPriority?.count || 0} vehicles`);
    }

    console.log('\n✅ Data verification complete!');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Error verifying data:', errorMessage);
  }
}

/**
 * Main execution
 */
async function main() {
  console.clear();
  console.log('='.repeat(60));
  console.log('🌱 YOURTOYOTAPICKS DATABASE SEEDER');
  console.log('='.repeat(60));
  console.log(`📍 Database: ${supabaseUrl}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Test connection
    const { error: connectionError } = await supabase
      .from('curated_listings')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Failed to connect to database:', connectionError.message);
      process.exit(1);
    }

    console.log('✅ Database connection successful\n');

    // Check if data already exists
    const { count } = await supabase
      .from('curated_listings')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      console.log(`⚠️  Warning: Database already contains ${count} records`);
      console.log('   This script will add MORE records (duplicates may occur)\n');
    }

    // Seed the database
    const result = await seedDatabase();

    // Verify the data
    await verifyData();

    // Exit with appropriate code
    if (result.success) {
      console.log('\n🎉 Seeding completed successfully!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Seeding completed with errors\n');
      process.exit(1);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('\n❌ Fatal error:', errorMessage);
    process.exit(1);
  }
}

// Run the script
main();
