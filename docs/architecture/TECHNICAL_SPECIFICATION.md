# Technical Specification - YourToyotaPicks

## Executive Summary

Personal automation tool to filter and curate high-quality used Toyota/Honda SUV listings within 30 miles, using strict quality criteria to eliminate manual search work on CarGurus and similar sites.

**Core Mission**: Act as a **trustworthy curator**, not a data table. Users should know their best matches in <5 seconds.

**Expected Output**: 0-5 curated vehicles per day (sometimes zero is acceptable)

---

## UX Architecture (Core Principle)

### The 5-Second Clarity Rule

Every technical decision must support users achieving these goals within 5 seconds:

1. **Identify top picks** - Which cars are best for me?
2. **Understand why** - What makes them good?
3. **Take action** - Compare or contact without hunting

### Signal over Noise Implementation

**Default Behavior:**

- ALWAYS sort by `priority_score` (descending)
- Show comparisons, not raw data ("$1.2k below median" vs "$16,500")
- Generate AI summaries explaining quality

**Visual Hierarchy:**
| Score | Tier | Visual Treatment | Display Priority |
|-------|------|------------------|------------------|
| 80+ | 🟩 Top Pick | Green badge/border, prominent | Always visible, top of list |
| 65-79 | 🟨 Good Buy | Yellow badge, standard | Visible, below top picks |
| <65 | 🟥 Caution | Gray/muted, collapsible | Hidden by default or at bottom |

**Transparency Requirement:**

- Priority score breakdown MUST be accessible on hover/click
- Users must understand why a car scores 85 vs 70
- No "black box" algorithms

---

## System Architecture

### High-Level Flow

```
[Daily Cron Job]
    ↓
[Data Source APIs] → Fetch Toyota/Honda listings within 30 miles
    ↓
[Stage 1: Basic Filters] → Price, mileage, year, brand, location
    ↓
[Stage 2: VIN Validation] → NHTSA API (free) - decode and verify
    ↓
[Stage 3: History Check] → VinAudit API (paid) - accidents, title, owners
    ↓
[Stage 4: Store] → PostgreSQL (Supabase) - only passing vehicles
    ↓
[Output Layer]
    └─ Web Dashboard (Next.js) - primary interface
```

---

## Data Sources

### Primary: Marketcheck API

- **Coverage**: 6.2M listings from 84K+ dealer/private/auction sources
- **Why**: Most comprehensive, real-time, includes VIN data
- **Cost**: Contact for pricing (enterprise)
- **API Docs**: https://apidocs.marketcheck.com/

### Backup: Auto.dev API

- **Coverage**: US dealer listings
- **Why**: 1000 free API calls/month for testing
- **Cost**: Free tier, then usage-based
- **API Docs**: https://docs.auto.dev/

### Optional: Carapis (CarGurus)

- **Coverage**: CarGurus-specific listings
- **Why**: Matches user's current workflow
- **Cost**: Contact for pricing
- **API Docs**: https://docs.carapis.com/

---

## Filtering Logic

### Stage 1: Basic Filters (API Query Level)

```javascript
{
  make: ["Toyota", "Honda"],
  year: { min: 2015, max: 2025 }, // 2015 or newer
  price: { min: 10000, max: 20000 },
  mileage: { max: 160000 }, // Absolute max (age × 20K)
  radius: 30, // miles
  location: userLocation, // Set in config
  listings_with_vin_only: true
}
```

### Stage 2: Dynamic Mileage Filter

```javascript
// After fetching listings
const currentYear = 2025;
const carAge = currentYear - listing.year;
const maxMileage = carAge * 20000; // Hard limit
const idealMileage = carAge * 15000; // Preferred
const excellentMileage = 100000; // Flag as "excellent"

if (listing.mileage > maxMileage) {
  reject('Excessive mileage for age');
}

// Tag listings:
// - "excellent" if < 100K
// - "good" if < (age × 15K)
// - "acceptable" if < (age × 20K)
```

