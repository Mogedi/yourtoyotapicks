# Marketcheck Data Integration - Implementation Plan

**Status:** 🚧 IN PROGRESS
**Last Updated:** 2025-10-12
**Total Phases:** 8
**Completed Phases:** 0/8

---

## ⚠️ SAFETY GUIDELINES FOR UNRESTRICTED MODE

### Before Starting ANY Phase:
1. ✅ **READ THIS ENTIRE DOCUMENT** before making any changes
2. ✅ **Verify current phase status** - Do NOT skip phases
3. ✅ **Run all tests for previous phase** before proceeding
4. ✅ **Create git commit** after each phase completes
5. ✅ **Take screenshot** of working state before changes

### Emergency Stop Conditions:
- 🛑 **STOP if build fails** - Fix before proceeding
- 🛑 **STOP if tests fail** - Fix before proceeding
- 🛑 **STOP if >10 console errors** - Investigate immediately
- 🛑 **STOP if data loss detected** - Verify database integrity

### Rollback Commands:
```bash
# If something breaks:
git status                    # Check what changed
git diff                      # Review changes
git restore .                 # Discard all changes
git reset --hard HEAD~1       # Undo last commit

# Emergency production rollback:
vercel rollback
```

---

## Progress Tracking

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| 1. Adapter Layer | ⬜ Not Started | - | - | - |
| 2. Query Layer | ⬜ Not Started | - | - | - |
| 3. Dashboard Integration | ⬜ Not Started | - | - | - |
| 4. Enhanced Filtering | ⬜ Not Started | - | - | - |
| 5. Detail Page Enhancement | ⬜ Not Started | - | - | - |
| 6. Priority Scoring | ⬜ Not Started | - | - | - |
| 7. E2E Testing | ⬜ Not Started | - | - | - |
| 8. Production Deployment | ⬜ Not Started | - | - | - |

**Update this table after each phase:**
- ⬜ Not Started → 🔄 In Progress → ✅ Complete
- Fill in timestamps
- Add notes about issues/decisions

---

## Overview

**Goal:** Migrate dashboard from mock data (32 cars) to real Marketcheck data (88 cars)

**Data Source:** `marketcheck_listings` table (Supabase production)
**Current State:** Database has 88 cars imported, app uses mock data
**Target State:** App displays all 88 real cars with full field usage

---

## Phase 1: Foundation - Data Adapter Layer

### ⚠️ Pre-Phase Checklist
- [ ] Read this phase completely
- [ ] Verify database has 88 cars: `npx tsx scripts/verify-import.ts`
- [ ] Baseline test: `npm run build` (should pass)
- [ ] Baseline test: `npm run lint` (should pass)
- [ ] Create branch: `git checkout -b marketcheck-adapter`

### Implementation

**File to Create:** `lib/marketcheck-adapter.ts`

**Purpose:** Transform Marketcheck database schema → App's `ListingSummary` type

**Key Transformations:**
```typescript
// Marketcheck Schema → App Schema
miles                    → mileage
dealer.city + state      → current_location
dist                     → distance_miles
carfax_1_owner (boolean) → owner_count (1 or 2)
photo_links (JSONB)      → images_url (string[])
[calculated]             → priority_score (0-133)
[calculated]             → mileage_rating ('excellent' | 'good' | 'acceptable')
```

**Required Functions:**
1. `transformMarketcheckToListingSummary(raw: any): ListingSummary`
   - Transform single listing
   - Handle all null/undefined fields gracefully
   - Calculate derived fields

2. `transformMarketcheckToVehicle(raw: any): Vehicle`
   - Transform to full Vehicle type
   - Include all 77 fields
   - Used for detail pages

3. `calculateMileageRating(miles: number, year: number): MileageRating`
   - < 10,000 miles/year → 'excellent'
   - 10,000-15,000 miles/year → 'good'
   - > 15,000 miles/year → 'acceptable'

**Implementation Requirements:**
- TypeScript strict mode compatible
- Null-safe (use optional chaining and nullish coalescing)
- Export types for Marketcheck raw data
- Include JSDoc comments for all functions

### Testing Strategy

#### A. Code Error Testing
```bash
# Must pass before proceeding:
npm run build         # ✅ No TypeScript errors
npm run lint          # ✅ No ESLint errors
```

#### B. Runtime Error Testing

**Create:** `scripts/test-adapter.ts`

```typescript
#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { transformMarketcheckToListingSummary } from '@/lib/marketcheck-adapter';

console.log('🧪 Testing Marketcheck Adapter...\n');

// Load real data
const data = JSON.parse(readFileSync('data/marketcheck-combined.json', 'utf-8'));
const listings = data.listings;

console.log(`📊 Testing ${listings.length} listings...\n`);

let successCount = 0;
let errorCount = 0;
const errors: string[] = [];

// Test each listing
for (const raw of listings) {
  try {
    const transformed = transformMarketcheckToListingSummary(raw);

    // Validate required fields
    if (!transformed.vin) throw new Error('Missing VIN');
    if (!transformed.make) throw new Error('Missing make');
    if (!transformed.model) throw new Error('Missing model');
    if (!transformed.year) throw new Error('Missing year');
    if (!transformed.price) throw new Error('Missing price');
    if (!transformed.mileage) throw new Error('Missing mileage');
    if (!transformed.priority_score) throw new Error('Missing priority_score');

    // Validate priority_score range
    if (transformed.priority_score < 0 || transformed.priority_score > 133) {
      throw new Error(`Invalid priority_score: ${transformed.priority_score}`);
    }

    successCount++;
  } catch (error) {
    errorCount++;
    const msg = error instanceof Error ? error.message : String(error);
    errors.push(`VIN ${raw.vin}: ${msg}`);
  }
}

console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Errors: ${errorCount}\n`);

if (errors.length > 0) {
  console.log('Errors:');
  errors.forEach(err => console.log(`  - ${err}`));
  process.exit(1);
}

console.log('🎉 All listings transformed successfully!\n');

// Test priority score distribution
const scores = listings.map((l: any) =>
  transformMarketcheckToListingSummary(l).priority_score
);

console.log('📈 Priority Score Distribution:');
console.log(`   Min: ${Math.min(...scores)}`);
console.log(`   Max: ${Math.max(...scores)}`);
console.log(`   Avg: ${(scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)}`);

process.exit(0);
```

**Run Test:**
```bash
npx tsx scripts/test-adapter.ts
```

**Expected Output:**
```
✅ Successful: 88
❌ Errors: 0
📈 Priority Score Distribution:
   Min: 30-50
   Max: 110-133
   Avg: 70-85
```

#### C. Visual Verification
Not applicable (pure data transformation)

### Success Criteria
- ✅ `npm run build` passes
- ✅ `npm run lint` passes
- ✅ All 88 listings transform without errors
- ✅ Priority scores in valid range (0-133)
- ✅ No null/undefined in required fields
- ✅ Test script exits with code 0

### Completion Steps
```bash
# If all tests pass:
git add lib/marketcheck-adapter.ts scripts/test-adapter.ts
git commit -m "feat: add Marketcheck data adapter layer

- Transform Marketcheck schema to app types
- Calculate priority scores (0-133 range)
- Handle null values gracefully
- Test coverage: 88/88 listings"

