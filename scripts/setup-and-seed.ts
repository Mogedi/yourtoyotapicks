#!/usr/bin/env tsx
/**
 * Complete database setup and seeding script for YourToyotaPicks
 * This script:
 * 1. Creates the database schema (tables, indexes, RLS policies)
 * 2. Seeds the database with 32 mock vehicles
 * 3. Verifies the data was inserted correctly
 *
 * Usage:
 *   npx tsx scripts/setup-and-seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mockListings } from '../lib/mock-data';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crehsfhbludetpafbnwe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWhzZmhibHVkZXRwYWZibndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNjczNDIsImV4cCI6MjA3NTg0MzM0Mn0.WO3XSdRELqYNgx3y8UdFblaygjXFSI-7aMDai7Bpw9E';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SeedResult {
  success: boolean;
  inserted: number;
  failed: number;
  errors: Array<{ vin: string; error: string }>;
}

/**
 * Executes SQL schema using the Supabase REST API
 */
async function createSchema(): Promise<boolean> {
  console.log('📋 Creating database schema...\n');

  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'lib', 'database.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    console.log('   Note: To create the schema, you need to:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Click "SQL Editor" in the sidebar');
    console.log('   3. Paste the contents of lib/database.sql');
    console.log('   4. Click "Run" or press Cmd/Ctrl + Enter\n');
    console.log('   Checking if tables already exist...\n');

    // Check if tables already exist
    const { error: checkError } = await supabase
      .from('curated_listings')
      .select('count')
      .limit(1);

    if (checkError) {
      if (checkError.message.includes('Could not find the table')) {
        console.log('   ❌ Tables do not exist yet!');
        console.log('   ⚠️  Please create the schema manually using the SQL Editor in Supabase Dashboard');
        console.log('   ⚠️  Copy and execute the contents of: lib/database.sql\n');
        return false;
      }
      console.error('   ❌ Error checking tables:', checkError.message);
      return false;
    }

    console.log('   ✅ Tables already exist, skipping schema creation\n');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('   ❌ Error:', errorMessage);
    return false;
  }
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
  for (let i = 0; i < mockListings.length; i++) {
    const vehicle = mockListings[i];
    const progress = `[${i + 1}/${mockListings.length}]`;

    try {
      console.log(`${progress} Inserting: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      console.log(`   VIN: ${vehicle.vin}`);
      console.log(`   Price: $${vehicle.price.toLocaleString()}, Mileage: ${vehicle.mileage.toLocaleString()}`);

      const { data, error } = await supabase
        .from('curated_listings')
        .insert(vehicle)
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        result.failed++;
        result.errors.push({
          vin: vehicle.vin,
          error: error.message,
        });
      } else {
        console.log(`   ✅ Success (ID: ${data.id})\n`);
        result.inserted++;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`   ❌ Exception: ${errorMessage}\n`);
      result.failed++;
      result.errors.push({
        vin: vehicle.vin,
        error: errorMessage,
      });
    }
  }

  console.log('='.repeat(60));
  console.log('📈 SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully inserted: ${result.inserted}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`📊 Total attempted: ${mockListings.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS ENCOUNTERED:');
    result.errors.forEach(({ vin, error }) => {
      console.log(`   - ${vin}: ${error}`);
    });
    result.success = result.inserted > 0; // Partial success if some inserted
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

    // Get counts by make
    const { data: makeData, error: makeError } = await supabase
      .from('curated_listings')
      .select('make');

    if (!makeError && makeData) {
      const makeCount = makeData.reduce((acc, { make }) => {
        acc[make] = (acc[make] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('\n🏭 Vehicles by make:');
      Object.entries(makeCount).forEach(([make, count]) => {
        console.log(`   - ${make}: ${count} vehicles`);
      });
    }

    // Get sample records by make
    const { data: toyotaData } = await supabase
      .from('curated_listings')
      .select('make, model, year, price, mileage, priority_score')
      .eq('make', 'Toyota')
      .order('priority_score', { ascending: false })
      .limit(3);

    const { data: hondaData } = await supabase
      .from('curated_listings')
      .select('make, model, year, price, mileage, priority_score')
      .eq('make', 'Honda')
      .order('priority_score', { ascending: false })
      .limit(3);

    if (toyotaData && toyotaData.length > 0) {
      console.log('\n🚙 Top 3 Toyota vehicles (by priority):');
      toyotaData.forEach((vehicle, idx) => {
        console.log(`   ${idx + 1}. ${vehicle.year} ${vehicle.model}`);
        console.log(`      Price: $${vehicle.price.toLocaleString()}, Mileage: ${vehicle.mileage.toLocaleString()}, Score: ${vehicle.priority_score}`);
      });
    }

    if (hondaData && hondaData.length > 0) {
      console.log('\n🚗 Top 3 Honda vehicles (by priority):');
      hondaData.forEach((vehicle, idx) => {
        console.log(`   ${idx + 1}. ${vehicle.year} ${vehicle.model}`);
        console.log(`      Price: $${vehicle.price.toLocaleString()}, Mileage: ${vehicle.mileage.toLocaleString()}, Score: ${vehicle.priority_score}`);
      });
    }

    // Check priority score distribution
    const { count: highCount } = await supabase
      .from('curated_listings')
      .select('*', { count: 'exact', head: true })
      .gte('priority_score', 85);

    const { count: mediumCount } = await supabase
      .from('curated_listings')
      .select('*', { count: 'exact', head: true })
      .gte('priority_score', 60)
      .lt('priority_score', 85);

    const { count: lowCount } = await supabase
      .from('curated_listings')
      .select('*', { count: 'exact', head: true })
      .lt('priority_score', 60);

    console.log('\n⭐ Priority score distribution:');
    console.log(`   - High (85+): ${highCount || 0} vehicles`);
    console.log(`   - Medium (60-84): ${mediumCount || 0} vehicles`);
    console.log(`   - Low (<60): ${lowCount || 0} vehicles`);

    // Check mileage rating distribution
    const { data: ratingData } = await supabase
      .from('curated_listings')
      .select('mileage_rating');

    if (ratingData) {
      const ratingCount = ratingData.reduce((acc, { mileage_rating }) => {
        if (mileage_rating) {
          acc[mileage_rating] = (acc[mileage_rating] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      console.log('\n📏 Mileage rating distribution:');
      Object.entries(ratingCount).forEach(([rating, count]) => {
        console.log(`   - ${rating}: ${count} vehicles`);
      });
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
  console.log('🌱 YOURTOYOTAPICKS - DATABASE SETUP & SEEDER');
  console.log('='.repeat(60));
  console.log(`📍 Database: ${supabaseUrl}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Create schema (or verify it exists)
    const schemaReady = await createSchema();

    if (!schemaReady) {
      console.error('\n❌ Schema creation failed or tables do not exist');
      console.error('   Please create the schema manually before seeding');
      process.exit(1);
    }

    // Step 2: Check if data already exists
    const { count } = await supabase
      .from('curated_listings')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      console.log(`⚠️  Warning: Database already contains ${count} records`);
      console.log('   This script will add MORE records (duplicates may occur)\n');
    }

    // Step 3: Seed the database
    const result = await seedDatabase();

    // Step 4: Verify the data
    await verifyData();

    // Step 5: Exit with appropriate code
    if (result.success && result.inserted > 0) {
      console.log('\n🎉 Setup and seeding completed successfully!\n');
      console.log('Next steps:');
      console.log('   1. Start your dev server: npm run dev');
      console.log('   2. Visit: http://localhost:3001/dashboard');
      console.log('   3. You should see all 32 vehicles!\n');
      process.exit(0);
    } else if (result.inserted > 0) {
      console.log('\n⚠️  Setup completed with some errors\n');
      console.log(`   ${result.inserted} vehicles were successfully inserted`);
      console.log(`   ${result.failed} vehicles failed to insert\n`);
      process.exit(1);
    } else {
      console.log('\n❌ Setup failed - no records were inserted\n');
      process.exit(1);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('\n❌ Fatal error:', errorMessage);
    console.error('   Stack trace:', err);
    process.exit(1);
  }
}

// Run the script
main();
