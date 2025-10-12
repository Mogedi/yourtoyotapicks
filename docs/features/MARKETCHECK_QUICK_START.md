# Marketcheck Integration - Quick Start Guide

This guide provides the exact commands to complete the Marketcheck API integration.

---

## Current Status

✅ **Phase 1 Complete** - Data captured and analyzed
- 56 real vehicles fetched from API
- Database schema designed from real data
- Import script ready to run

📋 **Next Steps** - Apply migration and import data

---

## Prerequisites

1. **Supabase running** (local or production):
   ```bash
   # Option A: Local development
   supabase start

   # Option B: Production (configured in .env.local)
   # NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   # SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Environment variables set** (in `.env.local`):
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Marketcheck API
   MARKETCHECK_API_KEY=your-api-key-here
   ```

---

## Step-by-Step Instructions

### Step 1: Apply Database Migration

```bash
# Reset database and apply all migrations (including marketcheck_listings table)
supabase db reset
```

**Expected output:**
```
Applying migration 20250112000000_create_marketcheck_listings.sql...
✅ Migration applied successfully
```

**Verify table created:**
```bash
supabase db sql --query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketcheck_listings';"
```

---

### Step 2: Import Data from JSON

```bash
# Import the latest marketcheck-YYYY-MM-DD.json file
npx tsx scripts/import-marketcheck-data.ts
```

**Expected output:**
```
📦 Importing Marketcheck data to Supabase...

📋 Import Configuration:
   Input file: marketcheck-2025-10-12.json
   Supabase URL: https://crehsfhbludetpafbnwe.supabase.co
   Table: marketcheck_listings

📖 Reading JSON file...
✅ Loaded 56 listings from file

📍 Sample Listing:
   VIN: 1HGCY1F20PA010005
   Vehicle: 2023 Honda Accord
   Price: $23,990
   Mileage: 20,230 miles

🔌 Connecting to Supabase...
✅ Connected to Supabase

🗺️  Mapping API data to database schema...
✅ Mapped 56 rows

💾 Inserting data into database...
   Batch 1/2: Inserting 50 rows...
   ✅ Batch 1 completed (50/56 total)
   Batch 2/2: Inserting 6 rows...
   ✅ Batch 2 completed (56/56 total)

📊 Verifying import...
✅ Database contains 56 total listings

📈 Import Summary:
   Total rows processed: 56
   Successfully imported: 56

✨ Import complete!
```

---

### Step 3: Verify Data Integrity

```bash
# Count total rows
supabase db sql --query "SELECT COUNT(*) FROM marketcheck_listings;"

# View sample data
supabase db sql --query "SELECT vin, year, make, model, price, miles FROM marketcheck_listings LIMIT 10;"

# Check for NULL VINs (should be 0)
supabase db sql --query "SELECT COUNT(*) FROM marketcheck_listings WHERE vin IS NULL;"

# Check make/model distribution
supabase db sql --query "SELECT make, model, COUNT(*) as count FROM marketcheck_listings GROUP BY make, model ORDER BY count DESC;"
```

**Expected results:**
- Total rows: **56**
- NULL VINs: **0**
- Makes: Toyota (26), Honda (30)
- Models: RAV4, CR-V, Camry, Accord, Highlander, Pilot

---

## Troubleshooting

### Error: "Table 'marketcheck_listings' does not exist"

**Cause:** Migration not applied

**Fix:**
```bash
supabase db reset
```

---

### Error: "Could not find the table in schema cache"

**Cause:** Supabase not running or not connected

**Fix (Local):**
```bash
# Start Supabase
supabase start

# Check status
supabase status
```

**Fix (Production):**
```bash
# Verify environment variables
cat .env.local | grep SUPABASE

# Test connection
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"
```

---

### Error: "No marketcheck-*.json files found"

**Cause:** Data not fetched yet

**Fix:**
```bash
# Fetch data first
npx tsx scripts/fetch-marketcheck-sample.ts --batches=2

# Then import
npx tsx scripts/import-marketcheck-data.ts
```

---

### Error: "Duplicate key value violates unique constraint"

**Cause:** Data already imported (VINs are unique)

**Fix:** This is expected behavior. The import script uses **upsert**, so running it again will update existing rows instead of failing.

---

## Sample Queries

Once data is imported, try these queries:

### 1. View all listings
```sql
SELECT vin, year, make, model, price, miles
FROM marketcheck_listings
ORDER BY price ASC;
```

---

### 2. Find deals under $18K
```sql
SELECT vin, year, make, model, price, miles, dom_active
FROM marketcheck_listings
WHERE price < 18000
  AND carfax_clean_title = true
ORDER BY price ASC;
```

---

### 3. Find low-mileage RAV4s
```sql
SELECT vin, year, model, price, miles, dealer_city
FROM marketcheck_listings
WHERE make = 'Toyota'
  AND model = 'RAV4'
  AND miles < 50000
ORDER BY miles ASC;
```

---

### 4. Find recent listings (last 7 days)
```sql
SELECT vin, year, make, model, price, dom_active, dealer_city
FROM marketcheck_listings
WHERE dom_active <= 7
ORDER BY dom_active ASC;
```

---

### 5. Check photo coverage
```sql
SELECT
  vin,
  year,
  make,
  model,
  jsonb_array_length(photo_links) as photo_count
FROM marketcheck_listings
ORDER BY photo_count DESC;
```

---

### 6. Find cars with price drops
```sql
SELECT
  vin,
  year,
  make,
  model,
  price,
  ref_price,
  price_change_percent
FROM marketcheck_listings
WHERE price_change_percent IS NOT NULL
  AND price_change_percent < -10  -- More than 10% price drop
ORDER BY price_change_percent ASC;
```

---

## Next Phase: Dashboard Integration

After verifying data integrity, proceed to **Phase 4: Dashboard Integration**.

See: [MARKETCHECK_DATA_FIRST_SUMMARY.md](./MARKETCHECK_DATA_FIRST_SUMMARY.md#phase-4-dashboard-integration-future)

**Key tasks:**
1. Update `lib/supabase.ts` with Marketcheck query functions
2. Switch dashboard to use Marketcheck data instead of mock data
3. Update vehicle detail pages
4. Test all filters and sorting
5. Add "Data Source: Live" indicator

---

## Refresh Data (Weekly/Bi-weekly)

To refresh data with new listings:

```bash
# Step 1: Fetch new data (generates new timestamped file)
npx tsx scripts/fetch-marketcheck-sample.ts --batches=2

# Step 2: Import (will upsert - update existing, insert new)
npx tsx scripts/import-marketcheck-data.ts

# Step 3: Verify count increased
supabase db sql --query "SELECT COUNT(*) FROM marketcheck_listings;"
```

**Note:** Upsert behavior means:
- Existing VINs will be **updated** with latest data (price, mileage, DOM, etc.)
- New VINs will be **inserted** as new rows

---

## API Usage Tracking

Track your API usage to stay within quota (500 calls/month):

```bash
# View all data files
ls -lh data/marketcheck-*.json

# Count total API calls made
# Each file = N batches = N API calls
ls data/marketcheck-*.json | wc -l
```

**Current usage:** 3 calls (0.6% of quota)

---

**Last Updated:** 2025-10-12
**See Also:** [MARKETCHECK_DATA_FIRST_SUMMARY.md](./MARKETCHECK_DATA_FIRST_SUMMARY.md)