# Update progress table at top of this file:
# Phase 1: ⬜ Not Started → ✅ Complete
```

---

## Phase 2: Database Query Layer

### ⚠️ Pre-Phase Checklist
- [ ] Phase 1 must be ✅ Complete
- [ ] Read this phase completely
- [ ] Verify: `npm run build` passes
- [ ] Verify: `npx tsx scripts/test-adapter.ts` passes
- [ ] Create branch: `git checkout -b marketcheck-queries`

### Implementation

**File to Update:** `lib/supabase.ts`

**New Functions to Add:**

1. **Query all listings with filters**
```typescript
export async function getMarketcheckListings(
  filters?: FilterCriteria
): Promise<PaginatedResponse<ListingSummary>> {
  try {
    let query = supabase
      .from('marketcheck_listings')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.makes?.length) {
      query = query.in('make', filters.makes);
    }

    if (filters?.models?.length) {
      query = query.in('model', filters.models);
    }

    if (filters?.priceMin) {
      query = query.gte('price', filters.priceMin);
    }

    if (filters?.priceMax) {
      query = query.lte('price', filters.priceMax);
    }

    if (filters?.maxOwners === 1) {
      query = query.eq('carfax_1_owner', true);
    }

    // Apply sorting (default: priority score DESC)
    const sortBy = filters?.sortBy || 'priority';
    const sortOrder = filters?.sortOrder || 'desc';

    // Note: We'll calculate priority_score in the adapter
    // For now, sort by a proxy field or do client-side sorting

    const { data, error, count } = await query;

    if (error) throw error;
    if (!data) return { data: [], total: 0, page: 1, pageSize: 0, hasMore: false };

    // Transform via adapter
    const transformed = data.map(transformMarketcheckToListingSummary);

    // Client-side sorting by priority_score
    if (sortBy === 'priority') {
      transformed.sort((a, b) =>
        sortOrder === 'desc'
          ? b.priority_score - a.priority_score
          : a.priority_score - b.priority_score
      );
    }

    return {
      data: transformed,
      total: count || transformed.length,
      page: 1,
      pageSize: transformed.length,
      hasMore: false,
    };
  } catch (error) {
    console.error('Error fetching Marketcheck listings:', error);
    throw error;
  }
}
```

2. **Query single listing by VIN (case-insensitive)**
```typescript
export async function getMarketcheckListingByVin(
  vin: string
): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('marketcheck_listings')
      .select('*')
      .ilike('vin', vin) // Case-insensitive match
      .single();

    if (error) throw error;
    if (!data) return null;

    return transformMarketcheckToVehicle(data);
  } catch (error) {
    console.error('Error fetching Marketcheck listing by VIN:', error);
    return null;
  }
}
```

3. **Get dashboard stats**
```typescript
export async function getMarketcheckStats(): Promise<{
  total: number;
  singleOwner: number;
  avgPrice: number;
  avgMileage: number;
}> {
  const { data } = await supabase
    .from('marketcheck_listings')
    .select('price, miles, carfax_1_owner');

  if (!data) return { total: 0, singleOwner: 0, avgPrice: 0, avgMileage: 0 };

  return {
    total: data.length,
    singleOwner: data.filter(d => d.carfax_1_owner).length,
    avgPrice: data.reduce((sum, d) => sum + d.price, 0) / data.length,
    avgMileage: data.reduce((sum, d) => sum + d.miles, 0) / data.length,
  };
}
```

### Testing Strategy

#### A. Code Error Testing
```bash
npm run build         # ✅ No TypeScript errors
npm run lint          # ✅ No ESLint errors
```

#### B. Runtime Error Testing

**Create:** `scripts/test-marketcheck-queries.ts`

```typescript
#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { getMarketcheckListings, getMarketcheckListingByVin, getMarketcheckStats } from '@/lib/supabase';

dotenv.config({ path: '.env.local' });

console.log('🧪 Testing Marketcheck Queries...\n');