### Stage 3: VIN Validation (NHTSA API)

```javascript
// Free API: https://vpic.nhtsa.dot.gov/api/
// Endpoint: GET /vehicles/DecodeVin/{vin}?format=json

const response = await fetch(
  `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
);

// Extract:
// - Make/Model/Year (verify matches listing)
// - Body type (prefer SUV/Crossover)
// - Engine type
// - Manufacturer

if (decoded.make !== listing.make || decoded.year !== listing.year) {
  reject("VIN doesn't match listing description");
}
```

### Stage 4: VIN History Check (VinAudit API)

```javascript
// Paid API: https://www.vinaudit.com/vehicle-history-api
// Requires API key and per-request charges

const historyData = await vinAuditAPI.getHistory(vin);

// Auto-reject criteria:
const rejectConditions = [
  historyData.title_status !== 'clean',
  historyData.accident_count > 0,
  historyData.owner_count > 2,
  historyData.is_rental === true,
  historyData.is_fleet === true,
  historyData.flood_damage === true,
  historyData.salvage_title === true,
  historyData.has_lien === true,
  historyData.odometer_rollback === true,
];

if (rejectConditions.some((condition) => condition)) {
  reject('Failed VIN history check');
}
```

### Stage 5: Geographic Filter (Rust Belt Check)

```javascript
// State of origin check
const rustBeltStates = [
  'OH',
  'MI',
  'WI',
  'IL',
  'IN',
  'MN',
  'IA',
  'PA',
  'NY',
  'MA',
  'CT',
  'VT',
  'NH',
  'ME',
];

// Prefer southern states, but don't hard reject rust belt if ALL other criteria pass
// Tag listings from rust belt for manual review
if (rustBeltStates.includes(listing.state_of_origin)) {
  listing.flag_rust_concern = true;
  listing.priority = 'low';
} else {
  listing.flag_rust_concern = false;
  listing.priority = 'high';
}
```

### Stage 6: Comprehensive Priority Scoring (100-point scale)

**Curator Algorithm**: Weighted scoring to surface best matches first

```javascript
// Calculate 100-point priority score with transparent breakdown
const calculatePriorityScore = (listing, marketData) => {
  let score = 0;
  const breakdown = {};

  // 1. Title & Accident History (25 points max)
  if (listing.title_status === 'clean') {
    score += 25;
    breakdown.title = { points: 25, reason: 'Clean title' };
  }
  if (listing.accident_count === 0) {
    breakdown.title.reason += ', No accidents';
  }

  // 2. Mileage vs Year (20 points max)
  const mileageRatio = listing.mileage / (listing.age_in_years * 15000);
  if (mileageRatio < 0.67) {
    score += 20;
    breakdown.mileage = { points: 20, reason: 'Excellent mileage for age' };
  } else if (mileageRatio < 1.0) {
    score += 15;
    breakdown.mileage = { points: 15, reason: 'Good mileage for age' };
  } else {
    score += 5;
    breakdown.mileage = { points: 5, reason: 'Acceptable mileage' };
  }

  // 3. Price vs Market (20 points max)
  const medianPrice = marketData.medianPriceForModel[listing.model];
  const priceDiff = medianPrice - listing.price;
  if (priceDiff > 1500) {
    score += 20;
    breakdown.price = {
      points: 20,
      reason: `$${(priceDiff / 1000).toFixed(1)}k below market`,
    };
  } else if (priceDiff > 0) {
    score += 10;
    breakdown.price = { points: 10, reason: 'Below market price' };
  }

  // 4. Distance (15 points max)
  if (listing.distance_miles <= 15) {
    score += 15;
    breakdown.distance = { points: 15, reason: 'Very close' };
  } else if (listing.distance_miles <= 30) {
    score += 10;
    breakdown.distance = { points: 10, reason: 'Nearby' };
  }

  // 5. Model Demand (10 points max)
  const modelPriority = {
    RAV4: 10,
    'CR-V': 10,
    'C-HR': 8,
    'HR-V': 8,
    Highlander: 7,
    '4Runner': 6,
    Venza: 6,
    Pilot: 5,
  };
  const modelPoints = modelPriority[listing.model] || 3;
  score += modelPoints;
  breakdown.model = { points: modelPoints, reason: `${listing.model} model` };

  // 6. Condition Signals (10 points max)
  if (listing.owner_count === 1) {
    score += 5;
    breakdown.condition = { points: 5, reason: 'Single owner' };
  }
  if (!listing.is_rust_belt_state) {
    score += 5;
    breakdown.condition.points += 5;
    breakdown.condition.reason += ', No rust belt origin';
  }

  listing.priority_score = Math.min(score, 100);
  listing.score_breakdown = breakdown;
  return listing;
};

