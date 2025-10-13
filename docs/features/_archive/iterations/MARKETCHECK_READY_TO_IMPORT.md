# Marketcheck Data - Ready to Import

## Summary

✅ **All systems ready for database import**

**Database Table:** `marketcheck_listings`
**Data File:** `data/marketcheck-combined.json`
**Import Script:** `scripts/import-marketcheck-data.ts`
**Migration:** `supabase/migrations/20250112000000_create_marketcheck_listings.sql`

---

## Database Details

### Table Name
```sql
marketcheck_listings
```

### Schema
- **77 columns** total
- **Primary key:** `id` (Marketcheck listing ID)
- **Unique constraint:** `vin` (17-character VIN)
- **9 indexes** for query performance
- **1 auto-update trigger** for `updated_at` timestamp

### Column Categories

| Category | Columns | Description |
|----------|---------|-------------|
| **Core Identity** | 2 | `id`, `vin` |
| **Basic Info** | 6 | `heading`, `year`, `make`, `model`, `trim`, `version` |
| **Pricing** | 5 | `price`, `msrp`, `ref_price`, `price_change_percent`, `ref_price_dt` |
| **Mileage** | 3 | `miles`, `ref_miles`, `ref_miles_dt` |
| **Quality** | 2 | `carfax_1_owner`, `carfax_clean_title` |
| **Colors** | 4 | `exterior_color`, `interior_color`, `base_ext_color`, `base_int_color` |
| **Timing** | 4 | `dom`, `dom_180`, `dom_active`, `dos_active` |
| **Timestamps** | 10 | Unix + PostgreSQL timestamps (5 pairs) |
| **Listing Meta** | 6 | `data_source`, `vdp_url`, `seller_type`, etc. |
| **Distance** | 1 | `dist` |
| **Dealer Info** | 13 | Flattened dealer object (name, address, phone, etc.) |
| **Build Specs** | 18 | Flattened build object (engine, transmission, MPG, etc.) |
| **Media** | 2 | `photo_links`, `photo_links_cached` (JSONB) |
| **Internal** | 2 | `created_at`, `updated_at` |

---

## Data File Details

### File: `data/marketcheck-combined.json`

**Size:** 684.59 KB

**Contents:**
```json
{
  "num_found": 88,
  "listings": [ /* 88 cars */ ],
  "metadata": {
    "combined_at": "2025-10-12T19:22:31.000Z",
    "source_files": [
      "marketcheck-2025-10-12-1922.json",
      "marketcheck-2025-10-12.json",
      "marketcheck-sample.json"
    ],
    "total_read": 99,
    "duplicates_removed": 11,
    "unique_count": 88
  }
}
```

### Data Statistics

**Total Cars:** 88 unique vehicles

**Make Distribution:**
- Honda: 45 cars (51%)
- Toyota: 43 cars (49%)

**Owner Distribution:**
- Single-owner: 32 cars (36%)
- Multi-owner: 56 cars (64%)

**Price Range:**
- Min: $12,977
- Max: $25,000
- Average: ~$19,500

**Year Range:**
- Oldest: 2013
- Newest: 2023
- Most common: 2017-2019

**Mileage Range:**
- Min: 20,230 miles
- Max: ~100,000 miles
- Average: ~55,000 miles

**Quality:**
- Clean title: 88/88 (100%)
- Photos available: 88/88 (100%)
- Dealer info complete: 88/88 (100%)

---

## Field Mapping Verification

### ✅ All API Fields Mapped to Database

