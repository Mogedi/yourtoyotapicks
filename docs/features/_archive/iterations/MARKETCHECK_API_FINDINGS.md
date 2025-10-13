# Marketcheck API - Actual Findings vs. Expectations

This document compares what we **expected** from the Marketcheck API based on documentation versus what we **actually received** in real API responses.

**Date:** 2025-10-12
**Data Source:** `data/marketcheck-2025-10-12.json` (56 listings)

---

## Summary

| Category | Expected | Actual | Notes |
|----------|----------|--------|-------|
| **Data Coverage** | 50 cars per call | ✅ 50-56 cars | Works as documented |
| **Pagination** | Start offset works | ✅ Confirmed | Tested with 2 batches |
| **Quality Filters** | `carfax_clean_title` works | ✅ Confirmed | 100% clean titles returned |
| **Single-Owner Filter** | `carfax_1_owner` works | ⚠️ **0 results** | May not be populated reliably |
| **Photo Coverage** | "May have photos" | ✅ **100% have photos** | 8-26 photos per car |
| **Price History** | Not mentioned | ✅ **40% have history** | Bonus feature discovered |
| **Dealer Info** | Basic info only | ✅ **Complete** | Address, phone, coordinates |
| **Build Specs** | Basic specs | ✅ **Comprehensive** | Engine, MPG, dimensions, etc. |

---

## Field-by-Field Analysis

### ✅ Core Fields - All Present (100%)

These fields were **always present** in all 56 listings:

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | String | `"1HGCY1F20PA010005-d0eb1b46-297b"` | Marketcheck unique ID |
| `vin` | String | `"1HGCY1F20PA010005"` | 17-character VIN |
| `heading` | String | `"Pre-Owned 2023 Honda Accord Sedan LX"` | Formatted title |
| `price` | Number | `23990` | Current asking price |
| `miles` | Number | `20230` | Odometer reading |
| `build.year` | Number | `2023` | Model year |
| `build.make` | String | `"Honda"` | Manufacturer |
| `build.model` | String | `"Accord"` | Model name |
| `carfax_clean_title` | Boolean | `true` | Clean title flag |
| `carfax_1_owner` | Boolean | `false` | Single owner flag |
| `dealer.name` | String | `"Potamkin Hyundai Stone Mountain"` | Dealer name |
| `dealer.city` | String | `"Lilburn"` | Dealer city |
| `dealer.state` | String | `"GA"` | Dealer state |
| `dom_active` | Number | `1` | Days on market (active) |
| `last_seen_at` | Number | `1760195801` | Unix timestamp |

**Conclusion:** All documented core fields are present and reliable.

---

### ✅ Photo Fields - Better Than Expected

**Expected:** "Some listings may have photos"
**Actual:** **100% of listings have photos** (56/56)

| Field | Coverage | Details |
|-------|----------|---------|
| `media.photo_links` | 100% | Original dealer photo URLs |
| `media.photo_links_cached` | 100% | Marketcheck cached URLs (faster) |

**Photo Statistics:**
- **Minimum:** 8 photos
- **Maximum:** 26 photos
- **Average:** 12 photos
- **Typical angles:** Front, rear, 3/4, side, interior, engine, wheels, details

**Example structure:**
```json
{
  "media": {
    "photo_links": [
      "https://vehicle-images.dealerinspire.com/be45-110010764/1HGCY1F20PA010005/f373e33a5c307404890164957a00f1bd.jpg",
      "https://vehicle-images.dealerinspire.com/a8a0-110010764/1HGCY1F20PA010005/a38ae565c2f64cf8b65c653cc35fe982.jpg",
      ...
    ],
    "photo_links_cached": [
      "https://api.marketcheck.com/v2/image/cache/car/1HGCY1F20PA010005-d0eb1b46-297b/833b6f84afe1305c5a88bde5540aac98?api_key=xxx",
      ...
    ]
  }
}
```

**Recommendation:** Use `photo_links_cached` as primary source (faster, more reliable, already optimized by Marketcheck).

---