// ALWAYS sort by priority_score descending
// This is the core curator value proposition
```

### Stage 7: AI Summary Generation

**Purpose**: Generate 2-line human-readable explanations for transparency and quick understanding

```javascript
const generateAISummary = (listing, breakdown) => {
  const highlights = [];

  // Extract key selling points from score breakdown
  if (breakdown.title?.points === 25) {
    highlights.push('✅ Clean history');
  }

  if (listing.owner_count === 1) {
    highlights.push('1-owner');
  }

  if (breakdown.price?.points >= 10) {
    // Show the contextual comparison
    highlights.push(breakdown.price.reason); // e.g., "$1.8k below market"
  }

  if (breakdown.mileage?.points >= 15) {
    highlights.push('📉 Low miles for age');
  }

  if (!listing.is_rust_belt_state) {
    highlights.push('🧊 No rust belt');
  }

  if (listing.distance_miles <= 15) {
    highlights.push('📍 Very close');
  }

  // Join top 4-5 highlights into concise summary
  const summary = highlights.slice(0, 5).join(' • ');

  listing.ai_summary = summary;
  return listing;
};

// Assign quality tier based on final score
const assignQualityTier = (listing) => {
  if (listing.priority_score >= 80) {
    listing.quality_tier = 'top_pick';
  } else if (listing.priority_score >= 65) {
    listing.quality_tier = 'good_buy';
  } else {
    listing.quality_tier = 'caution';
  }
  return listing;
};
```

**Example Outputs:**

- Score 92: "✅ Clean history • 1-owner • $1.8k below market • 📉 Low miles for age • 📍 Very close"
- Score 78: "✅ Clean history • $900 below market • 📍 Very close"
- Score 68: "✅ Clean history • 1-owner • 🧊 No rust belt"

---

## Market Data Collection

**Purpose**: Enable contextual price/mileage comparisons ("$1.2k below market" vs raw numbers)

### Collection Strategy

During the daily pipeline, calculate market statistics for each model before scoring individual listings.

```javascript
const calculateMarketStats = (allFetchedListings) => {
  const statsByModel = {};

  const models = [
    'RAV4',
    'CR-V',
    'C-HR',
    'HR-V',
    'Highlander',
    '4Runner',
    'Venza',
    'Pilot',
  ];

  for (const model of models) {
    const modelListings = allFetchedListings.filter((l) => l.model === model);

    if (modelListings.length === 0) continue;

    // Calculate median price
    const prices = modelListings.map((l) => l.price).sort((a, b) => a - b);
    const medianPrice = prices[Math.floor(prices.length / 2)];

    // Calculate median mileage
    const mileages = modelListings.map((l) => l.mileage).sort((a, b) => a - b);
    const medianMileage = mileages[Math.floor(mileages.length / 2)];

    // Calculate average mileage per year
    const mileagePerYearValues = modelListings.map((l) => {
      const age = 2025 - l.year;
      return age > 0 ? l.mileage / age : 0;
    });
    const avgMileagePerYear =
      mileagePerYearValues.reduce((a, b) => a + b, 0) /
      mileagePerYearValues.length;

    statsByModel[model] = {
      medianPrice: Math.round(medianPrice),
      medianMileage: Math.round(medianMileage),
      avgMileagePerYear: Math.round(avgMileagePerYear),
      sampleSize: modelListings.length,
      calculatedAt: new Date().toISOString().split('T')[0],
    };
  }

  return statsByModel;
};

