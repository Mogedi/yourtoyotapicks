# MarketCheck API Integration Strategy

## Overview

This document outlines the strategy for integrating MarketCheck API into YourToyotaPicks using the **Free Tier**, focused on the Atlanta metro area. The goal is to efficiently use the 500 monthly API calls to build a local database of 100-250 vehicles for development and testing.

## API Tier: Free Plan

### Free Tier Limits
- **Cost**: $0/month
- **API Calls**: 500 per month (~16/day)
- **Rate Limit**: 5 calls/second
- **Geographic Restriction**: 100 mile radius
- **Features**: Access to all API endpoints, 3rd party APIs

### Why Free Tier Works for This Phase

✅ **Limited geographic scope** - Atlanta area fits within 100 mile radius
✅ **One-time data pull** - We'll fetch data a few times, then work offline
✅ **Development focus** - Build features against real data without burning quota
✅ **Cost-effective** - Test API quality before committing to $299-749/month

## Geographic Focus: Atlanta Metro Area

### Primary Search Zones

**Atlanta, GA (33.7490° N, 84.3880° W)**
- 100 mile radius covers:
  - Atlanta metro (primary market)
  - Athens, GA
  - Macon, GA
  - Gainesville, GA
  - Parts of Alabama border

### Target ZIP Codes for Search
- **30301-30399**: Atlanta proper
- **30060**: Marietta (north suburbs)
- **30004**: Alpharetta (affluent north)
- **30135**: Douglasville (west)
- **30294**: Ellenwood (south)

**Strategy**: Use 2-3 strategic ZIP codes to maximize coverage without redundant calls.

## Data Collection Strategy

### Phase 1: Initial Data Pull (Week 1)

**Goal**: Collect 100-250 vehicles matching your criteria

**API Call Budget**: 200-300 calls

**Search Parameters**:
```javascript
{
  // Geographic
  zip: "30301",           // Atlanta center
  radius: 100,            // Max free tier radius

  // Vehicle filters
  make: ["Toyota", "Honda"],
  model: ["RAV4", "CR-V", "Camry", "Accord", "Highlander", "Pilot"],
  year_min: 2015,
  year_max: 2023,
  price_min: 10000,
  price_max: 20000,
  mileage_max: 100000,

  // Quality filters
  title_status: "clean",
  accidents: 0,
  owners: [1, 2],

  // Pagination
  rows: 50,               // Max per request
  start: 0
}
```

**Execution Plan**:

1. **Day 1: Toyota RAV4** (~3-5 calls)
   - Search Atlanta area
   - Fetch 50-100 results
   - Store VINs in database

2. **Day 2: Honda CR-V** (~3-5 calls)
   - Search Atlanta area
   - Fetch 50-100 results
   - Store VINs in database

3. **Day 3: Other Priority Models** (~5-10 calls)
   - Camry, Accord, Highlander, Pilot
   - Fetch 50-100 more results
   - Store VINs in database

**Total API Calls Used**: ~150 calls
**Expected Results**: 150-250 vehicles
**Remaining Quota**: 350 calls for the month

### Phase 2: Incremental Updates (Weekly)

**Goal**: Refresh data with new listings

**API Call Budget**: 50-100 calls per week

**Strategy**:
- Run searches once per week
- Focus on new listings (filter by `days_on_market: <7`)
- Update existing records if VIN already in database
- Add new vehicles if not present

**Monthly Usage**:
- Initial pull: 150 calls
- Weekly refreshes: 4 × 50 = 200 calls
- **Total: 350 calls** (within 500 limit)

### Phase 3: Development Mode (Ongoing)

**Goal**: Build features using local database

**No API calls needed**:
- All filtering logic works on local data
- Review system development
- Priority scoring algorithm
- UI/UX refinement
- E2E testing

**When to pull new data**:
- Once per week for freshness
- Before major feature demos
- When testing new filter criteria

## Database Schema for MarketCheck Data

### New Table: `marketcheck_listings`

