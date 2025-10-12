# Marketcheck API Implementation Plan

## Overview

This document outlines the complete implementation plan for integrating Marketcheck API into YourToyotaPicks using a **data-first approach**. We'll make 1 API call, save the raw response to a file, analyze the actual data structure, then create a database schema that matches the real data exactly.

---

## 🎯 Strategy: Data-First Approach

Instead of building the database schema first, we'll:

1. ✅ **Make 1 API call** - Get real data (50 cars max)
2. ✅ **Save to JSON file** - Store locally for analysis
3. ✅ **Inspect actual structure** - See what fields/values are actually returned
4. ✅ **Build database from data** - Create schema matching real response
5. ✅ **Import from file** - Load data without burning API quota

---

## 📋 Implementation Checklist

### Phase 1: Capture Real Data ✅

- [ ] **Task 1.1:** Create simple fetch script
  - File: `scripts/fetch-marketcheck-sample.ts`
  - Make 1 API call with optimal parameters
  - Handle errors gracefully
  - Log progress to console

- [ ] **Task 1.2:** Save response to JSON file
  - File: `data/marketcheck-sample.json`
  - Save complete API response
  - Pretty-print for readability
  - Add to `.gitignore`

- [ ] **Task 1.3:** Run fetch script and inspect data
  - Command: `npx tsx scripts/fetch-marketcheck-sample.ts`
  - Verify 50 cars returned
  - Review actual field names and data types
  - Note which fields are null/missing

---

### Phase 2: Database Design from Real Data ✅

- [ ] **Task 2.1:** Analyze JSON structure
  - Review `data/marketcheck-sample.json`
  - List all fields present in response
  - Identify data types for each field
  - Note nullable vs required fields
  - Map nested objects (dealer, build, media)

- [ ] **Task 2.2:** Create Supabase migration
  - File: `supabase/migrations/20250112_create_marketcheck_listings.sql`
  - Create `marketcheck_listings` table
  - Use exact field names from API
  - Set correct data types (TEXT, INTEGER, DECIMAL, BOOLEAN, TIMESTAMP, JSONB)
  - Add indexes for performance
  - Add `updated_at` trigger

- [ ] **Task 2.3:** Test migration locally
  - Command: `supabase db reset`
  - Verify table created
  - Check column types correct
  - Verify indexes exist

---

### Phase 3: Data Import ✅

- [ ] **Task 3.1:** Create import script
  - File: `scripts/import-marketcheck-data.ts`
  - Read `data/marketcheck-sample.json`
  - Map API response to database schema
  - Handle nested objects (flatten or store as JSONB)
  - Parse Unix timestamps to PostgreSQL timestamps
  - Insert using batch upsert (on conflict: VIN)

- [ ] **Task 3.2:** Run import and verify
  - Command: `npx tsx scripts/import-marketcheck-data.ts`
  - Check records inserted successfully
  - Query database to verify data
  - Compare values to JSON file
  - Check for missing/null fields

- [ ] **Task 3.3:** Create TypeScript types from schema
  - File: `lib/types.ts`
  - Define `MarketCheckListing` interface
  - Match database column names exactly
  - Use correct TypeScript types

---

### Phase 4: Production API Client ✅

- [ ] **Task 4.1:** Build reusable Marketcheck API client
  - File: `lib/marketcheck.ts`
  - Function: `searchMarketcheck(params)` - Customizable search
  - Function: `saveListingsToDatabase(listings)` - Save to DB
  - Add default parameters
  - Add error handling and retries
  - Add API usage tracking

- [ ] **Task 4.2:** Create configuration presets
  - File: `scripts/marketcheck-config.ts`
  - Define search presets (Atlanta, Athens, etc.)
  - Define default parameters
  - Make easily customizable

- [ ] **Task 4.3:** Add NPM scripts
  - `npm run fetch:marketcheck` - Fetch and save to DB
  - `npm run fetch:marketcheck:sample` - Fetch to file only
  - Add scripts to `package.json`

---

### Phase 5: Dashboard Integration ✅

- [ ] **Task 5.1:** Update Supabase queries
  - File: `lib/supabase.ts`
  - Function: `getMarketCheckListings()` - Get all with filters
  - Function: `getMarketCheckListingByVin(vin)` - Get single car
  - Add priority score calculation
  - Add quality filters

- [ ] **Task 5.2:** Connect dashboard to Marketcheck data
  - File: `app/dashboard/page.tsx`
  - Query Marketcheck table instead of mock data
  - Keep mock data as fallback
  - Add "Data Source: Live" indicator
  - Test filters work with real data

- [ ] **Task 5.3:** Update vehicle detail page
  - File: `app/dashboard/[vin]/page.tsx`
  - Query Marketcheck data by VIN
  - Display all captured fields
  - Show price history if available
  - Use IMAGIN.studio for images (fallback if no photo_links)

---

