# Repository Organization Plan

## Overview
This document outlines the plan to organize the YourToyotaPicks repository by archiving outdated files and cleaning up the structure.

## Files to Archive

### 1. Outdated Documentation (`docs/_archive/`)

**Marketcheck Integration Docs** (superseded by MARKETCHECK_INTEGRATION_STATUS.md):
- `docs/features/MARKETCHECK_API_FINDINGS.md` → `docs/features/_archive/`
- `docs/features/MARKETCHECK_API_STRATEGY.md` → `docs/features/_archive/`
- `docs/features/MARKETCHECK_DATA_FIRST_SUMMARY.md` → `docs/features/_archive/`
- `docs/features/MARKETCHECK_IMPLEMENTATION_PLAN.md` → `docs/features/_archive/`
- `docs/features/MARKETCHECK_QUICK_START.md` → `docs/features/_archive/`
- `docs/features/MARKETCHECK_READY_TO_IMPORT.md` → `docs/features/_archive/`

**Old Feature Docs** (features completed):
- `docs/features/FEATURE_9_VEHICLE_DETAIL.md` → `docs/features/_archive/completed/`
- `docs/features/FEATURE_11_CRON_JOB.md` → `docs/features/_archive/planned/`
- `docs/features/FEATURE_12_EMAIL_NOTIFICATIONS.md` → `docs/features/_archive/planned/`
- `docs/features/FEATURE_12_SUMMARY.md` → `docs/features/_archive/planned/`

**Old Guide Docs**:
- `docs/guides/IMPLEMENTATION_PLAN.md` → `docs/guides/_archive/` (superseded by Dashboard V2 plan)

### 2. Outdated Components (`components/_archive/`)

**Example/Demo Files**:
- `components/VehicleCard.example.tsx` → `components/_archive/examples/`
- `components/VehicleCard.quickstart.tsx` → `components/_archive/examples/`
- `components/VehicleCard.README.md` → `components/_archive/examples/`
- `components/FEATURE7_SUMMARY.md` → `components/_archive/`

### 3. Old Scripts (`scripts/_archive/`)

**Database Setup Scripts** (one-time use, completed):
- `scripts/create-schema.ts` → `scripts/_archive/setup/`
- `scripts/setup-database.ts` → `scripts/_archive/setup/`
- `scripts/apply-migration.ts` → `scripts/_archive/setup/`
- `scripts/fix-vins.ts` → `scripts/_archive/setup/`

**Old Test Scripts**:
- `scripts/test-adapter.ts` → `scripts/_archive/testing/`
- `scripts/test-query.ts` → `scripts/_archive/testing/`
- `scripts/test-supabase-connection.ts` → `scripts/_archive/testing/`
- `scripts/test-marketcheck-queries.ts` → `scripts/_archive/testing/`
- `scripts/verify-import.ts` → `scripts/_archive/testing/`
- `scripts/verify-table.ts` → `scripts/_archive/testing/`

**Data Import Scripts** (one-time use):
- `scripts/combine-marketcheck-data.ts` → `scripts/_archive/data-import/`
- `scripts/fetch-marketcheck-sample.ts` → `scripts/_archive/data-import/`
- `scripts/import-marketcheck-data.ts` → `scripts/_archive/data-import/`

**Seed Scripts** (multiple versions, consolidate):
- `scripts/seed-database.ts` → `scripts/_archive/seeding/` (keep seed-supabase.ts as main)
- `scripts/seed-simple.ts` → `scripts/_archive/seeding/`
- `scripts/setup-and-seed.ts` → `scripts/_archive/seeding/`

### 4. Old Data Files (`data/_archive/`)

**Sample/Test Data**:
- `data/marketcheck-2025-10-12-1922.json` → `data/_archive/`
- `data/marketcheck-2025-10-12.json` → `data/_archive/`
- `data/marketcheck-sample.json` → `data/_archive/`

**Note**: Keep `data/marketcheck-combined.json` as it's the current dataset

### 5. Test Helper Examples (`tests/e2e/helpers/_archive/`)

**Example Files**:
- `tests/e2e/helpers/example-usage.ts` → `tests/e2e/helpers/_archive/`
- `tests/e2e/helpers/SUMMARY.md` → `tests/e2e/helpers/_archive/`

## Files to Keep (Active)

### Core Application Files
- `app/**/*.tsx` - All application pages and routes
- `components/CarImage.tsx` - Active image component
- `components/EmptyState.tsx` - Active UI component
- `components/FilterBar.tsx` - Active filter component
- `components/Header.tsx` - Active header component
- `components/ReviewSection.tsx` - Active review component
- `components/VehicleCard.tsx` - Active card component
- `components/VehicleDetail.tsx` - Active detail component
- `components/VehicleList.tsx` - Active list component
- `components/ui/**` - All UI components (shadcn/ui)

### Core Library Files
- `lib/car-images.ts` - Active image utilities
- `lib/filters.ts` - Active filter logic
- `lib/marketcheck-adapter.ts` - Active data adapter
- `lib/mock-data.ts` - Active mock data
- `lib/supabase.ts` - Active database client
- `lib/types.ts` - Active type definitions
- `lib/utils.ts` - Active utilities
- `lib/vin-decoder.ts` - Active VIN decoder
- `lib/email.ts` - Email service (planned feature)
- `lib/email-templates/**` - Email templates (planned feature)
- `lib/data-pipeline.ts` - Data pipeline (planned feature)
- `lib/claude-error-formatter.ts` - Error logging utility