| API Field | Database Column | Type | Notes |
|-----------|----------------|------|-------|
| `id` | `id` | TEXT | Primary key |
| `vin` | `vin` | TEXT | Unique constraint |
| `heading` | `heading` | TEXT | Vehicle title |
| `build.year` | `year` | INTEGER | Model year |
| `build.make` | `make` | TEXT | Manufacturer |
| `build.model` | `model` | TEXT | Model name |
| `build.trim` | `trim` | TEXT | Nullable |
| `build.version` | `version` | TEXT | Nullable |
| `price` | `price` | DECIMAL | Current price |
| `msrp` | `msrp` | DECIMAL | Nullable |
| `ref_price` | `ref_price` | DECIMAL | Nullable |
| `price_change_percent` | `price_change_percent` | DECIMAL | Nullable |
| `ref_price_dt` | `ref_price_dt` | BIGINT | Nullable |
| `miles` | `miles` | INTEGER | Odometer |
| `ref_miles` | `ref_miles` | INTEGER | Nullable |
| `ref_miles_dt` | `ref_miles_dt` | BIGINT | Nullable |
| `carfax_1_owner` | `carfax_1_owner` | BOOLEAN | Default: false |
| `carfax_clean_title` | `carfax_clean_title` | BOOLEAN | Default: true |
| `exterior_color` | `exterior_color` | TEXT | Nullable |
| `interior_color` | `interior_color` | TEXT | Nullable |
| `base_ext_color` | `base_ext_color` | TEXT | Nullable |
| `base_int_color` | `base_int_color` | TEXT | Nullable |
| `dom` | `dom` | INTEGER | Nullable |
| `dom_180` | `dom_180` | INTEGER | Nullable |
| `dom_active` | `dom_active` | INTEGER | Nullable |
| `dos_active` | `dos_active` | INTEGER | Nullable |
| `last_seen_at` | `last_seen_at` | BIGINT | Nullable |
| `last_seen_at` | `last_seen_at_date` | TIMESTAMP | Converted |
| `scraped_at` | `scraped_at` | BIGINT | Nullable |
| `scraped_at` | `scraped_at_date` | TIMESTAMP | Converted |
| `first_seen_at` | `first_seen_at` | BIGINT | Nullable |
| `first_seen_at` | `first_seen_at_date` | TIMESTAMP | Converted |
| `first_seen_at_source` | `first_seen_at_source` | BIGINT | Nullable |
| `first_seen_at_source` | `first_seen_at_source_date` | TIMESTAMP | Converted |
| `first_seen_at_mc` | `first_seen_at_mc` | BIGINT | Nullable |
| `first_seen_at_mc` | `first_seen_at_mc_date` | TIMESTAMP | Converted |
| `data_source` | `data_source` | TEXT | Nullable |
| `vdp_url` | `vdp_url` | TEXT | Nullable |
| `seller_type` | `seller_type` | TEXT | Nullable |
| `inventory_type` | `inventory_type` | TEXT | Nullable |
| `stock_no` | `stock_no` | TEXT | Nullable |
| `source` | `source` | TEXT | Nullable |
| `in_transit` | `in_transit` | BOOLEAN | Default: false |
| `dist` | `dist` | DECIMAL | Nullable |
| `dealer.id` | `dealer_id` | INTEGER | Nullable |
| `dealer.name` | `dealer_name` | TEXT | Nullable |
| `dealer.dealer_type` | `dealer_type` | TEXT | Nullable |
| `dealer.website` | `dealer_website` | TEXT | Nullable |
| `dealer.street` | `dealer_street` | TEXT | Nullable |
| `dealer.city` | `dealer_city` | TEXT | Nullable |
| `dealer.state` | `dealer_state` | TEXT | Nullable |
| `dealer.zip` | `dealer_zip` | TEXT | Nullable |
| `dealer.country` | `dealer_country` | TEXT | Nullable |
| `dealer.latitude` | `dealer_latitude` | DECIMAL | Parsed from string |
| `dealer.longitude` | `dealer_longitude` | DECIMAL | Parsed from string |
| `dealer.phone` | `dealer_phone` | TEXT | Nullable |
| `dealer.msa_code` | `dealer_msa_code` | TEXT | Nullable |
| `build.body_type` | `body_type` | TEXT | Nullable |
| `build.vehicle_type` | `vehicle_type` | TEXT | Nullable |
| `build.transmission` | `transmission` | TEXT | Nullable |
| `build.drivetrain` | `drivetrain` | TEXT | Nullable |
| `build.fuel_type` | `fuel_type` | TEXT | Nullable |
| `build.engine` | `engine` | TEXT | Nullable |
| `build.engine_size` | `engine_size` | DECIMAL | Nullable |
| `build.engine_block` | `engine_block` | TEXT | Nullable |
| `build.cylinders` | `cylinders` | INTEGER | Nullable |
| `build.doors` | `doors` | INTEGER | Nullable |
| `build.std_seating` | `std_seating` | TEXT | Nullable (as string) |
| `build.highway_mpg` | `highway_mpg` | INTEGER | Nullable |
| `build.city_mpg` | `city_mpg` | INTEGER | Nullable |
| `build.powertrain_type` | `powertrain_type` | TEXT | Nullable |
| `build.made_in` | `made_in` | TEXT | Nullable |
| `build.overall_height` | `overall_height` | DECIMAL | Parsed from string |
| `build.overall_length` | `overall_length` | DECIMAL | Parsed from string |
| `build.overall_width` | `overall_width` | DECIMAL | Parsed from string |
| `media.photo_links` | `photo_links` | JSONB | Array |
| `media.photo_links_cached` | `photo_links_cached` | JSONB | Array |