// Use market stats in priority scoring
const scoringPipeline = async (listings) => {
  // 1. Calculate market stats from all fetched listings
  const marketData = calculateMarketStats(listings);

  // 2. Store market stats for reference
  await storeMarketStats(marketData);

  // 3. Score each listing using market data
  const scoredListings = listings.map((listing) => {
    const scored = calculatePriorityScore(listing, {
      medianPriceForModel: marketData,
    });
    const withSummary = generateAISummary(scored, scored.score_breakdown);
    const withTier = assignQualityTier(withSummary);
    return withTier;
  });

  return scoredListings;
};
```

### Market Stats Database Table

```sql
CREATE TABLE market_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model VARCHAR(50) NOT NULL,
  median_price INTEGER,
  median_mileage INTEGER,
  avg_mileage_per_year DECIMAL,
  sample_size INTEGER,
  calculated_at DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(model, calculated_at)
);

CREATE INDEX idx_market_stats_model ON market_stats(model, calculated_at DESC);
```

**Why This Matters:**

- Contextual comparisons are core to the curator philosophy
- Users see "$1.8k below market" instead of just "$16,500"
- Market data refreshes daily with real-time market conditions
- Transparent and explainable pricing context

---

## Database Schema

### Table: `curated_listings`

```sql
CREATE TABLE curated_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vehicle Info
  vin VARCHAR(17) NOT NULL UNIQUE,
  make VARCHAR(20) NOT NULL CHECK (make IN ('Toyota', 'Honda')),
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 2015 AND year <= 2025),
  body_type VARCHAR(50), -- SUV, Crossover, Sedan, etc.

  -- Pricing & Mileage
  price INTEGER NOT NULL CHECK (price >= 10000 AND price <= 20000),
  mileage INTEGER NOT NULL CHECK (mileage <= 160000),
  age_in_years INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM CURRENT_DATE) - year) STORED,
  mileage_per_year DECIMAL GENERATED ALWAYS AS (mileage::DECIMAL / NULLIF(age_in_years, 0)) STORED,
  mileage_rating VARCHAR(20), -- 'excellent' | 'good' | 'acceptable'

  -- Title & History
  title_status VARCHAR(20) NOT NULL DEFAULT 'clean' CHECK (title_status = 'clean'),
  accident_count INTEGER NOT NULL DEFAULT 0 CHECK (accident_count = 0),
  owner_count INTEGER NOT NULL CHECK (owner_count IN (1, 2)),
  is_rental BOOLEAN NOT NULL DEFAULT false CHECK (is_rental = false),
  is_fleet BOOLEAN NOT NULL DEFAULT false CHECK (is_fleet = false),
  has_lien BOOLEAN NOT NULL DEFAULT false CHECK (has_lien = false),
  flood_damage BOOLEAN NOT NULL DEFAULT false CHECK (flood_damage = false),

  -- Location
  state_of_origin CHAR(2) NOT NULL,
  is_rust_belt_state BOOLEAN NOT NULL DEFAULT false,
  current_location VARCHAR(100) NOT NULL,
  distance_miles INTEGER NOT NULL CHECK (distance_miles <= 30),
  dealer_name VARCHAR(200),

  -- Priority & Scoring
  priority_score INTEGER DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
  score_breakdown JSONB, -- Transparent breakdown: { title: {points: 25, reason: "Clean title"}, mileage: {...}, ... }
  quality_tier VARCHAR(20), -- 'top_pick' | 'good_buy' | 'caution'
  ai_summary TEXT, -- 2-line auto-generated explanation (e.g., "✅ 1-owner • 📉 $1.8k below market • Clean history")
  flag_rust_concern BOOLEAN DEFAULT false

  -- Source Info
  source_platform VARCHAR(50) NOT NULL, -- 'Marketcheck' | 'Auto.dev' | 'Carapis'
  source_url TEXT NOT NULL,
  source_listing_id VARCHAR(100),
  images_url JSONB, -- Array of image URLs

  -- VIN Data
  vin_decode_data JSONB, -- Full NHTSA response
  vin_history_data JSONB, -- Full VinAudit response

  -- User Interaction
  reviewed_by_user BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_notes TEXT,

  -- Timestamps
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_curated_make_model ON curated_listings(make, model);
CREATE INDEX idx_curated_price ON curated_listings(price);
CREATE INDEX idx_curated_priority ON curated_listings(priority_score DESC, quality_tier, mileage ASC);
CREATE INDEX idx_curated_created ON curated_listings(created_at DESC);
CREATE INDEX idx_curated_quality_tier ON curated_listings(quality_tier);
```

### Table: `search_logs`

```sql
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_date DATE NOT NULL,
  total_listings_fetched INTEGER,
  listings_after_basic_filter INTEGER,
  listings_after_vin_validation INTEGER,
  listings_after_history_check INTEGER,
  final_curated_count INTEGER,
  api_calls_made INTEGER,
  api_cost_usd DECIMAL(10, 2),
  execution_time_seconds DECIMAL(10, 2),
  error_count INTEGER DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Integration Details