### Phase 6: Testing & Validation ✅

- [ ] **Task 6.1:** Manual QA
  - Dashboard displays 50 real cars
  - Filters work correctly
  - Vehicle detail page loads
  - All fields display properly
  - Images load (IMAGIN.studio fallback)

- [ ] **Task 6.2:** Update E2E tests
  - File: `tests/e2e/flows/02-dashboard-filtering.test.ts`
  - Update to work with real data
  - Test filters with Marketcheck data
  - Verify priority scoring

- [ ] **Task 6.3:** Data quality checks
  - All 50 records in database
  - No missing VINs
  - Prices are reasonable ($10K-$20K)
  - Makes are Toyota/Honda
  - Years are 2015-2023

---

### Phase 7: Documentation ✅

- [ ] **Task 7.1:** Document database schema
  - File: `docs/setup/MARKETCHECK_DATABASE.md`
  - Table structure with all columns
  - Data types and constraints
  - Index strategy
  - Sample queries

- [ ] **Task 7.2:** Document API integration
  - File: `docs/features/MARKETCHECK_API_INTEGRATION.md`
  - How to get API key
  - How to run fetch script
  - How to customize parameters
  - How to refresh data

- [ ] **Task 7.3:** Update CLAUDE.md
  - Mark Marketcheck integration as complete
  - Update tech stack
  - Update data flow diagram
  - Remove "not yet implemented" note

- [ ] **Task 7.4:** Update README.md
  - Add Marketcheck to features list
  - Add API key to `.env.example`
  - Update setup instructions

---

## 🔧 Search Parameters for Initial Fetch

```javascript
{
  // API Key
  api_key: process.env.MARKETCHECK_API_KEY,

  // Vehicle filters (maximize quality)
  make: "Toyota,Honda",
  model: "RAV4,CR-V,Camry,Accord,Highlander,Pilot",
  year_range: "2015-2023",
  price_range: "10000-20000",
  miles_range: "0-100000",

  // Quality filters (pre-filter in API)
  carfax_clean_title: true,      // Only clean titles
  carfax_1_owner: false,          // Get all owners, filter later
  car_type: "used",

  // Location (Atlanta metro)
  zip: "30301",
  radius: 100,
  country: "us",

  // Pagination (MAXIMUM data per call)
  rows: 50,                       // API maximum
  start: 0,

  // Sorting (newest listings first)
  sort_by: "dom_active",
  sort_order: "asc",

  // Exclude unnecessary data (optimize response)
  include_finance: false,
  include_lease: false
}
```

---

## 📊 Expected Data Fields (Will Confirm from Real API Response)

### 🔴 Core Fields (Must Have)

**Identity:**
- `id` - Marketcheck listing ID
- `vin` - Vehicle Identification Number

**Basic Info:**
- `heading` - Formatted title
- `build.year` - Model year
- `build.make` - Manufacturer
- `build.model` - Model name
- `build.trim` - Trim level

**Pricing:**
- `price` - Current price
- `msrp` - MSRP

**Mileage:**
- `miles` - Odometer reading

**Quality:**
- `carfax_clean_title` - Clean title flag
- `carfax_1_owner` - Single owner flag

**Timing:**
- `dom_active` - Active days on market
- `last_seen_at` - Last update timestamp

**Dealer:**
- `dealer.name` - Dealer name
- `dealer.city` - City
- `dealer.state` - State
- `dealer.zip` - ZIP code
- `dealer.phone` - Phone

**Specs:**
- `build.transmission` - Transmission
- `build.drivetrain` - Drivetrain
- `build.fuel_type` - Fuel type
- `build.engine` - Engine
- `build.body_type` - Body type
- `build.highway_mpg` - Highway MPG
- `build.city_mpg` - City MPG

**Links:**
- `vdp_url` - Dealer listing URL

---

### 🟡 Enhanced Fields (Nice to Have)

**Photos:**
- `media.photo_links` - Dealer photos
- `media.photo_links_cached` - Cached photos

**Price Tracking:**
- `ref_price` - Previous price
- `price_change_percent` - % change

**Additional Timing:**
- `dom` - Total days on market
- `dom_180` - 180-day DOM
- `dos_active` - Days on site
- `scraped_at` - First seen
- `first_seen_at_source` - Source first seen
- `first_seen_at_mc` - MC first seen

**Vehicle Details:**
- `exterior_color` - Exterior color
- `interior_color` - Interior color
- `base_ext_color` - Standardized ext color
- `base_int_color` - Standardized int color
- `stock_no` - Stock number
- `build.vehicle_type` - Car/Truck
- `build.engine_size` - Displacement
- `build.cylinders` - Cylinder count
- `build.doors` - Door count
- `build.std_seating` - Seating capacity

**Enhanced Dealer:**
- `dealer.dealer_type` - Franchise/independent
- `dealer.website` - Website
- `dealer.street` - Address
- `dealer.latitude` - Latitude
- `dealer.longitude` - Longitude

