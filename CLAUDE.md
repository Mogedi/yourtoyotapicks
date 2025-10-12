# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YourToyotaPicks** is a personal automation tool for finding high-quality used Toyota and Honda vehicles. The project automates the manual car search process with intelligent filtering, VIN validation, and a review system.

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

🚧 **Not Yet Implemented:**
- Supabase database integration (currently uses mock data)
- Automated data ingestion from listing APIs
- Cron job scheduling for daily updates
- Email notification system

## Architecture

### Current Tech Stack

- **Frontend**: Next.js 15.5.4 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Images**: IMAGIN.studio API (free, 5 angles per vehicle)
- **Backend**: Supabase (configured but not connected - uses mock data fallback)
- **Testing**: Puppeteer E2E tests + automated error detection
- **Hosting**: Vercel-ready configuration

### Project Structure

```
/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   └── dashboard/         # Dashboard and vehicle details
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── FilterBar.tsx     # Vehicle filtering
│   ├── VehicleCard.tsx   # Vehicle card display (with real images)
│   ├── VehicleList.tsx   # Vehicle grid layout
│   ├── VehicleDetail.tsx # Vehicle detail view (5-angle gallery)
│   └── CarImage.tsx      # Smart image component with fallbacks
├── lib/                   # Utilities and business logic
│   ├── supabase.ts       # Database client & queries
│   ├── mock-data.ts      # Mock vehicle data (32 listings with real images)
│   ├── car-images.ts     # IMAGIN.studio API integration
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Utility functions
│   └── claude-error-formatter.ts  # Error logging for automated fixes
├── tests/                 # E2E test suite
│   ├── e2e/              # Puppeteer tests
│   └── screenshots/      # Test screenshots
├── docs/                  # Documentation (organized)
│   ├── setup/            # Setup guides
│   ├── features/         # Feature documentation
│   ├── guides/           # How-to guides
│   └── testing/          # Test documentation
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

### 1. Dashboard (`/dashboard`)
- Grid of vehicle cards with images and key stats
- Real-time filtering by:
  - Make (Toyota/Honda)
  - Model (RAV4, CR-V, etc.)
  - Price range
  - Mileage rating
  - Review status
- Sorting by priority score, price, mileage, date

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

**Priority scoring factors:**
- Low mileage for age
- Single owner
- Clean history
- Non-rust belt origin
- RAV4/CR-V models (highest priority)

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

### Working with Mock Data

Mock data is the primary development mode since Supabase isn't configured:

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

### Database Integration (When Ready)

Supabase client is configured in `lib/supabase.ts`:

```typescript
// Set these in .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

Schema is defined in `docs/setup/DATABASE_SETUP.md`.

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

1. **No live data** - Uses mock data only
2. **No authentication** - Single user assumed
3. **No cron jobs** - Manual refresh only
4. **No email** - Notifications not implemented

### Supabase Integration Status

- ✅ Client configured
- ✅ Query functions written
- ✅ Schema designed
- ❌ Database not created
- ❌ Not connected to live instance

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

See [docs/CAR_IMAGES_IMPLEMENTATION.md](docs/CAR_IMAGES_IMPLEMENTATION.md) for details.

### Error Detection System

✅ **Implemented**: Automated error capture for development
- `npm run watch:errors` - Auto-run tests on file changes
- `/fix-errors` - Claude analyzes and fixes errors automatically
- All errors logged to `.claude/errors.json`

See [docs/ERROR_WATCH_SYSTEM.md](docs/ERROR_WATCH_SYSTEM.md) and [docs/ERROR_CAPTURE_GUIDE.md](docs/ERROR_CAPTURE_GUIDE.md).

## Documentation Index

Detailed documentation in `/docs`:

- **Setup Guides**: Database, deployment, email config
- **Features**: Implementation details for each feature
- **Testing**: E2E test plans and results
- **Guides**: Mock data guide, implementation plan
- **Car Images**: [CAR_IMAGES_IMPLEMENTATION.md](docs/CAR_IMAGES_IMPLEMENTATION.md) - Complete image system docs
- **Error Handling**:
  - [ERROR_WATCH_SYSTEM.md](docs/ERROR_WATCH_SYSTEM.md) - Automated error detection
  - [ERROR_CAPTURE_GUIDE.md](docs/ERROR_CAPTURE_GUIDE.md) - How to capture all error types

See [docs/README.md](docs/README.md) for full index.

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

- **Setup Issues**: See [docs/setup/QUICK_START.md](docs/setup/QUICK_START.md)
- **Testing Issues**: See [docs/testing/UI_TESTING_README.md](docs/testing/UI_TESTING_README.md)
- **Feature Questions**: See [docs/features/](docs/features/)
- **Technical Spec**: See [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md)