```sql
CREATE TABLE marketcheck_listings (
  id BIGSERIAL PRIMARY KEY,
  vin VARCHAR(17) UNIQUE NOT NULL,

  -- Basic info
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  trim VARCHAR(100),

  -- Pricing
  price INTEGER NOT NULL,

  -- Mileage
  mileage INTEGER NOT NULL,

  -- Location
  zip_code VARCHAR(10),
  city VARCHAR(100),
  state VARCHAR(2),
  dealer_name VARCHAR(255),

  -- Quality indicators
  title_status VARCHAR(50),
  accidents INTEGER DEFAULT 0,
  owners INTEGER,
  days_on_market INTEGER,

  -- History
  is_cpo BOOLEAN DEFAULT false,
  service_records_available BOOLEAN DEFAULT false,

  -- MarketCheck metadata
  listing_id VARCHAR(100) UNIQUE,
  source VARCHAR(50),
  scraped_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  -- Raw JSON (for debugging)
  raw_data JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_marketcheck_make_model ON marketcheck_listings(make, model);
CREATE INDEX idx_marketcheck_price ON marketcheck_listings(price);
CREATE INDEX idx_marketcheck_mileage ON marketcheck_listings(mileage);
CREATE INDEX idx_marketcheck_zip ON marketcheck_listings(zip_code);
CREATE INDEX idx_marketcheck_scraped_at ON marketcheck_listings(scraped_at);
```

### Migration from Mock Data

The existing `vehicles` table can remain for reviews/user data.

**Two-table approach**:
1. `marketcheck_listings` - Raw data from API
2. `vehicles` - User-curated data with reviews

**Join pattern**:
```sql
SELECT
  ml.*,
  v.review_score,
  v.review_notes,
  v.is_favorited
FROM marketcheck_listings ml
LEFT JOIN vehicles v ON ml.vin = v.vin
WHERE ml.is_active = true
ORDER BY v.priority_score DESC NULLS LAST;
```

## API Call Conservation Tactics

### 1. **Aggressive Caching**
- Store full JSON response in `raw_data` column
- Never re-fetch same VIN unless explicitly needed
- Cache API responses in file system during development

### 2. **Smart Pagination**
- Request maximum rows per call (50)
- Only fetch additional pages if needed
- Track which searches have been exhausted

### 3. **Deduplication**
- Check VIN existence before storing
- Update `last_seen` timestamp on duplicates
- Don't count duplicates as "new" data

### 4. **Batch Operations**
- Collect all VINs first, then process
- Avoid incremental API calls during development
- Use database queries for filtering, not API filters

### 5. **Development Without API**
```bash
# Export database to JSON for offline work
npm run export:listings

# Use exported JSON for development
# Re-import when needed
npm run import:listings
```

## Implementation Phases

### Phase 1: API Integration (Week 1-2)
- [ ] Set up MarketCheck API client (`lib/marketcheck.ts`)
- [ ] Create database migration for `marketcheck_listings` table
- [ ] Build data ingestion script (`scripts/fetch-marketcheck-data.ts`)
- [ ] Run initial data pull (150 calls)
- [ ] Verify data quality and coverage

### Phase 2: Database Integration (Week 3)
- [ ] Update `lib/supabase.ts` to query `marketcheck_listings`
- [ ] Migrate dashboard to use real data
- [ ] Keep mock data as fallback
- [ ] Test E2E flows with real data

### Phase 3: Incremental Updates (Week 4)
- [ ] Create weekly refresh script
- [ ] Add "last updated" timestamp to UI
- [ ] Implement soft-delete for stale listings (not seen in 30 days)
- [ ] Monitor API quota usage

### Phase 4: Development Mode (Ongoing)
- [ ] Export data to JSON for offline work
- [ ] Build features without API calls
- [ ] Periodic refresh (weekly) only

## Cost Analysis

### Free Tier Costs
- **Subscription**: $0
- **Data fees**: $0
- **Total**: $0/month

### Upgrade Decision Points

**Consider upgrading to Basic ($299/month) when**:
- You want to expand beyond Atlanta (100 mile limit)
- You need daily updates instead of weekly
- You're ready to productionize with automated cron jobs

**Consider upgrading to Standard ($749/month) when**:
- You want nationwide coverage
- You need real-time updates (multiple times per day)
- You're launching SaaS version (Phase 4)

### Current Plan: Stay on Free Tier
- Atlanta focus provides sufficient inventory
- Weekly updates are adequate for personal use
- Development work happens on local database
- Can upgrade anytime when ready

## API Usage Tracking

### Create Usage Monitor

```typescript
// lib/marketcheck-usage.ts
export async function trackAPICall(endpoint: string, params: any) {
  await supabase.from('api_usage').insert({
    service: 'marketcheck',
    endpoint,
    params: JSON.stringify(params),
    called_at: new Date().toISOString()
  });
}

export async function getMonthlyUsage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('api_usage')
    .select('*', { count: 'exact' })
    .eq('service', 'marketcheck')
    .gte('called_at', startOfMonth.toISOString());

  return data?.length || 0;
}

export async function canMakeAPICall() {
  const usage = await getMonthlyUsage();
  const limit = 500; // Free tier limit
  return usage < limit;
}
```

