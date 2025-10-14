# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YourToyotaPicks** is a personal automation tool for finding high-quality used Toyota and Honda vehicles. The project automates the manual car search process with intelligent filtering, VIN validation, and AI-assisted curation.

## 🎯 Core Mission & UX Principles

**CRITICAL**: This project is NOT a data table — it's a **trustworthy curator**.

### The 5-Second Clarity Rule

When a user lands on the dashboard, within 5 seconds they should:

1. **Know which cars are the top picks** for them personally
2. **Understand why each one ranks highly**
3. **Be able to compare or act** (contact, save, hide) without hunting through noise

### Foundational Principle: "Signal over noise"

Every UX decision must answer three questions at a glance:

| Question                                    | Visual Cue                                                         | Implementation                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **"Which cars are top-tier picks for me?"** | Sorted by `priority_score`, color-coded badges, "Top Match" labels | Priority score ≥80 = Green, 65-79 = Yellow, <65 = Gray/hidden                            |
| **"Why are they good?"**                    | AI-generated 2-line summary directly below or on hover             | Short, fact-grounded explanations: "✅ 1-owner • 📉 $1.8k below market • 🧰 Clean title" |
| **"How do they compare?"**                  | Quick stat chips (price vs median, miles vs median, owner count)   | Contextual comparison data, not just raw numbers                                         |

### Design Philosophy

- **Default sort**: ALWAYS by `priority_score` (descending)
- **Visual hierarchy**: Best cars should look special without looking like ads
  - 🟩 80+ "Top Pick" - Soft green border/glow or badge
  - 🟨 65-79 "Good Buy" - Neutral highlight
  - 🟥 <65 "Caution" - Muted, maybe folded away by default
- **Transparency**: Show priority score breakdowns on hover so users trust the algorithm
- **Progressive clarity**: Maximum clarity upfront, details on demand (use popovers/tooltips)

### When Building Features

✅ **ALWAYS ask**: Does this help users find their best match faster?
✅ **ALWAYS ask**: Does this reduce noise or add it?
✅ **ALWAYS ask**: Can users understand this in <5 seconds?

❌ **NEVER**: Add features that make the interface more complex without clear value
❌ **NEVER**: Show raw data without context (always add "vs median" comparisons)
❌ **NEVER**: Hide the priority score - it's the core value proposition

See [docs/ux/UX_PRINCIPLES.md](docs/ux/UX_PRINCIPLES.md) for detailed UX specifications.

### Current State

✅ **Production Ready** - Core features implemented:

- Dashboard with vehicle listing and filtering
- Vehicle detail pages with comprehensive information
- **Real car images** - IMAGIN.studio API integration (5 angles per vehicle)
- Smart image loading with automatic fallbacks
- User review system with ratings and notes
- Mock data system (32 curated listings with real images)
- Comprehensive E2E test suite (all passing ✅)
- Automated error detection system (`npm run watch:errors`)
- Responsive UI with Tailwind CSS + shadcn/ui
- **Case-insensitive VIN lookups** - Works with any VIN case
- **Supabase database** - ✅ CONNECTED to production instance
- **Database migrations** - Complete schema with seeding scripts

🚧 **Not Yet Implemented:**

- Automated data ingestion from listing APIs
- Cron job scheduling for daily updates
- Email notification system

## 🚨 Architecture Principles (CRITICAL)

**⚠️ READ THIS BEFORE MAKING ANY CHANGES ⚠️**

These principles were established after 5+ hours of debugging during the V2.0 refactor. Following them will save significant time.

### 1. Data/UI Layer Separation

**Rule**: Data layer = primitives only | UI layer = formatting only

```typescript
// ✅ GOOD: Data layer
export const Tier = { GOLD: 1, SILVER: 2, BRONZE: 3, STANDARD: 4 } as const;

// ❌ BAD: Data layer with UI
export const Tier = { GOLD: '🥇 Gold', SILVER: '🥈 Silver' };
```

**Why**: Keeps business logic testable, makes UI changes independent of data.

**See**: [docs/architecture/LAYER_SEPARATION_PRINCIPLES.md](docs/architecture/LAYER_SEPARATION_PRINCIPLES.md)