**Total:** 77 database columns ← 88 API fields (nested objects flattened)

---

## Import Script Details

### Script: `scripts/import-marketcheck-data.ts`

**Features:**
- ✅ Automatic file detection (finds latest `marketcheck-*.json`)
- ✅ Custom file support (`--file=marketcheck-combined.json`)
- ✅ Batch upsert (50 rows per batch)
- ✅ Conflict handling (upsert on VIN)
- ✅ Type conversions (Unix → PostgreSQL timestamps, strings → numbers)
- ✅ Flattens nested objects (`dealer`, `build`, `media`)
- ✅ Comprehensive error handling
- ✅ Progress logging
- ✅ Data verification

**Data Transformations:**
1. **Timestamp conversion:** Unix epoch → PostgreSQL TIMESTAMP
   ```typescript
   new Date(timestamp * 1000).toISOString()
   ```

2. **String to number parsing:**
   ```typescript
   parseFloat(dealer.latitude)
   parseFloat(build.overall_height)
   ```

3. **Object flattening:**
   ```typescript
   dealer.name → dealer_name
   build.make → make
   ```

4. **JSONB storage:**
   ```typescript
   media.photo_links → photo_links (JSONB array)
   ```

---

## Import Commands

### Option 1: Import Combined File (Recommended)

```bash
# Import the combined file with all 88 cars
npx tsx scripts/import-marketcheck-data.ts --file=marketcheck-combined.json
```

**Expected output:**
```
📦 Importing Marketcheck data to Supabase...

📋 Import Configuration:
   Input file: marketcheck-combined.json
   Supabase URL: https://crehsfhbludetpafbnwe.supabase.co
   Table: marketcheck_listings

📖 Reading JSON file...
✅ Loaded 88 listings from file

🔌 Connecting to Supabase...
✅ Connected to Supabase

🗺️  Mapping API data to database schema...
✅ Mapped 88 rows

💾 Inserting data into database...
   Batch 1/2: Inserting 50 rows...
   ✅ Batch 1 completed (50/88 total)
   Batch 2/2: Inserting 38 rows...
   ✅ Batch 2 completed (88/88 total)

📊 Verifying import...
✅ Database contains 88 total listings

📈 Import Summary:
   Total rows processed: 88
   Successfully imported: 88

✨ Import complete!
```

---

### Option 2: Auto-detect Latest File

```bash
# Import the latest marketcheck-YYYY-MM-DD-HHMM.json file
npx tsx scripts/import-marketcheck-data.ts
```