### 1. Marketcheck API

```javascript
// Example search query
const marketCheckSearch = async () => {
  const response = await fetch(
    'https://marketcheck-prod.apigee.net/v1/search',
    {
      method: 'GET',
      headers: {
        Host: 'marketcheck-prod.apigee.net',
        'Content-Type': 'application/json',
      },
      params: {
        api_key: process.env.MARKETCHECK_API_KEY,
        make: 'Toyota,Honda',
        year_min: 2015,
        price_min: 10000,
        price_max: 20000,
        miles_max: 160000,
        radius: 30,
        latitude: userLat,
        longitude: userLon,
        rows: 100, // Max results per request
        start: 0,
        include_vin: true,
      },
    }
  );

  return response.json();
};
```

### 2. NHTSA vPIC API (Free)

```javascript
const decodeVIN = async (vin) => {
  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
  );

  const data = await response.json();

  return {
    make: data.Results.find((r) => r.Variable === 'Make')?.Value,
    model: data.Results.find((r) => r.Variable === 'Model')?.Value,
    year: data.Results.find((r) => r.Variable === 'Model Year')?.Value,
    bodyType: data.Results.find((r) => r.Variable === 'Body Class')?.Value,
    engineType: data.Results.find((r) => r.Variable === 'Engine Model')?.Value,
  };
};
```

### 3. VinAudit API (Paid)

```javascript
const getVehicleHistory = async (vin) => {
  const response = await fetch(
    'https://www.vinaudit.com/api/v1/vehicle-history',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.VINAUDIT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        vin: vin,
        report_type: 'full', // or 'basic' to save costs
      },
    }
  );

  return response.json();
};
```

---

## Cron Job Schedule

### Daily Execution (Recommended: 6 AM local time)

```javascript
// Using node-cron or Vercel Cron Jobs
import cron from 'node-cron';

// Run every day at 6:00 AM
cron.schedule('0 6 * * *', async () => {
  console.log('Starting daily car search...');
  await runCarSearchPipeline();
});

const runCarSearchPipeline = async () => {
  const startTime = Date.now();
  const logEntry = { search_date: new Date() };

  try {
    // 1. Fetch listings
    const listings = await fetchListingsFromAPIs();
    logEntry.total_listings_fetched = listings.length;

    // 2. Basic filter
    const basicFiltered = await applyBasicFilters(listings);
    logEntry.listings_after_basic_filter = basicFiltered.length;

    // 3. VIN validation
    const vinValidated = await validateVINs(basicFiltered);
    logEntry.listings_after_vin_validation = vinValidated.length;

    // 4. VIN history check
    const historyChecked = await checkVINHistory(vinValidated);
    logEntry.listings_after_history_check = historyChecked.length;

    // 5. Store in database
    const stored = await storeListings(historyChecked);
    logEntry.final_curated_count = stored.length;

    logEntry.execution_time_seconds = (Date.now() - startTime) / 1000;
    await logSearchExecution(logEntry);
  } catch (error) {
    logEntry.error_count = 1;
    logEntry.error_details = { message: error.message, stack: error.stack };
    await logSearchExecution(logEntry);
  }
};
```