### Usage Dashboard Command

```bash
# Check current API usage
npm run check:api-usage

# Example output:
# MarketCheck API Usage (January 2025)
# Calls made: 342 / 500
# Remaining: 158 calls
# Daily average: 15.5 calls/day
# Projected end-of-month: 465 calls
```

## Timeline & Milestones

### Week 1-2: Setup & Initial Pull
- **Goal**: Get 150-250 vehicles in database
- **API Calls**: 150-200
- **Deliverable**: Working MarketCheck integration

### Week 3-4: Integration & Testing
- **Goal**: Dashboard running on real data
- **API Calls**: 50-100 (weekly refresh)
- **Deliverable**: E2E tests passing with real data

### Month 2-3: Development Mode
- **Goal**: Build all Phase 2-3 features
- **API Calls**: 50-100/month (maintenance only)
- **Deliverable**: Polished app ready for daily use

### Month 4+: Production Decision
- **Goal**: Decide on upgrade to paid tier
- **API Calls**: N/A (either upgrade or continue weekly pulls)
- **Deliverable**: Production app or SaaS pivot

## Success Metrics

### Data Quality
- ✅ 100-250 vehicles in database
- ✅ 80%+ match your filter criteria
- ✅ VIN accuracy: 100%
- ✅ Fresh data (last 30 days)

### API Efficiency
- ✅ Stay under 500 calls/month
- ✅ <150 calls for initial pull
- ✅ <50 calls per weekly refresh
- ✅ Zero redundant calls (deduplication working)

### Development Velocity
- ✅ No API dependency for feature development
- ✅ Local database supports all testing
- ✅ Weekly data refresh is sufficient

## Risks & Mitigations

### Risk 1: Insufficient Data Volume
**Problem**: <100 vehicles in Atlanta area
**Mitigation**: Expand search to nearby metros (Augusta, Savannah) within 100 mile radius

### Risk 2: API Quota Exhaustion
**Problem**: Hit 500 call limit mid-month
**Mitigation**: Implement `canMakeAPICall()` guard, export data to JSON for offline work

### Risk 3: Stale Data
**Problem**: Weekly updates miss fast-moving inventory
**Mitigation**: Acceptable for development phase; upgrade to paid tier for production

### Risk 4: API Quality Issues
**Problem**: MarketCheck data is incomplete/inaccurate
**Mitigation**: Test with free tier before committing to $299/month; have fallback APIs ready (Auto.dev, CarGurus)

## Next Steps

1. **Set up MarketCheck account** - Get API key
2. **Create API client** - Build `lib/marketcheck.ts`
3. **Database migration** - Add `marketcheck_listings` table
4. **Initial data pull** - Fetch 150-250 Atlanta vehicles
5. **Verify data quality** - Ensure it matches filter criteria
6. **Update dashboard** - Switch from mock data to real data
7. **Document findings** - Log API response quality, data coverage

## Marketcheck API Endpoints - Comprehensive Analysis

### Priority 1: ESSENTIAL (Will Definitely Use)

These endpoints are core to your use case of finding and analyzing used Toyota/Honda vehicles.

#### 1. **GET /v2/search/car/active** ⭐⭐⭐
**Purpose**: Primary search endpoint for used car inventory
**Why Essential**: This is your main data source - search Toyota/Honda vehicles by make, model, year, price, mileage, location
**Estimated Calls**: 10-15 calls for initial 250 car pull
**Parameters You'll Use**:
- `make`: Toyota, Honda
- `model`: RAV4, CR-V, Camry, Accord, etc.
- `year`: 2015-2023
- `price`: $10K-$20K
- `zip`: Atlanta area codes
- `radius`: 100 miles
- `rows`: 50 (max per request)
- `start`: 0, 50, 100, etc. (pagination)

**Call Calculation**:
- Assuming 50 results per call
- 250 cars ÷ 50 = **5 calls minimum**
- With filtering/pagination: **10-15 calls realistic**

---

#### 2. **GET /v2/listing/car/{id}** ⭐⭐⭐
**Purpose**: Get full details for a specific car listing
**Why Essential**: After search results, you'll need complete data for each car
**Estimated Calls**: 250 calls (1 per car)
**What It Returns**:
- Complete vehicle specs
- Pricing details
- Dealer information
- Vehicle history (if available)
- Title status, accidents, owners

**Call Calculation**:
- **250 calls** (1 per vehicle)

---