---

## Pre-Import Checklist

Before running the import, verify:

### 1. ✅ Supabase is Running

**Local:**
```bash
supabase status
```

**Production:**
```bash
# Check .env.local has correct values
cat .env.local | grep SUPABASE
```

---

### 2. ✅ Migration is Applied

```bash
# Apply all migrations
supabase db reset
```

**Verify table exists:**
```bash
supabase db sql --query "SELECT table_name FROM information_schema.tables WHERE table_name = 'marketcheck_listings';"
```

**Expected output:**
```
 table_name
──────────────────────
 marketcheck_listings
```

---

### 3. ✅ Data File Exists

```bash
# Check file
ls -lh data/marketcheck-combined.json
```

**Expected:**
```
-rw-r--r-- 1 user staff 684.59 KB ... data/marketcheck-combined.json
```

---

### 4. ✅ No Duplicate VINs

```bash
# Verify no duplicates
cat data/marketcheck-combined.json | jq '[.listings[].vin] | group_by(.) | map({vin: .[0], count: length}) | map(select(.count > 1))'
```

**Expected output:**
```json
[]
```

---

## Post-Import Verification

After import completes, verify data integrity:

### 1. Count Total Rows
```bash
supabase db sql --query "SELECT COUNT(*) FROM marketcheck_listings;"
```

**Expected:** 88

---

### 2. Check for NULL VINs
```bash
supabase db sql --query "SELECT COUNT(*) FROM marketcheck_listings WHERE vin IS NULL;"
```

**Expected:** 0

---

### 3. Verify Make/Model Distribution
```bash
supabase db sql --query "SELECT make, model, COUNT(*) as count FROM marketcheck_listings GROUP BY make, model ORDER BY count DESC;"
```

**Expected:**
```
  make  |   model    | count
────────────────────────────
 Honda  | CR-V       |   XX
 Toyota | RAV4       |   XX
 Honda  | Accord     |   XX
 Toyota | Camry      |   XX
 ...
```

---

### 4. Check Single-Owner Count
```bash
supabase db sql --query "SELECT carfax_1_owner, COUNT(*) FROM marketcheck_listings GROUP BY carfax_1_owner;"
```

**Expected:**
```
 carfax_1_owner | count
─────────────────────────
 false          |   56
 true           |   32
```

---

### 5. Verify Photo Coverage
```bash
supabase db sql --query "SELECT COUNT(*) FROM marketcheck_listings WHERE photo_links IS NOT NULL;"
```

**Expected:** 88 (100% coverage)

---

### 6. Check Price Range
```bash
supabase db sql --query "SELECT MIN(price), MAX(price), AVG(price)::DECIMAL(10,2) FROM marketcheck_listings;"
```

**Expected:**
```
   min    |   max   |   avg
──────────────────────────────
 12977.00 | 25000.00| ~19500.00
```

---

## API Usage Summary

**Total API calls made:** 7
- Initial test (11 cars): 1 call
- Multi-owner batch 1 (50 cars): 1 call
- Multi-owner batch 2 (6 cars): 1 call
- Single-owner (32 cars): 1 call
- Multi-owner re-fetch batch 1 (50 cars): 1 call
- Multi-owner re-fetch batch 2 (6 cars): 1 call
- Single-owner re-fetch (32 cars): 1 call

**Quota used:** 1.4% (7 out of 500 calls)
**Remaining:** 493 calls (98.6%)

---

## Next Steps After Import

1. **Verify data integrity** (run all verification queries above)
2. **Update dashboard** to use `marketcheck_listings` table
3. **Test queries** with filters (make, model, price, single-owner)
4. **Add priority scoring** algorithm
5. **Schedule weekly data refresh** (1-2 API calls/week)

---

**Last Updated:** 2025-10-12
**Status:** ✅ Ready to import (all checks passed)