---

## Output Interfaces

### 1. Web Dashboard (Primary - Next.js)

**Core Experience:** Trustworthy curator that surfaces best matches in <5 seconds

**Pages:**

- `/dashboard` - Curated vehicle grid (priority-first display)
- `/dashboard/[vin]` - Detailed vehicle view with score breakdown
- `/settings` - Configure search preferences, notification settings

**Curator Features:**

- **Priority-first display**: ALWAYS sorted by priority_score (descending)
- **Color-coded quality tiers**:
  - 🟩 Top Picks (80+): Green badges/borders, prominent
  - 🟨 Good Buys (65-79): Yellow badges, standard
  - 🟥 Caution (<65): Muted/collapsible
- **AI-generated summaries**: 2-line explanations per vehicle
- **Contextual comparisons**: "$1.2k below median" vs raw prices
- **Transparent scoring**: Hover/click to see breakdown
- **Smart filtering**: Preserve priority sorting when filtering
- **Card-based layout**: 5-angle car images (IMAGIN.studio API)
- **Filter by**: Model, price, mileage, quality tier
- **Quick actions**: "View on source" button → external listing
- **Export**: CSV/PDF export of curated results

**Tech:**

- Next.js 15.5.4 (App Router)
- Tailwind CSS + shadcn/ui components
- Vercel hosting
- Supabase (PostgreSQL)
- IMAGIN.studio API (car images)

---

## Configuration File

### `config/search-settings.json`

```json
{
  "user": {
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+1234567890",
    "location": {
      "city": "Washington",
      "state": "DC",
      "latitude": 38.9072,
      "longitude": -77.0369
    }
  },
  "search_criteria": {
    "brands": ["Toyota", "Honda"],
    "price_min": 10000,
    "price_max": 20000,
    "year_min": 2015,
    "mileage_max": 160000,
    "mileage_per_year_ideal": 15000,
    "mileage_per_year_max": 20000,
    "radius_miles": 30,
    "title_status": ["clean"],
    "max_owners": 2,
    "max_accidents": 0,
    "exclude_rental": true,
    "exclude_fleet": true,
    "exclude_liens": true
  },
  "priority_models": {
    "RAV4": 10,
    "C-HR": 9,
    "CR-V": 9,
    "HR-V": 8,
    "Highlander": 8,
    "4Runner": 7,
    "Venza": 7,
    "Pilot": 6
  },
  "rust_belt_states": [
    "OH",
    "MI",
    "WI",
    "IL",
    "IN",
    "MN",
    "IA",
    "PA",
    "NY",
    "MA",
    "CT",
    "VT",
    "NH",
    "ME"
  ],
  "api_settings": {
    "primary_source": "marketcheck",
    "backup_sources": ["auto.dev"],
    "max_api_cost_per_day": 5.0
  }
}
```

---

## Cost Estimation

### API Costs (Monthly)

**Data Source APIs:**

- Marketcheck: ~$100-300/month (estimated, contact for pricing)
- Auto.dev: $0 (free tier 1000 calls) → ~$50/month after

**VIN APIs:**

- NHTSA vPIC: $0 (free, government)
- VinAudit: ~$0.10-0.25 per full report
  - Estimate: 50 listings/day × 30 days = 1500 reports/month
  - Cost: $150-375/month

**Total API costs: ~$250-675/month**

