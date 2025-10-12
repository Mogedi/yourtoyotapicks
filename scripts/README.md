# Scripts Directory

Utility scripts for the YourToyotaPicks project.

## Active Scripts

### `watch-and-test.ts`
**Status**: ✅ Active
**Purpose**: File watcher that runs E2E tests automatically on code changes
**Usage**: `npm run watch:errors`
**Documentation**: [ERROR_WATCH_SYSTEM.md](../docs/ERROR_WATCH_SYSTEM.md)

Watches for file changes in `app/`, `components/`, and `lib/` directories and automatically runs E2E tests. Writes errors to `.claude/errors.json` for Claude to analyze.

### `run-ui-tests.sh`
**Status**: ✅ Active
**Purpose**: Run all UI/E2E tests
**Usage**: `npm run test:ui`

Bash script that runs the complete E2E test suite using Puppeteer.

---

## One-Time Setup Scripts

### `fix-vins.ts`
**Status**: ✅ Completed (one-time use)
**Purpose**: Replaced random VIN generation with static unique VINs
**Last Run**: 2025-10-12

This script was used to fix the React key duplication issue by replacing all `generateVIN()` calls with static unique VINs. The mock data now has 32 vehicles with unique, static VINs.

**Note**: Do not run again unless you need to regenerate all VINs.

### `update-mock-images.ts`
**Status**: ✅ Completed (one-time use)
**Purpose**: Updated all mock data entries to use real car images from IMAGIN.studio API
**Last Run**: 2025-10-12

This script replaced placeholder image URLs with calls to `getCarImageGallery()` which generates URLs for IMAGIN.studio's free car image API.

**Note**: Do not run again unless you need to regenerate all image URLs.

---

## Database Scripts (Not Yet Used)

### `seed-database.sh`
**Status**: ⏸️ Pending
**Purpose**: Seed Supabase database with initial data
**Usage**: `./scripts/seed-database.sh`

Will be used when Supabase database is configured. Currently, the app uses mock data.

---

## Testing Scripts (Not Yet Used)

### `test-cron.sh`
**Status**: ⏸️ Pending
**Purpose**: Test cron job functionality

Placeholder for future cron job testing.

### `test-email.js`
**Status**: ⏸️ Pending
**Purpose**: Test email notification system

Placeholder for future email notification testing.

---

## npm Script Mappings

These scripts are accessible via `npm run` commands:

```json
{
  "watch:errors": "ts-node watch-and-test.ts",
  "test:ui": "./run-ui-tests.sh",
  "test:e2e": "ts-node run-all-tests.ts"
}
```

---

## Adding New Scripts

When adding a new script:

1. Create the script file in `/scripts`
2. Add execute permissions if it's a shell script: `chmod +x scripts/your-script.sh`
3. Document it in this README
4. Add an npm script alias in `package.json` if it will be used frequently
5. Update relevant documentation in `/docs`

---

## Notes

- **TypeScript scripts** (`*.ts`) are run with `ts-node` or `npx ts-node`
- **Shell scripts** (`*.sh`) need execute permissions
- **One-time scripts** should be marked as completed with a date
- **Active scripts** should be kept updated and documented