#### 3. **GET /v2/listing/car/{id}/media** ⭐⭐
**Purpose**: Get photos and videos for each listing
**Why Important**: You currently use IMAGIN.studio for mock images, but real listing photos are better
**Estimated Calls**: 250 calls (1 per car)
**What It Returns**:
- Multiple photo URLs
- Video URLs (if available)
- Photo metadata

**Call Calculation**:
- **250 calls** (1 per vehicle)
- **Alternative**: You could skip this and continue using IMAGIN.studio to save calls

---

#### 4. **GET /v2/history/car/{vin}** ⭐⭐
**Purpose**: Get listing history for a VIN (price changes, how long on market)
**Why Important**: Critical for your priority scoring - cars with price drops or long market time are red flags
**Estimated Calls**: 250 calls (1 per car)
**What It Returns**:
- Price history
- Days on market across different dealers
- Previous listings

**Call Calculation**:
- **250 calls** (1 per vehicle)

---

### Priority 2: CONSIDER FOR FUTURE

These endpoints would enhance your app but aren't critical for initial launch.

#### 5. **GET /v2/decode/car/{vin}/specs** ⭐
**Purpose**: Basic VIN decoder (free alternative to paid services)
**When to Use**: Validate VINs, get factory specs for comparison
**Estimated Calls**: 250 calls (1 per car)
**Why Future**: You can use this to validate the data from the main listing, but not critical if listing data is complete

---

#### 6. **GET /v2/dealer/car/{id}**
**Purpose**: Get detailed dealer information
**When to Use**: Build dealer reputation scoring, filter by dealer quality
**Estimated Calls**: Variable (unique dealers only, ~50-100 calls)
**Why Future**: Nice-to-have for dealer filtering, but not core to vehicle evaluation

---

#### 7. **GET /v2/search/car/recents**
**Purpose**: Get recently listed cars (last 90 days)
**When to Use**: Weekly refresh to find new inventory
**Estimated Calls**: 5-10 calls per refresh
**Why Future**: Great for incremental updates after initial pull

---

#### 8. **GET /v2/mds** (Market Days Supply)
**Purpose**: See how long similar cars take to sell
**When to Use**: Enhanced priority scoring - high MDS = overpriced/undesirable
**Estimated Calls**: Could batch multiple VINs per call
**Why Future**: Advanced market analysis feature

---

#### 9. **GET /v2/sales/car**
**Purpose**: Get sales stats for similar cars (last 90 days)
**When to Use**: Price validation, market trends
**Estimated Calls**: 5-10 calls (by make/model/year combinations)
**Why Future**: Would enhance your "fair price" analysis

---

### Priority 3: NICE TO HAVE (Low Priority)

#### 10. **GET /v2/search/car/auto-complete**
**Purpose**: Auto-complete for search terms
**When to Use**: If building a user-facing search UI
**Why Low Priority**: Your filtering is pre-defined (Toyota/Honda models)

---

#### 11. **GET /v2/listing/car/{id}/extra**
**Purpose**: Get options, features, seller comments
**When to Use**: Detailed feature comparison
**Why Low Priority**: Nice detail but not critical for initial filtering

---

#### 12. **GET /v2/dealerships/car**
**Purpose**: Get dealership details
**When to Use**: Building dealer directory
**Why Low Priority**: Dealer-level filtering not in your initial scope

---

#### 13. **GET /v2/popular/cars**
**Purpose**: See what's trending nationally/locally
**When to Use**: Market research, blog content
**Why Low Priority**: Interesting data but not actionable for your use case

---

#### 14. **GET /v2/predict/car/price** and related pricing APIs
**Purpose**: AI-powered price prediction
**When to Use**: Validate if a car is priced fairly
**Why Low Priority**: You can build simpler price scoring logic without this

---

#### 15. **GET /v2/search/car/incentive/oem** (OEM Incentives)
**Purpose**: Find manufacturer rebates/incentives
**When to Use**: If expanding to new cars
**Why Low Priority**: You're focused on used cars only

---

### Priority 4: NOT WORTH YOUR TIME

These endpoints are irrelevant to your use case:

- **Private Party Listings** (`/fsbo/*`) - You're focused on dealer inventory
- **Auction Listings** (`/auction/*`) - Not relevant for retail buyers
- **Heavy Equipment APIs** - Wrong vertical
- **Motorcycle APIs** - Wrong vertical
- **RV APIs** - Wrong vertical
- **Dealer Syndication APIs** - For dealers, not buyers
- **Facebook/Google VA Feed** - Dealer tools
- **AutoRecalls API** - Available free elsewhere (NHTSA)
- **VINData Title Check** - Paid third-party service you probably won't use
- **CarsXE Plate Decoder** - Not useful for VIN-based search
- **CRM Cleanse API** - For dealer CRM systems