### ⚠️ Single-Owner Filter - Not Working as Expected

**Expected:** `carfax_1_owner=true` returns single-owner vehicles
**Actual:** 0 out of 56 cars were single-owner (even with filter disabled)

**Tests performed:**

| Test | Parameters | Cars Returned | Single-Owner Count |
|------|------------|---------------|-------------------|
| Test 1 | 2015-2023, $10K-$20K, clean title | 11 | 0 |
| Test 2 | 2013-2023, $10K-$25K, clean title | 56 | 0 |

**Possible explanations:**
1. Single-owner cars with clean titles are extremely rare in Atlanta market
2. `carfax_1_owner` field may not be reliably populated by dealers
3. Owner count may be a premium data field requiring additional API parameters
4. Data may be stale or not updated frequently

**Recommendation:**
- **Remove single-owner from auto-reject filters** (too restrictive)
- Use single-owner as a **bonus in priority scoring** (+10 points)
- Expand search to other markets if single-owner is critical
- Contact Marketcheck support to confirm field population

---

### ✅ Price History - Bonus Feature!

**Expected:** Not documented
**Actual:** **~40% of listings have price tracking data**

| Field | Coverage | Example | Notes |
|-------|----------|---------|-------|
| `ref_price` | ~40% | `28282` | Previous price |
| `price_change_percent` | ~40% | `-20.44` | % change (negative = drop) |
| `ref_price_dt` | ~40% | `1648556565` | Unix timestamp of change |

**Example (2022 Toyota Camry):**
```json
{
  "price": 22500,           // Current price
  "ref_price": 28282,       // Previous price
  "price_change_percent": -20.44,  // 20% price drop!
  "ref_price_dt": 1648556565       // Changed on Mar 29, 2022
}
```

**Use cases:**
1. **Flag motivated sellers** - Large price drops indicate urgency
2. **Calculate deal score** - Compare current price to historical
3. **Track market trends** - See if prices are rising or falling
4. **Prioritize good deals** - Sort by price_change_percent ascending

**Recommendation:** Add price drop indicator to dashboard ("Price dropped 20%!").

---

### ✅ Dealer Information - Comprehensive

**Expected:** Basic dealer name and location
**Actual:** **Complete dealer profile with coordinates**

| Field | Coverage | Example | Notes |
|-------|----------|---------|-------|
| `dealer.id` | 100% | `1006810` | Marketcheck dealer ID |
| `dealer.name` | 100% | `"Potamkin Hyundai Stone Mountain"` | Full name |
| `dealer.dealer_type` | 100% | `"franchise"` | Franchise vs independent |
| `dealer.website` | 100% | `"potamkinatlanta.com"` | Domain only |
| `dealer.street` | 100% | `"4355 Stone Mountain Highway"` | Full address |
| `dealer.city` | 100% | `"Lilburn"` | City |
| `dealer.state` | 100% | `"GA"` | State code |
| `dealer.zip` | 100% | `"30047"` | ZIP code |
| `dealer.phone` | 100% | `"470-594-4395"` | Phone number |
| `dealer.latitude` | 100% | `"33.835237"` | Latitude (as string) |
| `dealer.longitude` | 100% | `"-84.081421"` | Longitude (as string) |
| `dealer.msa_code` | 100% | `"520"` | Metro area code |

**Use cases:**
1. **Map view** - Plot all cars on a map using coordinates
2. **Distance calculation** - Show "X miles from you"
3. **Dealer reputation** - Track which dealers have best inventory
4. **Franchise preference** - Filter by dealer type

**Note:** Coordinates are returned as **strings**, not numbers. Must parse to float for calculations.

---

### ✅ Vehicle Build Specs - Excellent Coverage

**Expected:** Basic transmission and drivetrain
**Actual:** **22 build fields including dimensions**

