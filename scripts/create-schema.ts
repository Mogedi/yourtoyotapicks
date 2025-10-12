#!/usr/bin/env tsx
/**
 * Creates the database schema for YourToyotaPicks using Supabase REST API
 * This script executes the SQL from lib/database.sql
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = 'https://crehsfhbludetpafbnwe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWhzZmhibHVkZXRwYWZibndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNjczNDIsImV4cCI6MjA3NTg0MzM0Mn0.WO3XSdRELqYNgx3y8UdFblaygjXFSI-7aMDai7Bpw9E';

async function createSchema() {
  console.log('📋 Creating database schema...\n');

  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'lib', 'database.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Execute SQL using Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ query: sqlContent }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to create schema:', error);
      console.log('\n⚠️  The REST API method did not work.');
      console.log('   Please create the schema manually:');
      console.log('   1. Go to https://supabase.com/dashboard/project/crehsfhbludetpafbnwe/editor');
      console.log('   2. Click "SQL Editor"');
      console.log('   3. Copy and paste the contents of lib/database.sql');
      console.log('   4. Click "Run"\n');
      return false;
    }

    console.log('✅ Schema created successfully!');
    return true;
  } catch (err) {
    console.error('❌ Error:', err);
    console.log('\n⚠️  Automated schema creation failed.');
    console.log('   Please create the schema manually:');
    console.log('   1. Go to https://supabase.com/dashboard/project/crehsfhbludetpafbnwe/editor');
    console.log('   2. Click "SQL Editor"');
    console.log('   3. Copy and paste the contents of lib/database.sql');
    console.log('   4. Click "Run"\n');
    return false;
  }
}

createSchema();