### 2. Test-First Discipline

**Rule**: ALWAYS run tests before making changes

```bash
# REQUIRED before ANY code changes
npm test && npm run test:e2e
```

**Why**: Tests catch bugs (like name collisions) faster than production scripts.

**See**: [docs/architecture/V2_MIGRATION_LESSONS.md](docs/architecture/V2_MIGRATION_LESSONS.md) - Bug #5

### 3. Database Design

**Rule**: Separate raw data from computed insights

- Raw data → `curated_listings` table
- Computed data → `vehicle_insights` table
- Join via → `vehicles_with_insights` view

**Why**: Can drop/recalculate insights without losing source data. Supports multiple algorithm versions.

**See**: [docs/architecture/DATABASE_DESIGN_PATTERNS.md](docs/architecture/DATABASE_DESIGN_PATTERNS.md)

### 4. Feature Addition

**Rule**: Follow the checklist, don't skip steps

1. ✅ Run tests first
2. ✅ Constants/enums → Types → Database → Services → UI
3. ✅ Test after each step

**Why**: Systematic approach prevents bugs and ensures nothing is missed.

**See**: [docs/development/FEATURE_ADDITION_CHECKLIST.md](docs/development/FEATURE_ADDITION_CHECKLIST.md)

### Quick Reference: Common Mistakes

| Mistake                  | Fix                                   | Time Cost |
| ------------------------ | ------------------------------------- | --------- |
| Mixed UI in data layer   | Move emojis/labels to `*-visuals.ts`  | 1 hour    |
| Used old `criteria_tier` | Use `tier_numeric` instead            | 1.5 hours |
| Name collision           | Alias imports (`as`)                  | 2 hours   |
| Forgot to run tests      | Run `npm test` before changes         | 2+ hours  |
| Wrong JSONB extraction   | Access `criteria_results?.verifiable` | 45 min    |

**For detailed examples of all bugs and fixes**: [docs/architecture/V2_MIGRATION_LESSONS.md](docs/architecture/V2_MIGRATION_LESSONS.md)

**Time Investment**: 30 minutes reading docs
**Time Saved**: 5-7+ hours per major refactor
**ROI**: Massive

## Architecture

### Current Tech Stack

- **Frontend**: Next.js 15.5.4 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Images**: IMAGIN.studio API (free, 5 angles per vehicle)
- **Backend**: Supabase (✅ CONNECTED to production database)
- **Testing**: Puppeteer E2E tests + automated error detection
- **Hosting**: Vercel-ready configuration

### Project Structure

```
/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Dashboard and vehicle details
│   └── api/               # API routes (cron, VIN check, etc.)
├── components/            # React components (organized by feature)
│   ├── ui/                # shadcn/ui primitives
│   ├── vehicle/           # Vehicle display components (VehicleCard, VehicleDetail, etc.)
│   ├── filters/           # Search and filter components (FilterBar, FilterSidebar, SearchBar)
│   ├── table/             # Table/grid components (TableHeader, TableRow, etc.)
│   ├── actions/           # Action menu components (ActionMenu, BulkActionBar)
│   ├── shared/            # Shared utility components (EmptyState, Pagination, etc.)
│   └── features/          # Feature-specific components (DashboardHeader, VehicleDataGrid)
├── lib/                   # Business logic (organized by domain)
│   ├── adapters/          # External API adapters (marketcheck-adapter.ts)
│   ├── database/          # Supabase client & SQL files
│   ├── email/             # Email system & templates (daily-digest, weekly-digest)
│   ├── utils/             # Utility functions (car-images, vin-decoder, filters)
│   ├── data/              # Mock data & data pipeline
│   ├── config/            # App configuration (constants, design-tokens)
│   ├── dev/               # Development tools (claude-error-formatter)
│   ├── api/               # API query functions
│   ├── services/          # Business logic services (filter, sort, pagination)
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Core utility functions
├── hooks/                 # Custom React hooks
├── tests/                 # E2E test suite
│   ├── playwright/        # Playwright tests (current)
│   ├── e2e/               # Puppeteer tests (legacy)
│   └── screenshots/       # Test screenshots
├── docs/                  # Documentation (well organized!)
│   ├── MVP_LAUNCH_ROADMAP.md  # Step-by-step launch guide
│   ├── setup/             # Setup guides
│   ├── architecture/      # Technical specs & data sources
│   ├── ux/                # UX principles and guidelines
│   ├── features/          # Feature documentation (Dashboard V2, car images, error detection)
│   ├── development/       # Development guides
│   ├── guides/            # How-to guides
│   ├── testing/           # Test documentation
│   └── _archive/          # Historical documentation
└── scripts/               # Build and test scripts
```