| Category | Fields | Coverage | Example Values |
|----------|--------|----------|----------------|
| **Powertrain** | `engine`, `engine_size`, `cylinders`, `transmission`, `drivetrain`, `fuel_type` | 100% | "2.5L I4", 2.5, 4, "Automatic", "FWD", "Unleaded" |
| **Efficiency** | `highway_mpg`, `city_mpg`, `powertrain_type` | 100% | 39, 28, "Combustion" |
| **Body** | `body_type`, `vehicle_type`, `doors` | 100% | "Sedan", "Car", 4 |
| **Dimensions** | `overall_height`, `overall_length`, `overall_width` | 100% | "58.7", "192.1", "72.4" (as strings) |
| **Seating** | `std_seating` | 100% | "5" (as string) |
| **Origin** | `made_in` | 100% | "USA", "Japan", etc. |
| **Advanced** | `trim`, `version`, `engine_block` | 100% | "LE", "LE", "I" |

**Example (2022 Toyota Camry):**
```json
{
  "build": {
    "year": 2022,
    "make": "Toyota",
    "model": "Camry",
    "trim": "LE",
    "version": "LE",
    "body_type": "Sedan",
    "vehicle_type": "Car",
    "transmission": "Automatic",
    "drivetrain": "FWD",
    "fuel_type": "Unleaded",
    "engine": "2.5L I4",
    "engine_size": 2.5,
    "engine_block": "I",
    "doors": 4,
    "cylinders": 4,
    "made_in": "USA",
    "overall_height": "58.7",
    "overall_length": "192.1",
    "overall_width": "72.4",
    "std_seating": "5",
    "highway_mpg": 39,
    "city_mpg": 28,
    "powertrain_type": "Combustion"
  }
}
```

**Note:** Dimensions and seating are **strings**, not numbers. Parse before calculations.

---

### ✅ Timing Fields - Multiple Metrics

**Expected:** `dom_active` (days on market)
**Actual:** **7 timing fields** with different interpretations

| Field | Coverage | Example | Meaning |
|-------|----------|---------|---------|
| `dom` | 100% | `32` | Total days on market (all time) |
| `dom_180` | 100% | `11` | Days on market (last 180 days) |
| `dom_active` | 100% | `11` | Days actively listed (current listing) |
| `dos_active` | 100% | `11` | Days on this specific site |
| `last_seen_at` | 100% | `1760192476` | Last time Marketcheck saw listing |
| `first_seen_at` | 100% | `1759675462` | First time in current listing period |
| `first_seen_at_mc` | 100% | `1646701456` | First time ever in Marketcheck (may be old) |

**Interpretation:**
- Use **`dom_active`** for "freshness" (lower = newer listing)
- Use **`dom_180`** for recent market activity
- Use **`dom`** to identify cars that have been listed multiple times
- Compare `dom` vs `dom_active` to detect re-listings

**Example:** A car with `dom=150` but `dom_active=5` was likely:
1. Listed 150 days ago
2. Removed from market
3. Re-listed 5 days ago (price drop? repair? trade-in fell through?)

**Use case:** Flag re-listings as potential deals (dealer is motivated).

---

## Unexpected Findings

### 1. ✅ `msrp` Field is Present

**Expected:** Not documented
**Actual:** Present in **100% of listings**

**Use case:** Calculate "deal percentage" = `(msrp - price) / msrp * 100`

**Example:**
```json
{
  "price": 22500,
  "msrp": 24900,
  "deal_percent": 9.6  // 9.6% below MSRP
}
```

---

### 2. ✅ `dist` Field for Location-Based Search

**Expected:** Not documented
**Actual:** Present when using ZIP + radius search

**Example:**
```json
{
  "dist": 82.68  // Miles from search ZIP (30301)
}
```

**Use case:** Sort by distance, show "X miles away" in UI.

---

### 3. ⚠️ `mc_dealership` Object is Duplicate

**Finding:** API returns both `dealer` and `mc_dealership` objects with identical data.

**Conclusion:** `mc_dealership` is internal Marketcheck metadata - **use `dealer` object only**.

---

### 4. ✅ Color Standardization

**Expected:** Raw color names only
**Actual:** Both raw and standardized colors

