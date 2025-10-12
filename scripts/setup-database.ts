#!/usr/bin/env ts-node
/**
 * Supabase Database Setup Script
 *
 * This script creates the database schema by executing the SQL file
 * directly through the Supabase REST API.
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...\n');

  // Read the SQL schema file
  const sqlFilePath = path.join(__dirname, '../lib/database.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

  console.log('📄 Read database schema from:', sqlFilePath);
  console.log('📊 Schema size:', sqlContent.length, 'bytes\n');

  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log('📋 Found', statements.length, 'SQL statements to execute\n');

  // Note: Supabase doesn't expose a direct SQL execution endpoint via REST API
  // We need to use the Supabase client or PostgREST API

  console.log('⚠️  Cannot execute raw SQL via REST API');
  console.log('');
  console.log('Please run the SQL schema manually:');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/project/crehsfhbludetpafbnwe/sql/new');
  console.log('2. Copy the contents of: lib/database.sql');
  console.log('3. Paste into SQL Editor');
  console.log('4. Click "Run" (or press Cmd/Ctrl + Enter)');
  console.log('');
  console.log('Alternative: Use Supabase CLI');
  console.log('');
  console.log('  npm install -g supabase');
  console.log('  supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.crehsfhbludetpafbnwe.supabase.co:5432/postgres"');
  console.log('');
}

setupDatabase().catch(console.error);