### Data Flow

```
User Request
  ↓
Next.js Page (Server Component)
  ↓
lib/supabase.ts (getListings/getListingByVin)
  ↓
Try: Supabase Query
  ↓ (on error)
Fallback: Mock Data (lib/mock-data.ts)
  ↓
Render: Component with data
```

## Key Features

### 1. Dashboard (`/dashboard`) - Curator Experience

**Primary Goal**: Users see their best matches first, with clear explanations why.

- **Priority-first display**: Sorted by `priority_score` by default (descending)
- **Color-coded quality tiers**:
  - 🟩 Top Picks (80+): Green badges/borders
  - 🟨 Good Buys (65-79): Yellow badges
  - 🟥 Caution (<65): Muted/collapsible
- **AI-generated summaries**: 2-line explanations per vehicle ("Why this is good")
- **Contextual comparisons**: Stats shown as comparisons (e.g., "$1.2k below median")
- **Real-time filtering** without losing priority sort
- **Progressive disclosure**: Core info visible, details on demand

### 2. Vehicle Detail Page (`/dashboard/[vin]`)

- Comprehensive vehicle information
- **5-angle image gallery** (side, 3/4, front, rear, interior)
- Interactive thumbnail navigation
- Smart image loading with fallbacks
- VIN decoding and specs
- Review system (star rating + notes)
- Mileage analysis
- Back navigation to dashboard

### 3. Filtering Criteria (Implemented)

**Auto-reject filters:**

- Price: $10K - $20K
- Mileage rating: excellent/good/acceptable
- Model Year: 2015+
- Title Status: Clean only
- Accidents: Zero only
- Owners: 1-2 max
- Brands: Toyota and Honda only

**Priority scoring algorithm** (transparent to users):

Weighted factors (100-point scale):

- **Title & accident history**: 25% (Clean title = +25)
- **Mileage vs year**: 20% (Below average for age = +15)
- **Price vs comps**: 20% (Below median = +10)
- **Distance (locality)**: 15% (Within 50 mi = +10)
- **Model demand**: 10% (RAV4/CR-V = +5)
- **Condition signals**: 10% (Maintena nce keywords = +3)

**Must be transparent**: Show score breakdown on hover/click so users trust the algorithm.

### 4. Mock Data System

32 curated test vehicles in `lib/mock-data.ts`:

- **Real car images** from IMAGIN.studio API (5 angles each)
- **Static unique VINs** for consistent navigation
- 12 excellent listings (pass all filters)
- 10 good listings (minor issues)
- 10 poor listings (fail multiple criteria)
- Realistic pricing, locations, and vehicle specs
- Used when Supabase is not configured

## Development Guidelines

### Adding New Features

1. **Check existing patterns** - Review similar components/pages first
2. **Use mock data** - Test without database dependency
3. **Add types** - Update `lib/types.ts` for new data structures
4. **Write tests** - Add E2E tests in `tests/e2e/flows/`
5. **Update docs** - Document in appropriate `docs/` subfolder

### Working with Database

Supabase is connected and ready to use. The app queries real data from the database and falls back to mock data only on error:

```typescript
// Example: Adding a new mock vehicle
// Edit lib/mock-data.ts
export const mockListings: VehicleInsert[] = [
  {
    vin: '5YFBURHE5HP690324',
    make: 'Toyota',
    model: 'RAV4',
    year: 2021,
    price: 26500,
    mileage: 28000,
    // ... full vehicle object
  },
];
```

### Database Integration

✅ **Supabase is connected and operational!**

Connection is configured in `lib/supabase.ts` and `.env.local`:

- Database URL: `https://crehsfhbludetpafbnwe.supabase.co`
- All environment variables are properly set
- Schema is defined in `supabase/migrations/`
- 88 vehicles currently in the database