| Field | Type | Example |
|-------|------|---------|
| `exterior_color` | Raw | `"Meteorite Gray Metallic"` |
| `base_ext_color` | Standardized | `"Gray"` |
| `interior_color` | Raw | `"Ash"` |
| `base_int_color` | Standardized | `"Gray"` |

**Use case:** Filter by color using `base_ext_color` (more consistent).

---

## Data Quality Assessment

### ✅ Excellent Quality

| Metric | Score | Notes |
|--------|-------|-------|
| **Completeness** | 98% | All core fields present |
| **Accuracy** | High | VINs valid, prices reasonable |
| **Freshness** | High | `last_seen_at` within 24 hours |
| **Photo Coverage** | 100% | All cars have 8+ photos |
| **Dealer Info** | 100% | Complete contact info |

### ⚠️ Minor Issues

1. **Single-owner data** - Not populated (0/56)
2. **Numeric fields as strings** - `latitude`, `longitude`, `std_seating`, dimensions (must parse)
3. **Price history** - Only 40% coverage (rest are null)

### ✅ No Issues Found

- No missing VINs
- No duplicate VINs
- No invalid prices ($0 or negative)
- No invalid years (all 2013-2023)
- No missing dealer info
- No missing build specs

---

## Recommendations

### 1. ✅ Use Marketcheck Photos

**Finding:** 100% photo coverage with 8-26 photos per car

**Action:**
- Display dealer photos on vehicle detail page
- Keep IMAGIN.studio as fallback (offline mode)
- Use `photo_links_cached` for better performance

---

### 2. ⚠️ Remove Single-Owner Requirement

**Finding:** 0% single-owner in 56-car sample

**Action:**
- Remove from auto-reject filters
- Use as +10 bonus in priority scoring
- Expand search to other markets if critical

---

### 3. ✅ Add Price Drop Indicators

**Finding:** 40% of cars have price history

**Action:**
- Show "Price dropped 20%!" badge on cards
- Sort by price_change_percent
- Prioritize recent drops in recommendation algorithm

---

### 4. ✅ Add Distance/Map View

**Finding:** `dist` field and dealer coordinates available

**Action:**
- Show "X miles away" on vehicle cards
- Add map view to dashboard
- Filter by distance from user

---

### 5. ✅ Track Re-Listings

**Finding:** Multiple DOM fields reveal re-listing patterns

**Action:**
- Compare `dom` vs `dom_active`
- Flag re-listings as potential deals
- Track listing history over time

---

## Field Mapping for Database

### Required Conversions

| Field | API Type | DB Type | Conversion |
|-------|----------|---------|------------|
| `dealer.latitude` | String | DECIMAL(10,6) | `parseFloat()` |
| `dealer.longitude` | String | DECIMAL(10,6) | `parseFloat()` |
| `build.overall_height` | String | DECIMAL(5,1) | `parseFloat()` |
| `build.overall_length` | String | DECIMAL(5,1) | `parseFloat()` |
| `build.overall_width` | String | DECIMAL(5,1) | `parseFloat()` |
| `build.std_seating` | String | TEXT | No conversion (keep as string "5") |
| Unix timestamps | Number | TIMESTAMP | `new Date(timestamp * 1000).toISOString()` |
| `media.photo_links` | Array | JSONB | `JSON.stringify()` |

---

## Conclusion

**Overall:** Marketcheck API **exceeds expectations** in most areas.

**Strengths:**
- ✅ Comprehensive data (77 useful fields)
- ✅ 100% photo coverage
- ✅ Complete dealer information
- ✅ Excellent build specs
- ✅ Bonus features (price history, distance)

**Weaknesses:**
- ⚠️ Single-owner filter unreliable
- ⚠️ Some fields returned as strings (requires parsing)

**Verdict:** **Highly recommended** for production use.

---

**Last Updated:** 2025-10-12
**Data Source:** `data/marketcheck-2025-10-12.json` (56 listings)
**See Also:** [MARKETCHECK_DATA_FIRST_SUMMARY.md](./MARKETCHECK_DATA_FIRST_SUMMARY.md)
