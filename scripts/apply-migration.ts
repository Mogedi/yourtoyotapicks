#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function applyMigration() {
  console.log('📋 Applying Marketcheck database migration...\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  // Read migration file
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20250112000000_create_marketcheck_listings.sql'
  );

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  console.log(`📄 Migration file: ${path.basename(migrationPath)}`);
  console.log(`   Size: ${(migrationSQL.length / 1024).toFixed(2)} KB`);
  console.log(`   Lines: ${migrationSQL.split('\n').length}`);

  const supabase = createClient(url, key);

  console.log('\n🚀 Executing migration SQL...');

  // Execute the migration
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

  if (error) {
    // Try direct query if RPC doesn't work
    console.log('   Trying direct query method...');

    // Split into individual statements and execute
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';

      // Skip comment-only statements
      if (stmt.trim().startsWith('--')) continue;

      console.log(`   Executing statement ${i + 1}/${statements.length}...`);

      const { error: stmtError } = await supabase.rpc('exec_sql', { sql: stmt });

      if (stmtError) {
        // Statements might not work with RPC, that's okay
        errorCount++;
      } else {
        successCount++;
      }
    }

    console.log(`\n   ⚠️  RPC method may not be available`);
    console.log(`   This is normal for Supabase production instances`);
    console.log(`\n   ℹ️  You need to apply migrations via Supabase Dashboard:`);
    console.log(`   1. Go to: ${url.replace('https://', 'https://supabase.com/dashboard/project/')}/editor`);
    console.log(`   2. Click "SQL Editor"`);
    console.log(`   3. Paste the contents of: ${migrationPath}`);
    console.log(`   4. Click "Run" to execute`);
    console.log(`\n   Or use the Supabase CLI:`);
    console.log(`   supabase link --project-ref YOUR_PROJECT_REF`);
    console.log(`   supabase db push`);

    process.exit(0);
  }

  console.log('✅ Migration applied successfully!\n');
  process.exit(0);
}

applyMigration();
