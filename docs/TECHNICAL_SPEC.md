# Technical Specification - YourToyotaPicks

## Executive Summary

Personal automation tool to filter and curate high-quality used Toyota/Honda SUV listings within 30 miles, using strict quality criteria to eliminate manual search work on CarGurus and similar sites.

**Expected Output**: 0-5 curated vehicles per day (sometimes zero is acceptable)

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
    ├─ Web Dashboard (Next.js) - primary interface
    ├─ Email Digest (Resend) - configurable daily/weekly
    └─ SMS Alerts (Twilio) - new match notifications
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
  reject("Excessive mileage for age");
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
  historyData.title_status !== "clean",
  historyData.accident_count > 0,
  historyData.owner_count > 2,
  historyData.is_rental === true,
  historyData.is_fleet === true,
  historyData.flood_damage === true,
  historyData.salvage_title === true,
  historyData.has_lien === true,
  historyData.odometer_rollback === true
];

if (rejectConditions.some(condition => condition)) {
  reject("Failed VIN history check");
}
```

### Stage 5: Geographic Filter (Rust Belt Check)
```javascript
// State of origin check
const rustBeltStates = [
  "OH", "MI", "WI", "IL", "IN", "MN", "IA", "PA", "NY", "MA", "CT", "VT", "NH", "ME"
];

// Prefer southern states, but don't hard reject rust belt if ALL other criteria pass
// Tag listings from rust belt for manual review
if (rustBeltStates.includes(listing.state_of_origin)) {
  listing.flag_rust_concern = true;
  listing.priority = "low";
} else {
  listing.flag_rust_concern = false;
  listing.priority = "high";
}
```

### Stage 6: Model Priority Scoring
```javascript
// SUV preference scoring
const modelPriority = {
  "RAV4": 10,        // Highest priority
  "C-HR": 9,
  "CR-V": 9,         // Honda equivalent
  "HR-V": 8,
  "Highlander": 8,   // If in budget
  "4Runner": 7,
  "Venza": 7,
  "Pilot": 6,        // Honda
  // Other models get default score of 5
};

listing.priority_score = modelPriority[listing.model] || 5;

// Sort results by:
// 1. priority_score (desc)
// 2. mileage (asc)
// 3. price (asc)
```

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
  priority_score INTEGER DEFAULT 5,
  flag_rust_concern BOOLEAN DEFAULT false,
  overall_rating VARCHAR(20), -- 'high' | 'medium' | 'low'

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
CREATE INDEX idx_curated_priority ON curated_listings(priority_score DESC, mileage ASC);
CREATE INDEX idx_curated_created ON curated_listings(created_at DESC);
CREATE INDEX idx_curated_reviewed ON curated_listings(reviewed_by_user);
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
  const response = await fetch('https://marketcheck-prod.apigee.net/v1/search', {
    method: 'GET',
    headers: {
      'Host': 'marketcheck-prod.apigee.net',
      'Content-Type': 'application/json'
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
      include_vin: true
    }
  });

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
    make: data.Results.find(r => r.Variable === "Make")?.Value,
    model: data.Results.find(r => r.Variable === "Model")?.Value,
    year: data.Results.find(r => r.Variable === "Model Year")?.Value,
    bodyType: data.Results.find(r => r.Variable === "Body Class")?.Value,
    engineType: data.Results.find(r => r.Variable === "Engine Model")?.Value
  };
};
```

### 3. VinAudit API (Paid)
```javascript
const getVehicleHistory = async (vin) => {
  const response = await fetch('https://www.vinaudit.com/api/v1/vehicle-history', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.VINAUDIT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    params: {
      vin: vin,
      report_type: 'full' // or 'basic' to save costs
    }
  });

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

    // 6. Send notifications if new matches
    if (stored.length > 0) {
      await sendNotifications(stored);
    }

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

**Pages:**
- `/dashboard` - List all curated vehicles
- `/dashboard/[vin]` - Detailed vehicle view
- `/settings` - Configure search preferences, notification settings

**Features:**
- Card-based layout with images
- Filter by model, price, mileage
- Sort by priority score, date added, price, mileage
- Mark as reviewed/favorite
- Rate vehicles (1-5 stars)
- Add notes
- "View on source" button → external listing
- Export to CSV/PDF

**Tech:**
- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui components
- Vercel hosting
- Supabase Auth (optional, for multi-user later)

### 2. Email Digest (Configurable)

**Frequency Options:**
- Daily (every morning after cron runs)
- Weekly (Sunday evenings)
- Only when new matches found

**Email Content:**
```html
Subject: 🚗 [3 New] Toyota/Honda Picks - [Date]

Body:
Hi [Name],

Your daily search found 3 new vehicles matching your criteria:

1. 2018 Toyota RAV4 XLE - $16,500 | 95K miles | ⭐ Excellent
   📍 Silver Spring, MD (12 miles away)
   ✅ 1 owner, Clean title, No accidents
   [View Details] [View on CarGurus]

2. 2019 Honda CR-V EX - $18,200 | 78K miles | ⭐ Excellent
   📍 Arlington, VA (18 miles away)
   ✅ 2 owners, Clean title, No accidents
   [View Details] [View on Auto.com]

3. 2017 Toyota C-HR XLE - $14,800 | 105K miles | ⭐ Good
   📍 Baltimore, MD (28 miles away)
   ✅ 1 owner, Clean title, No accidents
   ⚠️ Rust belt origin (PA)
   [View Details] [View on Dealership]

---
View all listings: [Dashboard Link]
Update preferences: [Settings Link]
```

**Tech:**
- Resend API (transactional email)
- HTML email templates
- Unsubscribe handling

### 3. SMS Alerts (Optional - Twilio)

**Trigger:** Only when priority score >= 9 (RAV4, C-HR, CR-V, HR-V)

**Message:**
```
🚗 New high-priority match!
2018 RAV4 XLE - $16.5K | 95K mi
📍 12 miles away
View: [short link]
```

**Tech:**
- Twilio SMS API
- SMS opt-in/opt-out handling
- Rate limiting (max 3 SMS per day)

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
  "rust_belt_states": ["OH", "MI", "WI", "IL", "IN", "MN", "IA", "PA", "NY", "MA", "CT", "VT", "NH", "ME"],
  "notifications": {
    "email_enabled": true,
    "email_frequency": "daily",
    "sms_enabled": false,
    "sms_priority_threshold": 9
  },
  "api_settings": {
    "primary_source": "marketcheck",
    "backup_sources": ["auto.dev"],
    "max_api_cost_per_day": 5.00
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
- Resend (Email): $0 (free tier 100 emails/day)
- Twilio (SMS): ~$0.0075 per SMS (optional)

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

### Phase 3: Notifications (Week 5)
- [ ] Set up Resend email integration
- [ ] Build email templates
- [ ] Implement email digest (daily/weekly)
- [ ] (Optional) Add Twilio SMS alerts

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

# Email
RESEND_API_KEY=your_resend_key

# SMS (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# App Config
NEXT_PUBLIC_APP_URL=https://yourtoyotapicks.com
USER_LOCATION_LAT=38.9072
USER_LOCATION_LON=-77.0369
USER_EMAIL=user@example.com
USER_PHONE=+1234567890

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
- Full pipeline: fetch → filter → store
- Email sending
- Dashboard rendering

### Manual Testing
- Review actual curated results
- Verify VIN history accuracy
- Test edge cases (0 results, 100+ results)
- Validate email templates

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