**Infrastructure:**

- Vercel (Next.js hosting): $0 (hobby tier) → $20/month (pro)
- Supabase (Database): $0 (free tier) → $25/month (pro)

**Total infrastructure: $0-45/month**

**Grand total: $250-720/month** (mostly API costs)

---

## Development Roadmap

### Phase 1: MVP (Weeks 1-3)

- [ ] Set up Next.js + Supabase project
- [ ] Create database schema
- [ ] Integrate Marketcheck or Auto.dev API
- [ ] Implement basic filtering logic
- [ ] Integrate NHTSA VIN decoder
- [ ] Build simple dashboard UI (list view)
- [ ] Set up daily cron job

### Phase 2: VIN History & Refinement (Week 4)

- [ ] Integrate VinAudit API
- [ ] Implement full filtering pipeline
- [ ] Add detailed vehicle view page
- [ ] Implement user review/rating system
- [ ] Add search logs and analytics

### Phase 3: Refinement & Optimization (Week 5)

- [ ] Optimize priority scoring algorithm based on real data
- [ ] Refine quality tier thresholds
- [ ] Add market trend tracking (price changes over time)
- [ ] Performance optimization for large datasets

### Phase 4: Polish & Launch (Week 6)

- [ ] Add CSV/PDF export
- [ ] Implement settings page
- [ ] Add error handling and logging
- [ ] Performance optimization
- [ ] Documentation and user guide

---

## Environment Variables

```bash
# Data Sources
MARKETCHECK_API_KEY=your_marketcheck_key
AUTODEV_API_KEY=your_autodev_key
CARAPIS_API_KEY=your_carapis_key

# VIN APIs (NHTSA is public, no key needed)
VINAUDIT_API_KEY=your_vinaudit_key

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_connection_string

# App Config
NEXT_PUBLIC_APP_URL=https://yourtoyotapicks.com
USER_LOCATION_LAT=38.9072
USER_LOCATION_LON=-77.0369

# Cron Job
CRON_SECRET=your_cron_secret_for_vercel
```

---

## Testing Strategy

### Unit Tests

- Filter logic functions
- VIN decoding parser
- Mileage calculation functions
- Priority scoring algorithm

### Integration Tests

- API calls to Marketcheck/Auto.dev
- NHTSA VIN decoder integration
- VinAudit API integration
- Database CRUD operations

### End-to-End Tests

- Full pipeline: fetch → filter → score → store
- Dashboard rendering with quality tiers
- Score breakdown display
- Filtering with priority preservation

### Manual Testing

- Review actual curated results for quality
- Verify VIN history accuracy
- Test edge cases (0 results, 100+ results)
- Verify score breakdowns are accurate
- Check quality tier color coding
- Test filtering preserves priority sort

---

## Success Metrics

**Primary Goal:** Save time on manual car searches

**Metrics:**

1. **Curated Listings/Day**: 0-5 (target met if quality maintained)
2. **False Positives**: <5% (cars that pass filters but fail manual review)
3. **False Negatives**: Unmeasurable (but monitor if good cars are being filtered out)
4. **API Cost/Curated Car**: Target <$1 per car
5. **Time Saved**: ~30-60 min/day (vs manual searching)
6. **Pipeline Execution Time**: <5 minutes per daily run

**Quality Indicators:**

- 90%+ of curated cars worthy of consideration
- Zero accidents on all curated vehicles
- Zero salvage titles
- All vehicles under mileage thresholds

---

## Future Considerations

**If expanding to SaaS:**

- Multi-user support with individual preferences
- Regional expansion (10+ metro areas)
- More brands (Mazda, Subaru, Lexus, Acura)
- Price alerts (notify when specific car drops price)
- Saved searches
- Comparison tools
- Integration with financing calculators
- Mobile app (React Native or Flutter)

**For personal use:**

- Desktop notifications
- Slack integration
- Historical price tracking for specific listings
- "Watch list" for specific VINs
- Export to Notion/Airtable