async function runTests() {
  // Test 1: Get all listings
  console.log('Test 1: Get all listings...');
  const all = await getMarketcheckListings({ limit: 100 });
  console.assert(all.data.length === 88, `Expected 88 cars, got ${all.data.length}`);
  console.log(`✅ Returned ${all.data.length} listings\n`);

  // Test 2: Filter by make (Honda)
  console.log('Test 2: Filter by make (Honda)...');
  const hondas = await getMarketcheckListings({ makes: ['Honda'] });
  console.assert(hondas.data.length === 45, `Expected 45 Hondas, got ${hondas.data.length}`);
  console.log(`✅ Returned ${hondas.data.length} Hondas\n`);

  // Test 3: Filter by make (Toyota)
  console.log('Test 3: Filter by make (Toyota)...');
  const toyotas = await getMarketcheckListings({ makes: ['Toyota'] });
  console.assert(toyotas.data.length === 43, `Expected 43 Toyotas, got ${toyotas.data.length}`);
  console.log(`✅ Returned ${toyotas.data.length} Toyotas\n`);

  // Test 4: Filter by price range
  console.log('Test 4: Filter by price range ($15K-$20K)...');
  const inBudget = await getMarketcheckListings({ priceMin: 15000, priceMax: 20000 });
  console.log(`✅ Found ${inBudget.data.length} cars in range\n`);

  // Test 5: Single-owner filter
  console.log('Test 5: Filter single-owner only...');
  const singleOwner = await getMarketcheckListings({ maxOwners: 1 });
  console.assert(singleOwner.data.length === 32, `Expected 32 single-owner, got ${singleOwner.data.length}`);
  console.log(`✅ Returned ${singleOwner.data.length} single-owner cars\n`);

  // Test 6: Get by VIN (uppercase)
  console.log('Test 6: Get by VIN (uppercase)...');
  const car1 = await getMarketcheckListingByVin('5YFBURHE5HP690324');
  console.assert(car1 !== null, 'Car should be found');
  console.log(`✅ Found: ${car1?.year} ${car1?.make} ${car1?.model}\n`);

  // Test 7: Get by VIN (lowercase - case insensitive)
  console.log('Test 7: Get by VIN (lowercase)...');
  const car2 = await getMarketcheckListingByVin('5yfburhe5hp690324');
  console.assert(car2 !== null, 'Car should be found');
  console.assert(car1?.vin === car2?.vin, 'Should find same car regardless of case');
  console.log(`✅ Case-insensitive lookup works\n`);

  // Test 8: Invalid VIN
  console.log('Test 8: Invalid VIN...');
  const invalid = await getMarketcheckListingByVin('INVALID123');
  console.assert(invalid === null, 'Should return null for invalid VIN');
  console.log(`✅ Returns null for invalid VIN\n`);

  // Test 9: Get stats
  console.log('Test 9: Get dashboard stats...');
  const stats = await getMarketcheckStats();
  console.log(`   Total: ${stats.total}`);
  console.log(`   Single-owner: ${stats.singleOwner}`);
  console.log(`   Avg Price: $${stats.avgPrice.toFixed(0)}`);
  console.log(`   Avg Mileage: ${stats.avgMileage.toFixed(0)} mi`);
  console.assert(stats.total === 88, 'Stats should reflect 88 cars');
  console.log(`✅ Stats calculated correctly\n`);

  console.log('🎉 All query tests passed!\n');
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
```

**Run Test:**
```bash
npx tsx scripts/test-marketcheck-queries.ts
```

**Expected Output:**
```
✅ Returned 88 listings
✅ Returned 45 Hondas
✅ Returned 43 Toyotas
✅ Found X cars in range
✅ Returned 32 single-owner cars
✅ Found: 2017 Toyota RAV4
✅ Case-insensitive lookup works
✅ Returns null for invalid VIN
✅ Stats calculated correctly
🎉 All query tests passed!
```

#### C. Visual Verification
Not applicable (backend queries only)

### Success Criteria
- ✅ `npm run build` passes
- ✅ `npm run lint` passes
- ✅ Query test script passes (all 9 tests)
- ✅ Exact counts match: 88 total, 45 Honda, 43 Toyota, 32 single-owner
- ✅ Case-insensitive VIN lookup works
- ✅ Invalid VIN returns null (no crash)

### Completion Steps
```bash
git add lib/supabase.ts scripts/test-marketcheck-queries.ts
git commit -m "feat: add Marketcheck database query functions

- Query all listings with filtering
- Case-insensitive VIN lookup
- Dashboard stats aggregation
- Test coverage: 9/9 tests passing"
```

---

## Phase 3: Dashboard Integration

### ⚠️ Pre-Phase Checklist
- [ ] Phase 2 must be ✅ Complete
- [ ] Read this phase completely
- [ ] Verify: `npx tsx scripts/test-marketcheck-queries.ts` passes
- [ ] **CRITICAL:** Take screenshot of current dashboard: `npm run test:ui:01`
- [ ] Create branch: `git checkout -b marketcheck-dashboard`

### Implementation

**File to Update:** `app/dashboard/page.tsx`

**Changes Required:**

1. **Update data fetching logic:**

```typescript
// BEFORE (current code):
try {
  const response = await getListings({ limit: 100 });
  if (response.data && response.data.length > 0) {
    setAllVehicles(response.data);
    return;
  }
} catch (dbError) {
  // Silently fallback to mock data
}
// Use mock data as fallback
const mockData = mockListings.map(listing => ({...}));

// AFTER (new code):
try {
  // Try Marketcheck data first
  const response = await getMarketcheckListings({ limit: 100 });
  if (response.data && response.data.length > 0) {
    setAllVehicles(response.data);
    setIsUsingMockData(false);
    return;
  }
} catch (marketcheckError) {
  console.warn('Marketcheck data not available, trying legacy data...');

  try {
    // Try legacy curated_listings table
    const response = await getListings({ limit: 100 });
    if (response.data && response.data.length > 0) {
      setAllVehicles(response.data);
      setIsUsingMockData(false);
      return;
    }
  } catch (dbError) {
    console.warn('Database unavailable, using mock data...');
  }
}

// Final fallback: mock data
const mockData = mockListings.map(listing => ({...}));
setAllVehicles(mockData);
setIsUsingMockData(true);
```

2. **Add data source indicator (optional but recommended):**

```typescript
// Add state
const [isUsingMockData, setIsUsingMockData] = useState(false);

// Add indicator in UI (bottom of page)
{process.env.NODE_ENV === 'development' && isUsingMockData && (
  <div className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
    ⚠️ Using mock data
  </div>
)}
```

### Testing Strategy

#### A. Code Error Testing
```bash
npm run build         # ✅ No TypeScript errors
npm run lint          # ✅ No ESLint errors
```

#### B. Runtime Error Testing

**Test 1: E2E Dashboard Load**
```bash
# Start dev server
npm run dev

# In another terminal:
npm run test:ui:01
```

**Update test expectations in `tests/e2e/flows/01-landing-to-dashboard.test.ts`:**
```typescript
// Change this line:
if (vehicleCount >= 32) {  // OLD
// To:
if (vehicleCount >= 88) {  // NEW - Marketcheck has 88 cars

// And:
logSuccess(`✓ Verified: ${vehicleCount} vehicle cards (≥ 88 expected)`);
```

**Expected Output:**
```
✓ Verified: 88 vehicle cards (≥ 88 expected)
✅ Test passed
```

**Test 2: Console Error Monitoring**
```bash
# Open browser console while running:
npm run watch:errors
```

- Navigate to http://localhost:3001/dashboard
- Watch for errors in terminal
- Check `.claude/errors.json`
- **STOP IF:** More than 10 errors appear

**Test 3: Network Inspection**
- Open http://localhost:3001/dashboard
- Open DevTools → Network tab
- Look for Supabase REST request
- Verify response: 88 items returned
- Check status: 200 OK

#### C. Visual Verification

**Manual QA Checklist:**
```
Dashboard Load:
  [ ] Page loads within 3 seconds
  [ ] 88 vehicle cards visible (scroll to verify)
  [ ] No "mock data" indicator visible (unless DB fails)

Card Content:
  [ ] All cards show vehicle images
  [ ] Prices formatted correctly ($XX,XXX)
  [ ] Mileage formatted correctly (XX,XXX mi)
  [ ] Dealer locations visible (City, ST format)
  [ ] No broken image icons (fallback works)

Badges:
  [ ] Single-owner badges visible on ~32 cars
  [ ] NEW badges on recent listings (< 14 days)
  [ ] Price drop badges if applicable

Layout:
  [ ] Grid layout not broken
  [ ] Cards aligned properly
  [ ] Spacing consistent
  [ ] No overlapping elements

Responsive Design:
  [ ] Mobile (375px): Cards stack vertically
  [ ] Tablet (768px): 2-column grid
  [ ] Desktop (1920px): 3-4 column grid
```

**Screenshot Comparison:**
```bash
# Compare before (Phase 2) and after (Phase 3)
# Should see 88 cards instead of 32
open tests/screenshots/01-landing-to-dashboard/dashboard-loaded.png
```

### Success Criteria
- ✅ `npm run build` passes
- ✅ E2E test passes with 88 cards
- ✅ Zero console errors (check watch:errors)
- ✅ Network request succeeds (200 OK)
- ✅ All visual QA items checked
- ✅ Screenshot shows 88 cards

### Completion Steps
```bash
git add app/dashboard/page.tsx tests/e2e/flows/01-landing-to-dashboard.test.ts
git commit -m "feat: integrate Marketcheck data into dashboard

- Fetch from marketcheck_listings table
- Graceful fallback to mock data
- Update E2E test to expect 88 cars
- All tests passing"
```

---

## Phase 4: Enhanced Filtering

### ⚠️ Pre-Phase Checklist
- [ ] Phase 3 must be ✅ Complete
- [ ] Read this phase completely
- [ ] Verify: Dashboard shows 88 cars
- [ ] Verify: `npm run test:ui:02` passes with current filters
- [ ] Create branch: `git checkout -b marketcheck-filters`

### Implementation

**File to Update:** `components/FilterBar.tsx`

**New Filters to Add:**

1. **Days on Market Filter**
```typescript
<Select name="daysOnMarket">
  <option value="">All Listings</option>
  <option value="new">New (< 14 days)</option>
  <option value="recent">Recent (14-30 days)</option>
  <option value="older">Older (> 30 days)</option>
</Select>
```

2. **Price Drop Filter**
```typescript
<Checkbox name="priceDropOnly">
  Show only price drops
</Checkbox>
```

3. **Dealer Type Filter**
```typescript
<Select name="dealerType">
  <option value="">All Dealers</option>
  <option value="franchise">Franchise Only</option>
  <option value="independent">Independent Only</option>
</Select>
```

4. **MPG Filter**
```typescript
<Input
  type="number"
  name="minHighwayMpg"
  placeholder="Min Highway MPG"
/>
```

**Update Filter Application Logic:**
```typescript
// In dashboard page.tsx or FilterBar component
const applyFilters = (vehicles: ListingSummary[]) => {
  return vehicles.filter(v => {
    // Existing filters...

    // Days on Market
    if (filters.daysOnMarket === 'new' && v.dom_active > 14) return false;
    if (filters.daysOnMarket === 'recent' && (v.dom_active <= 14 || v.dom_active > 30)) return false;
    if (filters.daysOnMarket === 'older' && v.dom_active <= 30) return false;

    // Price Drop
    if (filters.priceDropOnly && !v.price_change_percent) return false;

    // Dealer Type
    if (filters.dealerType === 'franchise' && v.dealer_type !== 'franchise') return false;
    if (filters.dealerType === 'independent' && v.dealer_type !== 'independent') return false;

    // MPG
    if (filters.minHighwayMpg && v.highway_mpg < filters.minHighwayMpg) return false;

    return true;
  });
};
```

### Testing Strategy

#### A. Code Error Testing
```bash
npm run build         # ✅ No TypeScript errors
npm run lint          # ✅ No ESLint errors
```

#### B. Runtime Error Testing

**Test 1: E2E Filter Test**
```bash
npm run test:ui:02
```

**Update test expectations in `tests/e2e/flows/02-dashboard-filtering.test.ts`:**
- Update Honda filter: expect 45 cars (was ~16)
- Update Toyota filter: expect 43 cars (was ~16)
- Test new filters (DOM, price drop, etc.)

**Test 2: Filter Combinations**

Create `tests/e2e/flows/07-advanced-filtering.test.ts`:
```typescript
// Test 1: Honda + Single-owner
await selectFilter(page, 'make', 'Honda');
await checkboxFilter(page, 'singleOwnerOnly', true);
const count1 = await getVehicleCount(page);
// Expect: ~16-18 cars (45 Hondas * 36% single-owner)

// Test 2: Toyota + Price range + NEW
await selectFilter(page, 'make', 'Toyota');
await inputFilter(page, 'priceMin', '15000');
await inputFilter(page, 'priceMax', '20000');
await selectFilter(page, 'daysOnMarket', 'new');
const count2 = await getVehicleCount(page);
// Expect: Varies, but > 0

// Test 3: All filters combined
// Should not crash, even with 0 results

// Test 4: Clear filters
await clickButton(page, 'Clear Filters');
const countFinal = await getVehicleCount(page);
expect(countFinal).toBe(88); // Should reset to all cars
```

#### C. Visual Verification

**Manual QA:**
```
Filter Bar:
  [ ] All new filters visible
  [ ] Dropdowns populated with correct options
  [ ] Checkboxes toggle correctly
  [ ] Number inputs accept values

Filter Application:
  [ ] Result count updates in real-time
  [ ] Filtered cars match criteria (spot-check 5 cars)
  [ ] No crashes with zero results
  [ ] "No results" message shows when appropriate

Filter Combinations:
  [ ] Multiple filters work together (AND logic)
  [ ] Clear filters button resets everything
  [ ] URL params preserve filters on refresh (if implemented)

Responsive:
  [ ] Mobile: Filters in collapsible drawer
  [ ] Tablet: Filters in sidebar
  [ ] Desktop: Filters in top bar
```

### Success Criteria
- ✅ `npm run build` passes
- ✅ E2E filter test passes
- ✅ Advanced filtering test passes
- ✅ Zero console errors
- ✅ All visual QA items checked
- ✅ Filter combinations work correctly

### Completion Steps
```bash
git add components/FilterBar.tsx app/dashboard/page.tsx tests/e2e/flows/07-advanced-filtering.test.ts
git commit -m "feat: add enhanced filtering for Marketcheck data

- Days on Market filter
- Price drop filter
- Dealer type filter
- MPG filter
- All tests passing"
```

---

## Phase 5: Vehicle Detail Page Enhancement

### ⚠️ Pre-Phase Checklist
- [ ] Phase 4 must be ✅ Complete
- [ ] Read this phase completely
- [ ] Verify: Dashboard filters work correctly
- [ ] **CRITICAL:** Test current detail page: `npm run test:ui:03`
- [ ] Create branch: `git checkout -b marketcheck-detail-page`

### Implementation

**File to Update:** `app/dashboard/[vin]/page.tsx`

**Major Sections to Add/Update:**

1. **Hero Section - Photo Gallery**
```typescript
// Use photo_links array (8-33 images per car)
<ImageGallery images={vehicle.photo_links || []} />
```

2. **Pricing Section**
```typescript
<PricingCard>
  <Price>${vehicle.price.toLocaleString()}</Price>
  {vehicle.msrp && (
    <MSRP>
      MSRP: ${vehicle.msrp.toLocaleString()}
      <Savings>Save ${(vehicle.msrp - vehicle.price).toLocaleString()}</Savings>
    </MSRP>
  )}
  {vehicle.ref_price && (
    <RefPrice>Was: ${vehicle.ref_price.toLocaleString()}</RefPrice>
  )}
  {vehicle.price_change_percent && (
    <PriceDrop>
      🔽 Price dropped {Math.abs(vehicle.price_change_percent)}%
    </PriceDrop>
  )}
  <VDPLink href={vehicle.vdp_url}>View on Dealer Site →</VDPLink>
</PricingCard>
```

3. **Overview Section**
```typescript
<SpecsGrid>
  <Spec label="Mileage" value={`${vehicle.miles.toLocaleString()} mi`} />
  <Spec label="Body Type" value={vehicle.body_type} />
  <Spec label="Transmission" value={vehicle.transmission} />
  <Spec label="Drivetrain" value={vehicle.drivetrain} />
  <Spec label="Fuel Type" value={vehicle.fuel_type} />
  <Spec label="Engine" value={vehicle.engine} />
  <Spec label="Doors" value={vehicle.doors} />
  <Spec label="Seating" value={vehicle.std_seating} />
  <Spec label="Exterior" value={vehicle.exterior_color} />
  <Spec label="Interior" value={vehicle.interior_color} />
</SpecsGrid>
```

4. **Fuel Economy Section**
```typescript
<FuelEconomyCard>
  <MPG label="City" value={`${vehicle.city_mpg} MPG`} />
  <MPG label="Highway" value={`${vehicle.highway_mpg} MPG`} />
  <MPG label="Combined" value={`${Math.round((vehicle.city_mpg + vehicle.highway_mpg) / 2)} MPG`} />
  {vehicle.powertrain_type && (
    <PowertrainType>{vehicle.powertrain_type}</PowertrainType>
  )}
</FuelEconomyCard>
```

5. **History Section**
```typescript
<HistoryCard>
  <Badge variant={vehicle.carfax_clean_title ? 'success' : 'warning'}>
    {vehicle.carfax_clean_title ? 'Clean Title' : 'Title Issue'}
  </Badge>
  <Badge variant={vehicle.carfax_1_owner ? 'success' : 'default'}>
    {vehicle.carfax_1_owner ? 'Single Owner' : 'Multiple Owners'}
  </Badge>
  {vehicle.made_in && (
    <OriginInfo>Built in {vehicle.made_in}</OriginInfo>
  )}
</HistoryCard>
```

6. **Market Activity Section**
```typescript
<MarketActivityCard>
  <Stat label="Days on Market" value={vehicle.dom_active} />
  <Stat label="Days Listed (All-Time)" value={vehicle.dom} />
  <Stat label="Days Listed (Last 180)" value={vehicle.dom_180} />
  {vehicle.first_seen_at_date && (
    <Date label="First Seen" value={formatDate(vehicle.first_seen_at_date)} />
  )}
  {vehicle.last_seen_at_date && (
    <Date label="Last Seen" value={formatDate(vehicle.last_seen_at_date)} />
  )}
  {vehicle.in_transit && (
    <Badge variant="warning">🚚 In Transit</Badge>
  )}
</MarketActivityCard>
```

7. **Dealer Info Section**
```typescript
<DealerCard>
  <DealerName>{vehicle.dealer_name}</DealerName>
  {vehicle.dealer_type && (
    <DealerType>{vehicle.dealer_type}</DealerType>
  )}
  <Address>
    {vehicle.dealer_street}<br />
    {vehicle.dealer_city}, {vehicle.dealer_state} {vehicle.dealer_zip}
  </Address>
  {vehicle.dealer_phone && (
    <Phone href={`tel:${vehicle.dealer_phone}`}>{vehicle.dealer_phone}</Phone>
  )}
  {vehicle.dealer_website && (
    <Website href={vehicle.dealer_website}>Visit Website →</Website>
  )}
  {vehicle.dist && (
    <Distance>{vehicle.dist.toFixed(1)} miles away</Distance>
  )}
  {vehicle.dealer_latitude && vehicle.dealer_longitude && (
    <MapLink
      href={`https://www.google.com/maps?q=${vehicle.dealer_latitude},${vehicle.dealer_longitude}`}
      target="_blank"
    >
      📍 View on Map
    </MapLink>
  )}
  {vehicle.stock_no && (
    <StockNumber>Stock #{vehicle.stock_no}</StockNumber>
  )}
</DealerCard>
```

8. **Specifications Section**
```typescript
<SpecificationsTable>
  <Section title="Engine">
    <Row label="Engine Type" value={vehicle.engine} />
    <Row label="Engine Size" value={`${vehicle.engine_size}L`} />
    <Row label="Block Type" value={vehicle.engine_block} />
    <Row label="Cylinders" value={vehicle.cylinders} />
  </Section>

  <Section title="Dimensions">
    <Row label="Length" value={`${vehicle.overall_length}"`} />
    <Row label="Width" value={`${vehicle.overall_width}"`} />
    <Row label="Height" value={`${vehicle.overall_height}"`} />
  </Section>

  <Section title="Additional">
    <Row label="Vehicle Type" value={vehicle.vehicle_type} />
    <Row label="Data Source" value={vehicle.data_source} />
  </Section>
</SpecificationsTable>
```

**Update Data Fetching:**
```typescript
// In page component:
const vehicle = await getMarketcheckListingByVin(params.vin);

if (!vehicle) {
  // Try legacy table
  const legacyVehicle = await getListingByVin(params.vin);
  if (!legacyVehicle) {
    return <NotFound />;
  }
}
```

### Testing Strategy

#### A. Code Error Testing
```bash
npm run build         # ✅ No TypeScript errors
npm run lint          # ✅ No ESLint errors
```

#### B. Runtime Error Testing

**Test 1: E2E Vehicle Detail**
```bash
npm run test:ui:03
```

**Expected:** All sections render without errors

**Test 2: Field Coverage Test**

Create `scripts/test-detail-page-coverage.ts`:
```typescript
#!/usr/bin/env tsx
import { getMarketcheckListings } from '@/lib/supabase';

console.log('🧪 Testing Detail Page Field Coverage...\n');

const { data: listings } = await getMarketcheckListings({ limit: 88 });

const missingFields: Record<string, number> = {};

for (const listing of listings) {
  // Check critical fields
  const criticalFields = ['price', 'miles', 'dealer_name', 'photo_links'];

  for (const field of criticalFields) {
    if (!listing[field]) {
      missingFields[field] = (missingFields[field] || 0) + 1;
    }
  }

  // Check optional fields (just log)
  const optionalFields = ['msrp', 'ref_price', 'price_change_percent', 'city_mpg', 'highway_mpg'];

  for (const field of optionalFields) {
    if (!listing[field]) {
      missingFields[`${field} (optional)`] = (missingFields[`${field} (optional)`] || 0) + 1;
    }
  }
}

console.log('📊 Field Coverage Report:\n');

if (Object.keys(missingFields).filter(k => !k.includes('optional')).length > 0) {
  console.log('❌ CRITICAL MISSING FIELDS:');
  Object.entries(missingFields)
    .filter(([k]) => !k.includes('optional'))
    .forEach(([field, count]) => {
      console.log(`   ${field}: ${count}/${listings.length} missing`);
    });
  process.exit(1);
} else {
  console.log('✅ All critical fields present in all listings\n');
}

console.log('⚠️  OPTIONAL MISSING FIELDS:');
Object.entries(missingFields)
  .filter(([k]) => k.includes('optional'))
  .forEach(([field, count]) => {
    console.log(`   ${field}: ${count}/${listings.length} missing`);
  });

console.log('\n🎉 Field coverage test complete!\n');
process.exit(0);
```

Run: `npx tsx scripts/test-detail-page-coverage.ts`

**Test 3: Null Safety Test**
```bash
# Manually test car with most null fields
# Find VIN with minimal data
npm run dev
# Navigate to detail page
# Verify no "undefined" or "null" text visible
```

#### C. Visual Verification

**Manual QA Checklist:**
```
Photo Gallery:
  [ ] 8-33 images load correctly
  [ ] Thumbnail navigation works
  [ ] Click image for full-screen view
  [ ] No broken image icons

Pricing:
  [ ] Current price displayed
  [ ] MSRP shown (if available) with savings
  [ ] Reference price shown (if available)
  [ ] Price drop badge (if applicable)
  [ ] Dealer link works

Overview:
  [ ] All specs display correctly
  [ ] No "undefined" or "null" text
  [ ] "N/A" shown for missing optional fields
  [ ] Icons aligned with labels

Fuel Economy:
  [ ] City/Highway/Combined MPG shown
  [ ] Powertrain type displayed
  [ ] Chart/visual (if implemented)

History:
  [ ] Clean title badge correct color
  [ ] Owner count badge correct
  [ ] Built-in location shown

Market Activity:
  [ ] Days on market accurate
  [ ] First/last seen dates formatted correctly
  [ ] In-transit badge (if applicable)

Dealer Info:
  [ ] Name and type displayed
  [ ] Full address formatted correctly
  [ ] Phone number clickable (tel: link)
  [ ] Website link opens in new tab
  [ ] Distance calculated and displayed
  [ ] Map link works (opens Google Maps)
  [ ] Stock number shown

Specifications:
  [ ] Engine specs complete
  [ ] Dimensions shown (if available)
  [ ] Table layout not broken

General:
  [ ] Responsive: Mobile (375px) layout correct
  [ ] Responsive: Tablet (768px) layout correct
  [ ] Responsive: Desktop (1920px) layout correct
  [ ] Back button works
  [ ] No console errors
  [ ] Page loads within 2 seconds
```

**Screenshot Comparison:**
```bash
# Test 5 random detail pages
# Compare to baseline screenshots
npm run test:ui:03
```

### Success Criteria
- ✅ `npm run build` passes
- ✅ E2E detail test passes
- ✅ Field coverage test: 0 critical missing fields
- ✅ Null safety: No "undefined"/"null" text visible
- ✅ All visual QA items checked
- ✅ Test 5 random VIN pages manually - all work

### Completion Steps
```bash
git add app/dashboard/[vin]/page.tsx scripts/test-detail-page-coverage.ts
git commit -m "feat: enhance vehicle detail page with all Marketcheck fields

- Photo gallery (8-33 images)
- Pricing with MSRP and savings
- Market activity metrics
- Full dealer information with map
- Complete specifications
- All 67 fields displayed"
```

---

## Phase 6: Priority Scoring Algorithm

### ⚠️ Pre-Phase Checklist
- [ ] Phase 5 must be ✅ Complete
- [ ] Read this phase completely
- [ ] Verify: Detail pages show all fields
- [ ] Create branch: `git checkout -b marketcheck-priority-scoring`

### Implementation

**File to Create:** `lib/priority-scoring.ts`

```typescript
/**
 * Priority Scoring Algorithm for Vehicle Listings
 *
 * Calculates a priority score (0-133 points) based on 10 factors
 * to rank vehicles by desirability.
 */

export interface PriorityScoreBreakdown {
  total: number;
  factors: {
    singleOwner: number;
    cleanTitle: number;
    daysOnMarket: number;
    milesPerYear: number;
    priceVsMsrp: number;
    priceDrop: number;
    modelPreference: number;
    photoCount: number;
    highwayMpg: number;
    dealerType: number;
  };
}

export function calculatePriorityScore(listing: any): number {
  const breakdown = calculatePriorityScoreBreakdown(listing);
  return breakdown.total;
}

export function calculatePriorityScoreBreakdown(listing: any): PriorityScoreBreakdown {
  const factors = {
    singleOwner: 0,
    cleanTitle: 0,
    daysOnMarket: 0,
    milesPerYear: 0,
    priceVsMsrp: 0,
    priceDrop: 0,
    modelPreference: 0,
    photoCount: 0,
    highwayMpg: 0,
    dealerType: 0,
  };

  // Factor 1: Single Owner (+20 points)
  if (listing.carfax_1_owner === true) {
    factors.singleOwner = 20;
  }

  // Factor 2: Clean Title (+15 points)
  // Note: All cars have clean title in current dataset
  if (listing.carfax_clean_title === true) {
    factors.cleanTitle = 15;
  }

  // Factor 3: Days on Market (+0 to +15 points)
  // Newer listings are more likely to be good deals
  const dom = listing.dom_active || listing.dom || 999;
  if (dom < 7) {
    factors.daysOnMarket = 15;
  } else if (dom < 14) {
    factors.daysOnMarket = 10;
  } else if (dom < 30) {
    factors.daysOnMarket = 5;
  }
  // else: 0 points for > 30 days

  // Factor 4: Miles Per Year (+0 to +25 points)
  // Low mileage for age is highly desirable
  const currentYear = new Date().getFullYear();
  const age = currentYear - listing.year;
  const milesPerYear = age > 0 ? listing.miles / age : listing.miles;

  if (milesPerYear < 8000) {
    factors.milesPerYear = 25;
  } else if (milesPerYear < 12000) {
    factors.milesPerYear = 15;
  } else if (milesPerYear < 15000) {
    factors.milesPerYear = 5;
  }
  // else: 0 points for > 15,000 miles/year

  // Factor 5: Price vs MSRP (+0 to +15 points)
  // Good deals below MSRP are valuable
  if (listing.msrp && listing.price) {
    const percentBelowMsrp = ((listing.msrp - listing.price) / listing.msrp) * 100;

    if (percentBelowMsrp > 15) {
      factors.priceVsMsrp = 15;
    } else if (percentBelowMsrp > 10) {
      factors.priceVsMsrp = 10;
    } else if (percentBelowMsrp > 5) {
      factors.priceVsMsrp = 5;
    }
    // else: 0 points for at/above MSRP
  }

  // Factor 6: Price Drop (+0 to +15 points)
  // Active price reductions indicate motivated sellers
  if (listing.price_change_percent) {
    const dropPercent = Math.abs(listing.price_change_percent);

    if (dropPercent > 10) {
      factors.priceDrop = 15;
    } else if (dropPercent > 5) {
      factors.priceDrop = 10;
    } else if (dropPercent > 1) {
      factors.priceDrop = 5;
    }
  }

  // Factor 7: Model Preference (+5 to +10 points)
  // Preferred models get bonus points
  const model = listing.model?.toLowerCase() || '';

  if (model.includes('rav4') || model.includes('cr-v')) {
    factors.modelPreference = 10; // Top priority models
  } else if (model.includes('camry') || model.includes('accord')) {
    factors.modelPreference = 8; // High priority sedans
  } else {
    factors.modelPreference = 5; // Other models
  }

  // Factor 8: Photo Count (+5 or -5 points)
  // Well-documented listings are more trustworthy
  const photoCount = listing.photo_links?.length || 0;

  if (photoCount > 20) {
    factors.photoCount = 5;
  } else if (photoCount < 5) {
    factors.photoCount = -5; // Penalty for poor documentation
  }
  // else: 0 points for 5-20 photos

  // Factor 9: Highway MPG (+5 if > 35 MPG)
  // Fuel efficiency is valuable
  if (listing.highway_mpg && listing.highway_mpg > 35) {
    factors.highwayMpg = 5;
  }

  // Factor 10: Dealer Type (+3 if franchise)
  // Franchise dealers often have better warranties/service
  if (listing.dealer_type === 'franchise') {
    factors.dealerType = 3;
  }

  // Calculate total
  const total = Object.values(factors).reduce((sum, val) => sum + val, 0);

  return {
    total,
    factors,
  };
}

/**
 * Get a human-readable explanation of the priority score
 */
export function getPriorityScoreExplanation(breakdown: PriorityScoreBreakdown): string[] {
  const explanations: string[] = [];

  if (breakdown.factors.singleOwner > 0) {
    explanations.push(`+${breakdown.factors.singleOwner} Single owner`);
  }

  if (breakdown.factors.cleanTitle > 0) {
    explanations.push(`+${breakdown.factors.cleanTitle} Clean title`);
  }

  if (breakdown.factors.daysOnMarket > 0) {
    explanations.push(`+${breakdown.factors.daysOnMarket} Recently listed`);
  }

  if (breakdown.factors.milesPerYear > 0) {
    explanations.push(`+${breakdown.factors.milesPerYear} Low miles for age`);
  }

  if (breakdown.factors.priceVsMsrp > 0) {
    explanations.push(`+${breakdown.factors.priceVsMsrp} Below MSRP`);
  }

  if (breakdown.factors.priceDrop > 0) {
    explanations.push(`+${breakdown.factors.priceDrop} Price recently dropped`);
  }

  if (breakdown.factors.modelPreference > 0) {
    explanations.push(`+${breakdown.factors.modelPreference} Preferred model`);
  }

  if (breakdown.factors.photoCount > 0) {
    explanations.push(`+${breakdown.factors.photoCount} Well documented`);
  } else if (breakdown.factors.photoCount < 0) {
    explanations.push(`${breakdown.factors.photoCount} Few photos`);
  }

  if (breakdown.factors.highwayMpg > 0) {
    explanations.push(`+${breakdown.factors.highwayMpg} Fuel efficient`);
  }

  if (breakdown.factors.dealerType > 0) {
    explanations.push(`+${breakdown.factors.dealerType} Franchise dealer`);
  }

  return explanations;
}
```

**Update Adapter to Use Scoring:**

In `lib/marketcheck-adapter.ts`:
```typescript
import { calculatePriorityScore } from './priority-scoring';

export function transformMarketcheckToListingSummary(raw: any): ListingSummary {
  return {
    // ... other fields
    priority_score: calculatePriorityScore(raw),
    // ...
  };
}
```

### Testing Strategy

#### A. Code Error Testing
```bash
npm run build         # ✅ No TypeScript errors
npm run lint          # ✅ No ESLint errors
```

#### B. Runtime Error Testing

**Test 1: Scoring Validation**

Create `scripts/test-priority-scoring.ts`:
```typescript
#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { calculatePriorityScore, calculatePriorityScoreBreakdown, getPriorityScoreExplanation } from '@/lib/priority-scoring';

console.log('🧪 Testing Priority Scoring Algorithm...\n');

const data = JSON.parse(readFileSync('data/marketcheck-combined.json', 'utf-8'));
const listings = data.listings;

const scores: number[] = [];
const breakdowns: any[] = [];

// Test all 88 cars
for (const listing of listings) {
  const score = calculatePriorityScore(listing);
  const breakdown = calculatePriorityScoreBreakdown(listing);

  // Validate range
  if (score < 0 || score > 133) {
    console.error(`❌ ${listing.vin}: Score out of range: ${score}`);
    process.exit(1);
  }

  scores.push(score);
  breakdowns.push({ vin: listing.vin, ...breakdown });
}

console.log('✅ All scores in valid range (0-133)\n');

// Analyze distribution
scores.sort((a, b) => a - b);
const min = scores[0];
const max = scores[scores.length - 1];
const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
const median = scores[Math.floor(scores.length / 2)];

console.log('📈 Score Distribution:');
console.log(`   Min:    ${min}`);
console.log(`   Max:    ${max}`);
console.log(`   Avg:    ${avg.toFixed(1)}`);
console.log(`   Median: ${median}`);
console.log();

// Show top 5
console.log('🏆 Top 5 Highest Scoring Cars:');
breakdowns
  .sort((a, b) => b.total - a.total)
  .slice(0, 5)
  .forEach((b, i) => {
    const listing = listings.find((l: any) => l.vin === b.vin);
    console.log(`${i + 1}. ${listing.build.year} ${listing.build.make} ${listing.build.model}`);
    console.log(`   Score: ${b.total}`);
    const explanations = getPriorityScoreExplanation(b);
    explanations.forEach(exp => console.log(`   ${exp}`));
    console.log();
  });

// Show bottom 5
console.log('📉 Bottom 5 Lowest Scoring Cars:');
breakdowns
  .sort((a, b) => a.total - b.total)
  .slice(0, 5)
  .forEach((b, i) => {
    const listing = listings.find((l: any) => l.vin === b.vin);
    console.log(`${i + 1}. ${listing.build.year} ${listing.build.make} ${listing.build.model}`);
    console.log(`   Score: ${b.total}`);
    const explanations = getPriorityScoreExplanation(b);
    explanations.forEach(exp => console.log(`   ${exp}`));
    console.log();
  });

console.log('🎉 Priority scoring test complete!\n');

// Verify expected distribution
if (avg < 60 || avg > 90) {
  console.warn(`⚠️  Warning: Average score (${avg.toFixed(1)}) outside expected range (60-90)`);
}

if (max < 100) {
  console.warn(`⚠️  Warning: Max score (${max}) lower than expected (should be ~110-133)`);
}

process.exit(0);
```

Run: `npx tsx scripts/test-priority-scoring.ts`

**Expected Output:**
```
✅ All scores in valid range (0-133)
📈 Score Distribution:
   Min:    35-50
   Max:    110-133
   Avg:    70-80
   Median: 70-75
```

**Test 2: Factor Isolation**
```bash
# Each factor adds exact expected points
# Test in Node REPL:
node
> const { calculatePriorityScoreBreakdown } = require('./lib/priority-scoring');
> const car1 = { carfax_1_owner: true, /* ... */ };
> const car2 = { carfax_1_owner: false, /* ... */ };
> calculatePriorityScoreBreakdown(car1).factors.singleOwner === 20
true
> calculatePriorityScoreBreakdown(car2).factors.singleOwner === 0
true
```

#### C. Visual Verification

**Manual QA:**
```
Dashboard Sorting:
  [ ] Cars sorted by priority_score DESC by default
  [ ] Top 5 cars make logical sense:
    [ ] Mostly single-owner
    [ ] Low mileage for age
    [ ] RAV4/CR-V models preferred
    [ ] Recently listed (low DOM)
    [ ] Good prices (below MSRP or price drops)

  [ ] Bottom 5 cars make logical sense:
    [ ] Multi-owner
    [ ] High mileage for age
    [ ] Older listings
    [ ] At/above typical prices

Priority Badges:
  [ ] High-score badge (>100 pts) shows on top cars
  [ ] Badge color indicates priority level
  [ ] Tooltip shows score breakdown (if implemented)

Manual Verification:
  [ ] Click top 3 cars - verify they're actually good deals
  [ ] Check scoring factors match reality
  [ ] No obviously "bad" cars ranked at top
```

### Success Criteria
- ✅ `npm run build` passes
- ✅ All 88 cars score within 0-133 range
- ✅ Score distribution reasonable (avg ~70-80, max >100)
- ✅ Factor isolation tests pass
- ✅ Top 5 cars make logical sense
- ✅ Dashboard sorted correctly

### Completion Steps
```bash
git add lib/priority-scoring.ts lib/marketcheck-adapter.ts scripts/test-priority-scoring.ts
git commit -m "feat: implement priority scoring algorithm

- 10-factor scoring system (max 133 points)
- Single owner, clean title, DOM, miles/year
- Price vs MSRP, price drops, model preference
- Photo count, MPG, dealer type
- Score distribution: avg ~75, max ~120"
```

---

## Phase 7: Comprehensive E2E Testing

### ⚠️ Pre-Phase Checklist
- [ ] Phase 6 must be ✅ Complete
- [ ] Read this phase completely
- [ ] Verify: Dashboard sorts by priority correctly
- [ ] Verify: `npx tsx scripts/test-priority-scoring.ts` passes
- [ ] Create branch: `git checkout -b marketcheck-e2e-tests`

### Implementation

**Files to Update/Create:**

1. Update existing E2E tests for 88-car dataset
2. Create new Marketcheck-specific test suite
3. Add screenshot comparison tests

**Test 1: Update `tests/e2e/flows/01-landing-to-dashboard.test.ts`**

Already updated in Phase 3 - verify still passes.

**Test 2: Update `tests/e2e/flows/02-dashboard-filtering.test.ts`**

Add assertions for exact counts:
```typescript
// Honda filter
await selectFilter(page, 'make', 'Honda');
const hondaCount = await getVehicleCount(page);
expect(hondaCount).toBe(45); // Exact count

// Toyota filter
await selectFilter(page, 'make', 'Toyota');
const toyotaCount = await getVehicleCount(page);
expect(toyotaCount).toBe(43); // Exact count
```

**Test 3: Create `tests/e2e/flows/08-marketcheck-data-integrity.test.ts`**

```typescript
import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  waitForDashboardLoad,
  getVehicleCards,
  clickVehicleCard,
  getTextContent,
  type BrowserContext,
  type TestResult,
} from '../helpers';

const TEST_NAME = '08-marketcheck-data-integrity';
const BASE_URL = 'http://localhost:3001';

export async function runTest(): Promise<TestResult> {
  const startTime = Date.now();
  const screenshots: any[] = [];
  const errors: string[] = [];
  let context: BrowserContext | null = null;

  try {
    context = await launchBrowser();
    const { page } = context;

    // Test 1: Exact car count
    await navigateTo(page, `${BASE_URL}/dashboard`);
    await waitForDashboardLoad(page);

    const allCards = await getVehicleCards(page);
    if (allCards.length !== 88) {
      errors.push(`Expected 88 cars, got ${allCards.length}`);
    }

    // Test 2: Make distribution
    // Filter by Honda
    await page.select('select[name="make"]', 'Honda');
    await page.waitForTimeout(1000); // Wait for filter to apply
    const hondaCards = await getVehicleCards(page);
    if (hondaCards.length !== 45) {
      errors.push(`Expected 45 Hondas, got ${hondaCards.length}`);
    }

    // Filter by Toyota
    await page.select('select[name="make"]', 'Toyota');
    await page.waitForTimeout(1000);
    const toyotaCards = await getVehicleCards(page);
    if (toyotaCards.length !== 43) {
      errors.push(`Expected 43 Toyotas, got ${toyotaCards.length}`);
    }

    // Test 3: Image galleries
    await page.select('select[name="make"]', ''); // Clear filter
    await page.waitForTimeout(1000);

    for (let i = 0; i < Math.min(5, allCards.length); i++) {
      await clickVehicleCard(page, i);

      // Wait for images to load
      await page.waitForSelector('img', { timeout: 5000 });

      const images = await page.$$('img[src*="photo"], img[src*="http"]');
      if (images.length < 5) {
        errors.push(`Car ${i}: Only ${images.length} images (expected ≥5)`);
      }

      await page.goBack();
      await waitForDashboardLoad(page);
    }

    // Test 4: VIN case-insensitivity
    await navigateTo(page, `${BASE_URL}/dashboard/5YFBURHE5HP690324`);
    const vin1 = await getTextContent(page, 'h1');

    await navigateTo(page, `${BASE_URL}/dashboard/5yfburhe5hp690324`);
    const vin2 = await getTextContent(page, 'h1');

    if (vin1 !== vin2) {
      errors.push('VIN lookup is case-sensitive (should be case-insensitive)');
    }

    // Test 5: Priority sorting
    await navigateTo(page, `${BASE_URL}/dashboard`);
    await waitForDashboardLoad(page);

    const firstCard = allCards[0];
    const lastCard = allCards[allCards.length - 1];

    // First card should have higher priority than last
    // (This is a basic check - actual scores are tested in unit tests)

    const duration = Date.now() - startTime;
    return {
      name: TEST_NAME,
      passed: errors.length === 0,
      duration,
      screenshots,
      errors,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    errors.push(`Test failed: ${error instanceof Error ? error.message : String(error)}`);

    return {
      name: TEST_NAME,
      passed: false,
      duration,
      screenshots,
      errors,
    };
  } finally {
    if (context) {
      await closeBrowser(context);
    }
  }
}

if (require.main === module) {
  runTest()
    .then((result) => {
      console.log(result.passed ? '✅ Test passed' : '❌ Test failed');
      process.exit(result.passed ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
```

**Test 4: Screenshot Comparison**

Create `scripts/test-visual-regression.ts`:
```typescript
#!/usr/bin/env tsx
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Visual Regression Testing...\n');

const screenshotDir = 'tests/screenshots';
const baselineDir = join(screenshotDir, 'baseline');
const currentDir = join(screenshotDir, '01-landing-to-dashboard');

// Compare dashboard screenshot
const baselinePath = join(baselineDir, 'dashboard-loaded.png');
const currentPath = join(currentDir, 'dashboard-loaded.png');

if (!existsSync(baselinePath)) {
  console.log('⚠️  No baseline found, skipping visual regression');
  console.log('   Run with SAVE_BASELINE=1 to create baseline');
  process.exit(0);
}

const img1 = PNG.sync.read(readFileSync(baselinePath));
const img2 = PNG.sync.read(readFileSync(currentPath));

if (img1.width !== img2.width || img1.height !== img2.height) {
  console.log('⚠️  Image dimensions changed');
  console.log(`   Baseline: ${img1.width}x${img1.height}`);
  console.log(`   Current: ${img2.width}x${img2.height}`);
}

const diff = new PNG({ width: img1.width, height: img1.height });

const numDiffPixels = pixelmatch(
  img1.data,
  img2.data,
  diff.data,
  img1.width,
  img1.height,
  { threshold: 0.1 }
);

const diffPercent = (numDiffPixels / (img1.width * img1.height)) * 100;

console.log(`📊 Pixel diff: ${numDiffPixels} (${diffPercent.toFixed(2)}%)`);

// Allow up to 5% difference (timestamps, animations, etc.)
if (diffPercent > 5) {
  console.log('❌ Visual regression detected (>5% difference)');
  process.exit(1);
}

console.log('✅ Visual regression test passed\n');
process.exit(0);
```

### Testing Strategy

#### A. Code Error Testing
```bash
npm run build         # ✅ No TypeScript errors
npm run lint          # ✅ No ESLint errors
```

#### B. Runtime Error Testing

**Run Full Test Suite:**
```bash
# Start dev server
npm run dev

# Run all E2E tests (in another terminal)
npm run test:ui

# Run new data integrity test
npm run test:e2e:08  # Add to package.json: "test:e2e:08": "ts-node tests/e2e/flows/08-marketcheck-data-integrity.test.ts"
```

**Expected Results:**
```
Test 01: Landing to Dashboard - ✅ PASSED
Test 02: Dashboard Filtering - ✅ PASSED
Test 03: Vehicle Details - ✅ PASSED
Test 04: Review System - ✅ PASSED
Test 05: VIN Decoder - ✅ PASSED
Test 06: Error States - ✅ PASSED
Test 08: Marketcheck Data Integrity - ✅ PASSED

All tests passed!
```

#### C. Visual Verification

**Manual QA (Final Pass):**
```
Complete User Flow:
  [ ] Landing page loads
  [ ] Click "View Dashboard"
  [ ] Dashboard shows 88 cars
  [ ] All images load (or show fallback)
  [ ] Filter by Honda → 45 cars
  [ ] Filter by Toyota → 43 cars
  [ ] Clear filters → 88 cars
  [ ] Click top-ranked car
  [ ] Detail page loads completely
  [ ] All sections visible
  [ ] Photo gallery works
  [ ] Back to dashboard
  [ ] Filter by single-owner → 32 cars
  [ ] Sort by price → lowest first
  [ ] Click car, verify details
  [ ] No console errors throughout

Responsive Testing:
  [ ] Mobile (375px): All pages work
  [ ] Tablet (768px): All pages work
  [ ] Desktop (1920px): All pages work
  [ ] No horizontal scroll
  [ ] Touch targets ≥44px on mobile

Browser Testing:
  [ ] Chrome: All tests pass
  [ ] Firefox: All tests pass
  [ ] Safari: All tests pass (if Mac available)
  [ ] Edge: All tests pass (if Windows available)
```

### Success Criteria
- ✅ `npm run build` passes
- ✅ All E2E tests pass (01-06, 08)
- ✅ Data integrity test passes (exact counts)
- ✅ Visual regression test passes (<5% diff)
- ✅ Manual QA 100% complete
- ✅ Zero console errors

### Completion Steps
```bash
git add tests/e2e/flows/08-marketcheck-data-integrity.test.ts scripts/test-visual-regression.ts
git commit -m "test: add comprehensive E2E test suite for Marketcheck data

- Data integrity tests (exact counts)
- VIN case-insensitivity test
- Image gallery coverage
- Visual regression testing
- All tests passing"
```

---

## Phase 8: Production Deployment & Monitoring

### ⚠️ Pre-Phase Checklist
- [ ] ALL previous phases ✅ Complete
- [ ] Read this phase completely
- [ ] Verify: All E2E tests passing locally
- [ ] Verify: No console errors in dev
- [ ] Verify: Manual QA 100% complete
- [ ] **CRITICAL:** Create backup branch: `git branch marketcheck-backup`
- [ ] Create branch: `git checkout -b marketcheck-production`

### Implementation

**Pre-Deployment Checks:**

1. **Environment Variables**
```bash
# Verify all env vars set in Vercel
vercel env ls

# Required:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

2. **Build Verification**
```bash
# Clean build
rm -rf .next
npm run build

# Check for warnings
# Should complete without errors
```

3. **Production Build Test**
```bash
# Test production build locally
npm run start

# Open http://localhost:3000
# Verify 88 cars load correctly
```

### Deployment Steps

1. **Merge to Main**
```bash
# Switch to main
git checkout main

# Merge marketcheck changes
git merge marketcheck-production

# Push to GitHub
git push origin main
```

2. **Deploy to Vercel**
```bash
# Deploy to production
vercel --prod

# Or let GitHub integration auto-deploy
```

3. **Wait for Deployment**
```bash
# Monitor deployment
vercel logs --follow

# Watch for errors
```

### Testing Strategy

#### A. Post-Deployment Smoke Tests

**Test 1: Production Health Check**
```bash
# Verify site loads
curl -I https://yourtoyotapicks.vercel.app
# Expected: HTTP 200 OK

# Verify dashboard loads
curl -s https://yourtoyotapicks.vercel.app/dashboard | grep -o "vehicle-card" | wc -l
# Expected: 88

# Verify detail page loads
curl -I https://yourtoyotapicks.vercel.app/dashboard/5YFBURHE5HP690324
# Expected: HTTP 200 OK
```

**Test 2: Production E2E Tests**
```bash
# Run E2E tests against production
TEST_URL=https://yourtoyotapicks.vercel.app npm run test:ui
```

**Expected:** All tests pass

**Test 3: Database Query Check**
```bash
# Verify Supabase queries working in production
# Check Vercel logs for any database errors
vercel logs --since 10m | grep -i error

# Should see no Supabase connection errors
```

#### B. Monitoring Setup

**Vercel Analytics:**
- [ ] Open Vercel dashboard
- [ ] Enable Analytics (if not already)
- [ ] Check Core Web Vitals
- [ ] Verify no spike in errors

**Supabase Monitoring:**
- [ ] Open Supabase dashboard
- [ ] Check Database → Usage
- [ ] Verify query count increasing
- [ ] Check for slow queries (>1s)

**Error Tracking:**
```bash
# Check Vercel logs for errors
vercel logs --since 1h | grep -i error

# Should be minimal/zero errors
```

**Set Up Alerts:**
- [ ] Vercel: Email on deployment failures
- [ ] Vercel: Alert if error rate >1%
- [ ] Supabase: Alert if query latency >500ms
- [ ] Supabase: Alert if connection failures

#### C. Visual Verification (Production)

**Manual QA Checklist:**
```
Production Site:
  [ ] Visit https://yourtoyotapicks.vercel.app
  [ ] Landing page loads within 2 seconds
  [ ] Click "View Dashboard"
  [ ] Dashboard loads 88 cars within 3 seconds
  [ ] All images load (or show fallback)
  [ ] No layout shifts (CLS < 0.1)

Random Sampling:
  [ ] Click 5 random cars
  [ ] All detail pages load
  [ ] All sections visible
  [ ] Photo galleries work
  [ ] Back button works

Filtering:
  [ ] Filter by Honda → 45 cars
  [ ] Filter by Toyota → 43 cars
  [ ] Single-owner filter → 32 cars
  [ ] Price range filter works
  [ ] All filters reset correctly

Mobile (use DevTools):
  [ ] Open dashboard on mobile view (375px)
  [ ] All cards visible
  [ ] Filters accessible
  [ ] Detail page scrolls correctly
  [ ] No horizontal scroll

Performance:
  [ ] Open DevTools → Lighthouse
  [ ] Run audit
  [ ] Performance score ≥80
  [ ] Accessibility score ≥90
  [ ] Best Practices score ≥90
  [ ] SEO score ≥80

Error Monitoring:
  [ ] Open Console → No errors
  [ ] Open Network → All requests 200 OK
  [ ] No failed Supabase queries
```

### Success Criteria
- ✅ Production build succeeds
- ✅ Deployment completes without errors
- ✅ Smoke tests pass (curl, E2E)
- ✅ 88 cars visible in production
- ✅ Database queries successful
- ✅ Zero errors in first hour (Vercel logs)
- ✅ Manual production QA 100% pass
- ✅ Lighthouse scores meet targets
- ✅ Monitoring/alerts configured

### Completion Steps
```bash
# Tag successful deployment
git tag -a marketcheck-v1.0 -m "Production deployment: Marketcheck data integration complete"
git push origin marketcheck-v1.0

# Update progress table in this document
# Mark Phase 8: ✅ Complete

# Update CLAUDE.md to reflect new state:
# - Database: ✅ Connected to production
# - Data source: 88 real Marketcheck listings
# - Mock data: Fallback only
```

### Post-Deployment Monitoring

**First 24 Hours:**
- [ ] Check Vercel logs every 2 hours
- [ ] Monitor Supabase query count
- [ ] Watch for user-reported issues
- [ ] Check error rate (should be <0.5%)

**First Week:**
- [ ] Daily log review
- [ ] Weekly performance check
- [ ] User feedback collection
- [ ] Database query optimization if needed

---

## Rollback Procedures

### Emergency Rollback (If Critical Issues)

**Option 1: Vercel Rollback (Fastest)**
```bash
vercel rollback
# Reverts to previous deployment immediately
```

**Option 2: Git Revert**
```bash
git revert HEAD
git push origin main
# Vercel will auto-deploy reverted version
```

**Option 3: Feature Flag Disable**

Update `app/dashboard/page.tsx`:
```typescript
// Add emergency feature flag
const USE_MARKETCHECK = process.env.NEXT_PUBLIC_USE_MARKETCHECK !== 'false';

if (USE_MARKETCHECK) {
  // Try Marketcheck...
} else {
  // Use mock data
}
```

Then in Vercel dashboard:
- Add env var: `NEXT_PUBLIC_USE_MARKETCHECK=false`
- Redeploy

### When to Rollback

🚨 **Immediate rollback if:**
- Database queries failing (>10% error rate)
- Page load time >10 seconds
- Critical features broken (filters, detail pages)
- Data loss detected
- Security issue discovered

⚠️ **Consider rollback if:**
- Minor visual issues (can fix forward)
- Single filter not working (disable filter)
- Slow query on one page (optimize later)
- <5% error rate (investigate, may not need rollback)

---

## Final Checklist

Before marking project COMPLETE:

### Documentation
- [ ] All progress table entries updated
- [ ] Git commits for all 8 phases
- [ ] CLAUDE.md updated with new state
- [ ] This plan marked as ✅ COMPLETE

### Code Quality
- [ ] No TODO comments in code
- [ ] No console.log() statements (except intentional logging)
- [ ] All TypeScript strict checks pass
- [ ] ESLint warnings resolved

### Testing
- [ ] All E2E tests passing (01-08)
- [ ] All unit tests passing (adapter, queries, scoring)
- [ ] Visual regression tests passing
- [ ] Manual QA 100% complete

### Production
- [ ] Deployed to production
- [ ] 88 cars visible
- [ ] Zero critical errors in logs
- [ ] Monitoring configured
- [ ] Alerts set up

### Cleanup
- [ ] Delete feature branches (keep backup)
- [ ] Close related GitHub issues (if any)
- [ ] Archive old mock data (don't delete)
- [ ] Update README (if needed)

---

## Success Metrics

**Technical Metrics:**
- ✅ Build time: <2 minutes
- ✅ Page load time: <3 seconds
- ✅ Database query time: <500ms
- ✅ Error rate: <0.5%
- ✅ Test coverage: 100% E2E, 90%+ unit

**User Experience:**
- ✅ 88 real cars displayed
- ✅ All 67 fields utilized in UI
- ✅ Filters work accurately
- ✅ Priority scoring ranks cars logically
- ✅ Mobile responsive
- ✅ Zero console errors

**Data Quality:**
- ✅ 0 null critical fields
- ✅ 100% VIN coverage
- ✅ 98.9% photo coverage (87/88 cars)
- ✅ Case-insensitive VIN lookups
- ✅ Accurate counts (45 Honda, 43 Toyota, 32 single-owner)

---

## Completion

**Date Completed:** _____________
**Total Time:** _______ hours
**Final Status:** ✅ SUCCESS / ⚠️ PARTIAL / ❌ FAILED

**Notes:**
_________________________________________
_________________________________________
_________________________________________

**Signed off by:** Claude Code
**Next Steps:** Schedule weekly data refresh, begin Phase 2 enhancements
