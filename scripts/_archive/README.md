# Archived Scripts

This directory contains one-time use scripts and outdated implementations that have been superseded.

## Directory Structure

### `setup/`
One-time database setup and migration scripts:
- `create-schema.ts` - Creates database schema (one-time use)
- `setup-database.ts` - Initial database setup (one-time use)
- `apply-migration.ts` - Applies schema migrations (one-time use)
- `fix-vins.ts` - VIN data cleanup script (one-time use)

**Current approach**: Database schema is managed via Supabase migrations in `supabase/migrations/`

### `testing/`
Old test scripts superseded by E2E tests:
- `test-adapter.ts` - Marketcheck adapter testing (manual)
- `test-query.ts` - Query testing (manual)
- `test-supabase-connection.ts` - Connection testing (manual)
- `test-marketcheck-queries.ts` - Marketcheck query testing (manual)
- `verify-import.ts` - Import verification (manual)
- `verify-table.ts` - Table verification (manual)

**Current approach**: Automated E2E tests in `tests/e2e/`

### `data-import/`
One-time data import scripts:
- `combine-marketcheck-data.ts` - Combines JSON data files (one-time use)
- `fetch-marketcheck-sample.ts` - Fetches sample data (one-time use)
- `import-marketcheck-data.ts` - Imports data to database (one-time use)

**Current approach**: Data is managed through Supabase and the Marketcheck adapter

### `seeding/`
Old seeding implementations:
- `seed-database.ts` - Old seeding script
- `seed-simple.ts` - Simplified seeding script
- `setup-and-seed.ts` - Combined setup and seed

**Current active script**: `../seed-supabase.ts` (use this for seeding)

## Current Active Scripts

For current, actively maintained scripts, see:
- `../seed-supabase.ts` - **Main seeding script** (use this)
- `../update-mock-images.ts` - Updates mock data images
- `../watch-and-test.ts` - Development test watcher
- `../README.md` - Scripts documentation

## Why These Were Archived

- **Setup scripts**: One-time database initialization, no longer needed
- **Testing scripts**: Manual test scripts replaced by automated E2E tests
- **Data import scripts**: One-time imports, data is now managed differently
- **Seeding scripts**: Multiple versions consolidated into `seed-supabase.ts`

## When to Use Archived Scripts

These scripts may be useful for:
- **Historical reference**: Understanding how the database was initially set up
- **Troubleshooting**: Diagnosing data import issues
- **Learning**: Examples of data transformation and database operations
- **Recovery**: Rare cases where manual intervention is needed

**Important**: Do not use these scripts in production or for regular development. They may rely on outdated database schemas or API patterns.

## Running Archived Scripts (if needed)

```bash
# From project root
npx tsx scripts/_archive/[category]/[script-name].ts
```

⚠️ **Warning**: Always review archived scripts before running them. They may modify your database or data files.

## Restoration

If you need to restore or reference the history of these files:
```bash
git log -- scripts/_archive/
```
