# Scripts Directory

Utility scripts for the YourToyotaPicks project.

## Active Scripts

### `seed-supabase.ts`
**Status**: ✅ Active
**Purpose**: Main script for seeding the Supabase database with mock data
**Usage**: `npx tsx scripts/seed-supabase.ts`

Seeds the database with the curated vehicle listings from `data/marketcheck-combined.json`.

### `update-mock-images.ts`
**Status**: ✅ Active
**Purpose**: Updates mock data with real car images from IMAGIN.studio API
**Usage**: `npx tsx scripts/update-mock-images.ts`

Replaces placeholder image URLs with calls to `getCarImageGallery()`.

### `watch-and-test.ts`
**Status**: ✅ Active
**Purpose**: File watcher that runs E2E tests automatically on code changes
**Usage**: `npm run watch:errors`
**Documentation**: [ERROR_WATCH_SYSTEM.md](../docs/ERROR_WATCH_SYSTEM.md)

Watches for file changes in `app/`, `components/`, and `lib/` directories and automatically runs E2E tests. Writes errors to `.claude/errors.json` for Claude to analyze.

---

## Archived Scripts

Outdated and one-time use scripts have been moved to `_archive/` subdirectories:

### `_archive/setup/`
One-time database setup scripts:
- `create-schema.ts` - Database schema creation (superseded by Supabase migrations)
- `setup-database.ts` - Initial database setup
- `apply-migration.ts` - Schema migrations
- `fix-vins.ts` - VIN data cleanup (completed 2025-10-12)

### `_archive/testing/`
Manual test scripts (superseded by E2E tests):
- `test-adapter.ts` - Marketcheck adapter testing
- `test-query.ts` - Query testing
- `test-supabase-connection.ts` - Connection testing
- `test-marketcheck-queries.ts` - Marketcheck query testing
- `verify-import.ts` - Import verification
- `verify-table.ts` - Table verification

### `_archive/data-import/`
One-time data import scripts:
- `combine-marketcheck-data.ts` - Combines JSON data files
- `fetch-marketcheck-sample.ts` - Fetches sample data
- `import-marketcheck-data.ts` - Imports data to database

### `_archive/seeding/`
Old seeding implementations:
- `seed-database.ts` - Old seeding script
- `seed-simple.ts` - Simplified seeding script
- `setup-and-seed.ts` - Combined setup and seed

**See**: [`_archive/README.md`](_archive/README.md) for details on archived scripts.

---

## npm Script Mappings

These scripts are accessible via `npm run` commands:

```json
{
  "watch:errors": "npx tsx scripts/watch-and-test.ts",
  "test:ui": "npm run test:e2e",
  "test:e2e": "npx tsx tests/e2e/run-all-tests.ts",
  "test:e2e:01": "npx tsx tests/e2e/flows/01-landing-to-dashboard.test.ts",
  "test:e2e:02": "npx tsx tests/e2e/flows/02-dashboard-filtering.test.ts",
  "test:e2e:03": "npx tsx tests/e2e/flows/03-vehicle-details.test.ts"
}
```

---

## Adding New Scripts

When adding a new script:

1. Create the script file in `/scripts` (or appropriate subdirectory)
2. Add execute permissions if it's a shell script: `chmod +x scripts/your-script.sh`
3. Document it in this README
4. Add an npm script alias in `package.json` if it will be used frequently
5. Update relevant documentation in `/docs`

---

## Script Organization

- **Active scripts**: Root of `scripts/` directory
- **Archived scripts**: `scripts/_archive/` with subdirectories by category
- **Test scripts**: `tests/e2e/` directory
- **Build scripts**: Defined in `package.json`

---

## Notes

- **TypeScript scripts** (`*.ts`) are run with `npx tsx`
- **Shell scripts** (`*.sh`) need execute permissions
- **One-time scripts** should be moved to `_archive/` after completion
- **Active scripts** should be kept updated and documented
- **Archived scripts** are preserved for historical reference and recovery

---

## Related Documentation

- [Test Implementation Summary](../tests/TEST_IMPLEMENTATION_SUMMARY.md)
- [Error Watch System](../docs/ERROR_WATCH_SYSTEM.md)
- [Database Setup Guide](../docs/setup/DATABASE_SETUP.md)
- [Marketcheck Integration Status](../docs/features/MARKETCHECK_INTEGRATION_STATUS.md)