### Active Scripts
- `scripts/seed-supabase.ts` - Main seeding script
- `scripts/update-mock-images.ts` - Image update utility
- `scripts/watch-and-test.ts` - Development utility
- `scripts/README.md` - Scripts documentation

### Active Documentation
- `docs/README.md` - Main docs index
- `docs/overview.md` - Project overview
- `docs/TECHNICAL_SPEC.md` - Technical specification
- `docs/CAR_IMAGES_IMPLEMENTATION.md` - Image system docs
- `docs/ERROR_CAPTURE_GUIDE.md` - Error capture guide
- `docs/ERROR_WATCH_SYSTEM.md` - Error watch system
- `docs/features/DASHBOARD_V2_IMPLEMENTATION_PLAN.md` - **NEW** Dashboard V2 plan
- `docs/features/MARKETCHECK_INTEGRATION_PLAN.md` - Comprehensive integration plan
- `docs/features/MARKETCHECK_INTEGRATION_STATUS.md` - Current status
- `docs/guides/MOCK_DATA_GUIDE.md` - Mock data guide
- `docs/setup/**` - All setup guides
- `docs/testing/**` - All testing documentation

### Active Tests
- `tests/e2e/flows/**` - All E2E test flows
- `tests/e2e/helpers/**` (except archived examples)
- `tests/e2e/run-all-tests.ts`
- `tests/e2e/run-tests.ts`
- `tests/e2e/report-generator.ts`
- `tests/QUICK_START.md`
- `tests/TEST_IMPLEMENTATION_SUMMARY.md`

## New Archive Folder Structure

```
docs/
├── features/
│   ├── _archive/
│   │   ├── README.md (explains archived docs)
│   │   ├── completed/ (features that are done)
│   │   ├── planned/ (features postponed)
│   │   └── iterations/ (old marketcheck iterations)
│   ├── DASHBOARD_V2_IMPLEMENTATION_PLAN.md ✓
│   ├── MARKETCHECK_INTEGRATION_PLAN.md ✓
│   └── MARKETCHECK_INTEGRATION_STATUS.md ✓

components/
├── _archive/
│   ├── README.md
│   └── examples/
├── dashboard/ (NEW - for Dashboard V2)
│   ├── shared/
│   ├── card-view/ (to be deprecated)
│   └── table-view/ (new)
└── [active components]

scripts/
├── _archive/
│   ├── README.md
│   ├── setup/
│   ├── testing/
│   ├── data-import/
│   └── seeding/
└── [active scripts]

data/
├── _archive/
│   └── README.md
└── marketcheck-combined.json ✓

tests/
└── e2e/
    └── helpers/
        ├── _archive/
        │   └── README.md
        └── [active helpers]
```

## Archive README Templates

### `docs/features/_archive/README.md`
```markdown
# Archived Feature Documentation

This directory contains outdated or superseded feature documentation.

## Iterations
- Old Marketcheck integration planning docs (superseded by MARKETCHECK_INTEGRATION_STATUS.md)

## Completed Features
- Features that have been implemented and documented elsewhere

## Planned Features
- Features that were planned but postponed or changed

**Note**: For current feature documentation, see the parent `features/` directory.
```

### `components/_archive/README.md`
```markdown
# Archived Components

This directory contains outdated components and examples.

## Examples
- Demo files and quickstart examples for learning purposes

**Note**: For current components, see the parent `components/` directory.
```

### `scripts/_archive/README.md`
```markdown
# Archived Scripts

This directory contains one-time use scripts and old implementations.

## Setup
- One-time database setup and migration scripts

## Testing
- Old test scripts superseded by E2E tests

## Data Import
- One-time data import scripts

## Seeding
- Old seeding implementations (use `seed-supabase.ts` instead)

**Note**: For current scripts, see the parent `scripts/` directory and `scripts/README.md`.
```

## Implementation Steps

1. **Create archive folders**:
   ```bash
   mkdir -p docs/features/_archive/{completed,planned,iterations}
   mkdir -p components/_archive/examples
   mkdir -p scripts/_archive/{setup,testing,data-import,seeding}
   mkdir -p data/_archive
   mkdir -p tests/e2e/helpers/_archive
   ```

2. **Create README files** in each `_archive/` folder

3. **Move files** using `git mv` to preserve history:
   ```bash
   git mv [old_path] [new_path]
   ```

4. **Update references** in active documentation

5. **Commit changes**:
   ```bash
   git add .
   git commit -m "chore: organize repository structure with archive folders"
   ```

## Benefits

1. ✅ **Cleaner structure**: Active files are easy to find
2. ✅ **Preserved history**: Old files are archived, not deleted
3. ✅ **Better navigation**: Clear separation of active vs archived
4. ✅ **Easy recovery**: Archived files can be restored if needed
5. ✅ **Documentation**: README files explain what's archived and why

## Post-Organization

After organizing:
- Update `docs/README.md` to reflect new structure
- Update `CLAUDE.md` to reference new file locations
- Update any scripts that reference moved files
- Run tests to ensure nothing broke