---

## RECOMMENDED API CALL STRATEGY FOR 250 CARS

### Scenario 1: Maximum Detail (Aggressive Approach)
**Goal**: Get everything possible about each car

| Endpoint | Purpose | Calls Needed |
|----------|---------|--------------|
| `/v2/search/car/active` | Find 250 cars | 10-15 calls |
| `/v2/listing/car/{id}` | Full details per car | 250 calls |
| `/v2/listing/car/{id}/media` | Photos per car | 250 calls |
| `/v2/history/car/{vin}` | Price history per car | 250 calls |
| **TOTAL** | | **760-765 calls** |

**Verdict**: ❌ **EXCEEDS FREE TIER** (500 calls/month)

---

### Scenario 2: Balanced Approach (Recommended)
**Goal**: Get essential data, skip media (use IMAGIN.studio instead)

| Endpoint | Purpose | Calls Needed |
|----------|---------|--------------|
| `/v2/search/car/active` | Find 250 cars | 10-15 calls |
| `/v2/listing/car/{id}` | Full details per car | 250 calls |
| `/v2/history/car/{vin}` | Price history per car | 250 calls |
| **TOTAL** | | **510-515 calls** |

**Verdict**: ⚠️ **SLIGHTLY OVER FREE TIER**

**Optimization**: Skip history for cars that don't pass initial filters
- Filter down to 150 high-quality cars
- Only fetch history for those 150
- **New Total**: 10 + 250 + 150 = **410 calls** ✅

---

### Scenario 3: Minimal Approach (Conservative)
**Goal**: Get basic data only, reduce initial pull to 150 cars

| Endpoint | Purpose | Calls Needed |
|----------|---------|--------------|
| `/v2/search/car/active` | Find 150 cars | 6-10 calls |
| `/v2/listing/car/{id}` | Full details per car | 150 calls |
| **TOTAL** | | **156-160 calls** |

**Verdict**: ✅ **WELL WITHIN FREE TIER** - Leaves 340 calls for monthly updates

---

## FINAL RECOMMENDATION

### Two-Phase Approach (Smart Strategy)

**Phase 1: Initial Pull (Week 1)**
1. **Search** - 10 calls → Get 250-300 car IDs
2. **Details** - 250 calls → Get full listing data for all
3. **Filter Locally** - Use your existing filters to identify top 100-150 cars
4. **History** - 150 calls → Get price history for filtered cars only
5. **Total: ~410 calls** ✅

**Phase 2: Weekly Refresh (Ongoing)**
1. **Search** - 5 calls → Get new listings from last 7 days
2. **Details** - ~25 calls → Get data for new listings only
3. **History** - ~25 calls → Get history for promising new cars
4. **Total: ~55 calls/week** → 220 calls/month

**Monthly Total: 410 (initial) + 220 (refreshes) = 630 calls**

⚠️ **This exceeds free tier in Month 1**, but you could:
- **Option A**: Do initial pull in Month 1 (410 calls), start weekly refreshes in Month 2
- **Option B**: Reduce initial pull to 150 cars (270 calls), leaving room for refreshes
- **Option C**: Start with 250 cars, skip weekly refreshes for first month (just monitoring)

---

## Key Insights

### API Call Efficiency
- **Most expensive**: Getting full details (`/listing/car/{id}`) - 1 call per car
- **Most efficient**: Search endpoint - 50 results per call
- **Skip media calls**: Use IMAGIN.studio instead (saves 250 calls!)

### Data Quality Notes
- Search results include basic info (price, mileage, location)
- Full listing endpoint needed for title status, accidents, owners
- History endpoint critical for "days on market" and price trends
- Media endpoint optional if you have good fallback images

### Budget Recommendations
1. **Stay on Free Tier**: Start with 150 cars, weekly refreshes
2. **Upgrade to Basic ($299/mo)**: If you want 250+ cars + daily updates
3. **Future**: When expanding beyond Atlanta, you'll need Standard tier

---

## Related Documentation

- [Database Setup](../setup/DATABASE_SETUP.md) - Supabase schema
- [Mock Data Guide](../guides/MOCK_DATA_GUIDE.md) - Current mock data system
- [Technical Spec](../TECHNICAL_SPEC.md) - Overall architecture
- [API Pricing Analysis](./MARKETCHECK_PRICING_ANALYSIS.md) - Full tier comparison

---

**Last Updated**: 2025-10-12
**Status**: Planning Phase - API Endpoint Analysis Complete
**Next Review**: After initial data pull