To run migrations or scripts:

```bash
npm run recalculate-scores  # Recalculate all vehicle scores and tiers
```

### Testing

Run UI tests before committing:

```bash
# Start dev server
npm run dev

# Run all E2E tests (in another terminal)
npm run test:ui

# Run specific test
npm run test:ui:01  # Landing to dashboard
npm run test:ui:02  # Dashboard filtering
npm run test:ui:03  # Vehicle details
```

Tests automatically:

- Take screenshots
- Verify functionality
- Check for console errors
- Validate navigation

## Important Notes

### Current Limitations

1. **No authentication** - Single user assumed
2. **No cron jobs** - Manual refresh only
3. **No email** - Notifications not implemented

### Supabase Integration Status

- ✅ Client configured and CONNECTED
- ✅ Query functions written and working
- ✅ Schema designed with migrations
- ✅ Database seeding scripts created
- ✅ Connected to production instance: https://crehsfhbludetpafbnwe.supabase.co
- ✅ 88 vehicles currently in database

### Console Errors Handled

✅ **Fixed**: Supabase connection errors are now silently handled

- No console errors appear in browser
- App gracefully falls back to mock data
- Tests pass with zero console errors

### Image System

✅ **Implemented**: Real car images from IMAGIN.studio API

- Free, no API key required
- 5 angles per vehicle (side, 3/4, front, rear, interior)
- Automatic loading states and fallbacks
- Works offline (shows placeholder)

See [docs/features/CAR_IMAGES_IMPLEMENTATION.md](docs/features/CAR_IMAGES_IMPLEMENTATION.md) for details.

### Error Detection System

✅ **Implemented**: Automated error capture for development

- `npm run watch:errors` - Auto-run tests on file changes
- `/fix-errors` - Claude analyzes and fixes errors automatically
- All errors logged to `.claude/errors.json`

See [docs/features/ERROR_WATCH_SYSTEM.md](docs/features/ERROR_WATCH_SYSTEM.md) and [docs/features/ERROR_CAPTURE_GUIDE.md](docs/features/ERROR_CAPTURE_GUIDE.md).

## Documentation Index

Detailed documentation in `/docs`:

- **Learnings**: [docs/learnings/](docs/learnings/README.md) - Consolidated best practices and lessons learned
  - [Testing Best Practices](docs/learnings/TESTING_BEST_PRACTICES.md) - Test-first workflow, E2E patterns
- **Architecture**: [Technical Specification](docs/architecture/TECHNICAL_SPECIFICATION.md), [Data Sources](docs/architecture/DATA_SOURCES.md)
  - [Layer Separation Principles](docs/architecture/LAYER_SEPARATION_PRINCIPLES.md) - Data vs UI rules
  - [V2 Migration Lessons](docs/architecture/V2_MIGRATION_LESSONS.md) - Bugs and fixes from V2.0 refactor
  - [Database Design Patterns](docs/architecture/DATABASE_DESIGN_PATTERNS.md) - DB patterns and migrations
- **UX Principles**: [UX_PRINCIPLES.md](docs/ux/UX_PRINCIPLES.md) - Core design philosophy
- **Features**: [Dashboard V2](docs/features/DASHBOARD_V2.md), [Car Images](docs/features/CAR_IMAGES_IMPLEMENTATION.md), [Error Detection](docs/features/ERROR_WATCH_SYSTEM.md)
- **Development**: [Tools Setup](docs/development/DEVELOPMENT_TOOLS_SETUP.md), [Feature Addition Checklist](docs/development/FEATURE_ADDITION_CHECKLIST.md)
- **Setup Guides**: Database, deployment, email config

See [docs/README.md](docs/README.md) or [docs/learnings/README.md](docs/learnings/README.md) for full index.

## Future Enhancements

**Phase 2 (Database Integration):**

- Connect Supabase
- Seed with real data
- Implement cron jobs

**Phase 3 (Automation):**

- API integration (Marketcheck/Auto.dev)
- Daily vehicle ingestion
- Email notifications
- VIN history checks (VinAudit)

**Phase 4 (SaaS Expansion):**