**Metadata:**
- `inventory_type` - new/used
- `is_certified` - CPO flag
- `source` - Data source

---

## 📁 File Structure

```
yourtoyotapicks/
├── data/
│   ├── .gitignore                    # Ignore marketcheck-sample.json ⭐ NEW
│   └── marketcheck-sample.json       # Raw API response ⭐ NEW
├── scripts/
│   ├── fetch-marketcheck-sample.ts   # Initial fetch to file ⭐ NEW
│   ├── import-marketcheck-data.ts    # Import JSON to DB ⭐ NEW
│   ├── marketcheck-config.ts         # Config presets ⭐ NEW
│   └── fetch-marketcheck-live.ts     # Fetch directly to DB ⭐ NEW
├── supabase/migrations/
│   └── 20250112_create_marketcheck_listings.sql  ⭐ NEW
├── lib/
│   ├── marketcheck.ts                # API client ⭐ NEW
│   ├── supabase.ts                   # Updated queries
│   └── types.ts                      # Marketcheck types ⭐ NEW
├── app/dashboard/
│   ├── page.tsx                      # Use Marketcheck data
│   └── [vin]/page.tsx                # Use Marketcheck data
└── docs/
    ├── features/
    │   ├── MARKETCHECK_API_INTEGRATION.md   ⭐ NEW
    │   └── MARKETCHECK_IMPLEMENTATION_PLAN.md  ⭐ THIS FILE
    └── setup/
        └── MARKETCHECK_DATABASE.md          ⭐ NEW
```

---

## 🚀 Quick Start Commands

```bash
# Step 1: Fetch sample data (1 API call)
npx tsx scripts/fetch-marketcheck-sample.ts

# Step 2: Review the data
cat data/marketcheck-sample.json | jq '.' | less

# Step 3: Create database from real data structure
npm run db:reset

# Step 4: Import data from JSON file (no API call)
npx tsx scripts/import-marketcheck-data.ts

# Step 5: View in dashboard
npm run dev
open http://localhost:3001/dashboard
```

---

## 📈 API Usage

### Phase 1: Initial Setup (This Plan)
- **API Calls:** 1 (sample fetch)
- **Cars Retrieved:** 50
- **Quota Used:** 0.2%

### Phase 2: Production Usage (Future)
- **Initial pull:** 1 call = 50 cars
- **Weekly refresh:** 1 call/week = 4 calls/month
- **Monthly total:** 5 calls = 1% quota

### Phase 3: Scale Up (Optional)
- **Multiple locations:** 5 calls = 250 cars = 1%
- **Weekly refresh:** 20 calls = 4%
- **Monthly total:** 25 calls = 5% quota

---

## ⚠️ Important Notes

### API Key Setup
```bash
# Add to .env.local (never commit!)
MARKETCHECK_API_KEY=your_api_key_here
```

### Data Privacy
- Add `data/marketcheck-sample.json` to `.gitignore`
- Never commit API responses
- API key stays in `.env.local`

### Error Handling
- Script will fail gracefully if API key missing
- Save partial data if API call partially succeeds
- Log errors to console

### Data Validation
- Verify 50 records returned
- Check all VINs are valid (17 chars)
- Ensure prices are in expected range
- Confirm makes are Toyota/Honda

---

## 🎯 Success Criteria

### Phase 1 (Capture Data)
- [  ] API call succeeds
- [ ] JSON file created with 50 listings
- [ ] All fields visible in JSON
- [ ] No API errors logged

### Phase 2 (Database Design)
- [ ] Migration file created
- [ ] Table has all necessary columns
- [ ] Data types match JSON values
- [ ] Migration runs successfully

### Phase 3 (Data Import)
- [ ] All 50 records imported
- [ ] No missing VINs
- [ ] No import errors
- [ ] Query returns correct data

### Phase 4 (Dashboard Integration)
- [ ] Dashboard displays 50 cars
- [ ] Filters work correctly
- [ ] VIN detail pages load
- [ ] Images display (IMAGIN.studio)

---

## 📝 Progress Tracking

**Started:** 2025-01-12
**Target Completion:** 2025-01-13 (1-2 days)
**Status:** In Progress

### Task Completion Status
- [ ] Phase 1: Capture Real Data (0/3 tasks)
- [ ] Phase 2: Database Design (0/3 tasks)
- [ ] Phase 3: Data Import (0/3 tasks)
- [ ] Phase 4: Production API Client (0/3 tasks)
- [ ] Phase 5: Dashboard Integration (0/3 tasks)
- [ ] Phase 6: Testing & Validation (0/3 tasks)
- [ ] Phase 7: Documentation (0/4 tasks)

**Total Progress:** 0/22 tasks (0%)

---

**Last Updated:** 2025-01-12
**Next Review:** After Phase 1 completion (real data captured)