- Multi-region support
- User authentication
- Subscription tiers
- Dealer partnerships

## Quick Commands

```bash
# Development
npm run dev              # Start dev server (port 3001)

# Testing
npm run test:ui          # Run all E2E tests
npm run test:ui:01       # Test landing → dashboard
npm run test:ui:02       # Test dashboard filtering
npm run test:ui:03       # Test vehicle details

# Build
npm run build            # Production build
npm run start            # Start production server

# Deployment
vercel                   # Deploy to Vercel
```

## Getting Help

- **Start Here**: [docs/learnings/README.md](docs/learnings/README.md) - Quick reference by task
- **Setup Issues**: See [docs/setup/QUICK_START.md](docs/setup/QUICK_START.md)
- **Testing Best Practices**: See [docs/learnings/TESTING_BEST_PRACTICES.md](docs/learnings/TESTING_BEST_PRACTICES.md)
- **Feature Questions**: See [docs/features/](docs/features/)
- **Technical Spec**: See [docs/architecture/TECHNICAL_SPECIFICATION.md](docs/architecture/TECHNICAL_SPECIFICATION.md)
- **UX Questions**: See [docs/ux/UX_PRINCIPLES.md](docs/ux/UX_PRINCIPLES.md)

---

## 📁 Documentation Policy

**CRITICAL RULE**: All documentation files MUST be created in `docs/`, NEVER in root directory.

### Root Directory Policy

- ✅ **ONLY** `README.md` and `CLAUDE.md` belong in root
- ❌ **NEVER** create temporary status files in root (e.g., `DATABASE_STATUS.md`)
- ❌ **NEVER** create investigation/debug files in root (e.g., `FILTER_INVESTIGATION.md`)
- ❌ **NEVER** create planning files in root (e.g., `MIGRATION_INSTRUCTIONS.md`)
- ❌ **NEVER** create implementation summaries in root (e.g., `FILTER_FIX_SUMMARY.md`)

### Where to Create Documentation

| Type                   | Location             | Examples                                            |
| ---------------------- | -------------------- | --------------------------------------------------- |
| **Planning docs**      | `docs/development/`  | Feature plans, implementation guides                |
| **Bug investigations** | `docs/development/`  | Issue analysis, root cause investigations           |
| **Fix summaries**      | `docs/development/`  | Bug fixes, problem resolutions                      |
| **Status updates**     | `docs/development/`  | Database status, migration status                   |
| **Learning docs**      | `docs/learnings/`    | Best practices, lessons learned, testing strategies |
| **Architecture docs**  | `docs/architecture/` | Technical specs, design patterns                    |
| **Setup guides**       | `docs/setup/`        | Installation, deployment, configuration             |
| **Feature docs**       | `docs/features/`     | Feature implementation details                      |
| **UX docs**            | `docs/ux/`           | Design principles, user experience guidelines       |

### Documentation Workflow

When creating ANY new markdown file:

1. **Determine category** - Is it planning, learning, architecture, setup, feature, or UX?
2. **Create in appropriate `docs/` subfolder** - Never in root
3. **Update index if significant** - Add entry to `docs/README.md` if it's a major document
4. **Cross-reference in learnings** - Update `docs/learnings/README.md` if it contains reusable lessons

### Examples

✅ **GOOD**:

```bash
# Planning a new feature
docs/development/FEATURE_PLAN_NOTIFICATIONS.md

# Investigating a bug
docs/development/BUG_INVESTIGATION_SLOW_QUERIES.md

# Documenting a fix
docs/development/FIX_SUMMARY_DATABASE_MIGRATION.md

# Recording lessons learned
docs/learnings/PAGINATION_BEST_PRACTICES.md
```

❌ **BAD**:

```bash
# Don't create in root!
DATABASE_STATUS.md
MIGRATION_INSTRUCTIONS.md
FILTER_FIX_SUMMARY.md
SCORING_SYSTEM.md
```

### Benefits

1. **Clean root** - Only 2 essential files, easy to navigate
2. **No cleanup needed** - All docs already organized
3. **Better discoverability** - Everything indexed in `docs/README.md`
4. **Git history** - Focused on code changes, not scattered docs
5. **Maintainability** - Easy to find and update related docs
