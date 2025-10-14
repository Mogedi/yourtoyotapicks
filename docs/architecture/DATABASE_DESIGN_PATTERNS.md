# Database Design Patterns

**Status**: Active Architecture Pattern
**Applies To**: All database schema changes
**Last Updated**: October 14, 2025
**Based On**: V2.0 architecture lessons learned

## 🎯 Core Principle

**Separate Raw Data from Computed Insights**

This pattern allows safe recalculation of insights, supports multiple algorithm versions, and maintains data integrity.

---

## Table Structure Pattern

### Raw Data Table (Source of Truth)

```sql
/**
 * curated_listings - Source of truth for vehicle data
 *
 * Contains ONLY data from external sources (APIs, manual entry).
 * NO computed fields, NO derived data.
 * This table should NEVER be dropped - it's the foundation.
 */
CREATE TABLE curated_listings (
  -- Identity
  vin TEXT PRIMARY KEY,
  id TEXT UNIQUE DEFAULT gen_random_uuid(),

  -- Raw vehicle data from API
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  mileage INTEGER NOT NULL,

  -- Location data
  current_location TEXT,
  distance_miles NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,

  -- Vehicle history (from API)
  title_status TEXT,
  accident_count INTEGER DEFAULT 0,
  owner_count INTEGER DEFAULT 1,
  service_records INTEGER DEFAULT 0,

  -- Flags (from API)
  is_rental BOOLEAN DEFAULT FALSE,
  is_fleet BOOLEAN DEFAULT FALSE,
  flood_damage BOOLEAN DEFAULT FALSE,
  frame_damage BOOLEAN DEFAULT FALSE,

  -- Source tracking
  listing_url TEXT,
  source TEXT DEFAULT 'manual',
  date_listed TIMESTAMPTZ DEFAULT NOW(),
  date_added TIMESTAMPTZ DEFAULT NOW(),
  date_updated TIMESTAMPTZ DEFAULT NOW(),

  -- Images
  image_urls TEXT[],

  -- Description
  description TEXT,
  dealer_notes TEXT,

  CONSTRAINT valid_year CHECK (year >= 1990 AND year <= 2030),
  CONSTRAINT valid_price CHECK (price > 0),
  CONSTRAINT valid_mileage CHECK (mileage >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_curated_make_model ON curated_listings(make, model);
CREATE INDEX idx_curated_year ON curated_listings(year);
CREATE INDEX idx_curated_price ON curated_listings(price);
CREATE INDEX idx_curated_date_listed ON curated_listings(date_listed DESC);

COMMENT ON TABLE curated_listings IS
'Source of truth for vehicle listings. Contains ONLY raw data from external sources.
NO computed fields - use vehicle_insights for derived data.
Can be imported from APIs, scraped data, or manual entry.';
```

### Computed Insights Table (Derived Data)

```sql
/**
 * vehicle_insights - Computed/derived data from algorithms
 *
 * Contains ALL computed fields (scores, tiers, evaluations).
 * Can be DROPPED and recalculated anytime from curated_listings.
 * Supports multiple algorithm versions simultaneously.
 */
CREATE TABLE vehicle_insights (
  id SERIAL PRIMARY KEY,
  vin TEXT NOT NULL REFERENCES curated_listings(vin) ON DELETE CASCADE,
  version TEXT NOT NULL DEFAULT 'v2.0',

  -- Computed scores
  priority_score INTEGER CHECK (priority_score >= 0 AND priority_score <= 100),

  -- V2.0: Numeric tier (based on 6 verifiable criteria)
  tier_numeric INTEGER CHECK (tier_numeric IN (1, 2, 3, 4)),

  -- V2.0: Criteria counts
  verifiable_criteria_met INTEGER CHECK (
    verifiable_criteria_met >= 0 AND
    verifiable_criteria_met <= 6
  ),
  verifiable_criteria_total INTEGER DEFAULT 6,

  user_check_criteria_met INTEGER CHECK (
    user_check_criteria_met >= 0 AND
    user_check_criteria_met <= 6
  ),
  user_check_criteria_total INTEGER DEFAULT 6,

  -- V2.0: Split criteria results (JSONB)
  criteria_results JSONB,

  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: One insight per VIN per version
  UNIQUE(vin, version)
);

-- Indexes for common queries
CREATE INDEX idx_insights_tier_priority ON vehicle_insights(tier_numeric ASC, priority_score DESC);
CREATE INDEX idx_insights_version ON vehicle_insights(version);
CREATE INDEX idx_insights_vin ON vehicle_insights(vin);

-- Column comments documenting structure and TypeScript alignment
COMMENT ON COLUMN vehicle_insights.tier_numeric IS
'Quality tier as NUMBER (1=gold, 2=silver, 3=bronze, 4=standard).
MUST match TypeScript Tier enum in lib/constants/tier.ts:
{ GOLD: 1, SILVER: 2, BRONZE: 3, STANDARD: 4 }

Lower number = better tier (for sorting ASC).';

COMMENT ON COLUMN vehicle_insights.criteria_results IS
'Full evaluation results in JSON format.

Structure:
{
  verifiable: [CriterionResult...],  // 6 verifiable criteria (we can confirm)
  user_check: [CriterionResult...]   // 6 user-check criteria (user must verify via Carfax)
}

CriterionResult shape:
{
  criterion: string,    // Criterion ID (e.g., "low_mileage")
  passed: boolean|null, // Pass status (null = needs user verification)
  label: string,        // Display label (e.g., "Low Mileage for Year")
  reason: string        // Explanation (e.g., "45,230 miles < 50,000 avg for 2019")
}

Extract in TypeScript:
  vehicle.criteria_results?.verifiable  // Array of 6 verifiable criteria
  vehicle.criteria_results?.user_check  // Array of 6 user-check criteria';

COMMENT ON COLUMN vehicle_insights.version IS
'Algorithm version (e.g., "v1.0", "v2.0").
Allows multiple algorithm versions to coexist.
Latest version is "v2.0".';
```

---

## Why Separate Tables?

### ✅ Benefits of Separation

1. **Safe Recalculation**
   - Can drop `vehicle_insights` and recalculate without losing source data
   - Fix algorithm bugs without touching raw data
   - No risk of corrupting source data

2. **Algorithm Versioning**
   - Multiple versions can coexist (v1.0, v2.0, etc.)
   - Compare algorithms side-by-side
   - Gradual migration from old to new

3. **Clear Separation of Concerns**
   - Raw data team doesn't touch computed data
   - Algorithm team doesn't touch raw data
   - Easier to reason about

4. **Easy Debugging**
   - Compare raw vs computed data
   - Verify algorithm correctness
   - Audit trail for calculations

5. **Performance**
   - Index computed fields separately
   - Query only what you need
   - Optimize for different access patterns

### ❌ Problems with Mixed Tables (Don't Do This)

```sql
-- ❌ BAD: Mixing raw and computed in same table
CREATE TABLE vehicles (
  vin TEXT PRIMARY KEY,

  -- Raw data
  make TEXT,
  model TEXT,
  price INTEGER,

  -- Computed data (PROBLEM!)
  priority_score INTEGER,      -- What if algorithm changes?
  tier TEXT,                    -- How do we recalculate?
  criteria_results JSONB        -- Can't version this
);
```

**Problems:**

- Can't recalculate without complex UPDATE queries
- No algorithm versioning
- Risk of data corruption
- Hard to debug algorithm issues
- Mixed responsibilities

---

## View Pattern (Join Raw + Computed)

### Convenience View

```sql
/**
 * vehicles_with_insights - Convenience view joining raw + computed
 *
 * Provides denormalized data for application queries.
 * Always uses latest algorithm version (v2.0).
 * Sorted by tier (best first) → priority score within tier.
 */
CREATE VIEW vehicles_with_insights AS
SELECT
  -- All raw data
  m.*,

  -- Computed insights (V2.0 only)
  i.priority_score,
  i.tier_numeric,
  i.verifiable_criteria_met,
  i.verifiable_criteria_total,
  i.user_check_criteria_met,
  i.user_check_criteria_total,
  i.criteria_results,
  i.calculated_at,

  -- Rename for backwards compatibility (optional)
  i.criteria_results as insights_criteria_results

FROM curated_listings m
LEFT JOIN vehicle_insights i
  ON m.vin = i.vin
  AND i.version = 'v2.0'  -- Only latest version

ORDER BY
  -- Sort by tier (1=gold, 2=silver, 3=bronze, 4=standard)
  -- NULL tiers go last
  COALESCE(i.tier_numeric, 99) ASC,

  -- Within same tier, sort by priority score (high to low)
  COALESCE(i.priority_score, 0) DESC,

  -- Finally by date listed (newest first)
  m.date_listed DESC;

COMMENT ON VIEW vehicles_with_insights IS
'Denormalized view combining raw vehicle data with V2.0 computed insights.
Used by application for most queries. Automatically sorted by tier → score.
If view does not exist, queries should fall back to curated_listings.';
```

### Query Pattern (Try View, Fallback to Raw)

```typescript
// lib/database/supabase.ts

/**
 * Get all vehicles with insights.
 *
 * Tries vehicles_with_insights view first (has V2.0 computed data).
 * Falls back to curated_listings if view doesn't exist.
 */
export async function getListings(): Promise<Vehicle[]> {
  try {
    // Try view first (has V2.0 data)
    const { data, error } = await supabase
      .from('vehicles_with_insights')
      .select('*')
      .limit(100);

    if (error) {
      // If view doesn't exist (error code 42P01), fall back to raw table
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log(
          'View vehicles_with_insights not found, falling back to curated_listings'
        );

        const fallback = await supabase
          .from('curated_listings')
          .select('*')
          .limit(100);

        if (fallback.error) {
          throw fallback.error;
        }

        return fallback.data as Vehicle[];
      }

      throw error;
    }

    return data as Vehicle[];
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
}

/**
 * Get single vehicle by VIN with insights.
 */
export async function getListingByVin(vin: string): Promise<Vehicle | null> {
  try {
    // Try view first (V2.0 data)
    const { data, error } = await supabase
      .from('vehicles_with_insights')
      .select('*')
      .eq('vin', vin)
      .single();

    if (error) {
      // Not found
      if (error.code === 'PGRST116') {
        return null;
      }

      // View doesn't exist - fall back
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        const fallback = await supabase
          .from('curated_listings')
          .select('*')
          .eq('vin', vin)
          .single();

        if (fallback.error) {
          if (fallback.error.code === 'PGRST116') {
            return null;
          }
          throw fallback.error;
        }

        return fallback.data as Vehicle;
      }

      throw error;
    }

    return data as Vehicle;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw error;
  }
}
```

---

## CHECK Constraints

### Must Match TypeScript Enums EXACTLY

**The Rule**: Database CHECK constraints must use the same values as TypeScript enums.

#### TypeScript Enum

```typescript
// lib/constants/tier.ts

/**
 * Quality tier as numeric enum.
 *
 * Lower number = better tier (for database sorting):
 * - 1 = Gold (6/6 verifiable criteria)
 * - 2 = Silver (5/6 verifiable criteria)
 * - 3 = Bronze (4/6 verifiable criteria)
 * - 4 = Standard (<4/6 verifiable criteria)
 */
export const Tier = {
  GOLD: 1,
  SILVER: 2,
  BRONZE: 3,
  STANDARD: 4,
} as const;

export type TierNumeric = (typeof Tier)[keyof typeof Tier];
```

#### SQL CHECK Constraint (Must Match!)

```sql
-- CHECK constraint with SAME values as TypeScript
ALTER TABLE vehicle_insights
ADD COLUMN tier_numeric INTEGER CHECK (tier_numeric IN (1, 2, 3, 4));

-- COMMENT documents the mapping
COMMENT ON COLUMN vehicle_insights.tier_numeric IS
'Quality tier as NUMBER (1=gold, 2=silver, 3=bronze, 4=standard).
MUST match TypeScript Tier enum in lib/constants/tier.ts:
{ GOLD: 1, SILVER: 2, BRONZE: 3, STANDARD: 4 }';
```

### Why This Matters

**Without CHECK constraint:**

```typescript
// TypeScript allows 1-4
const tier: TierNumeric = 5;  // ❌ TypeScript error

// But database allows ANY integer
INSERT INTO vehicle_insights (tier_numeric) VALUES (999);  // ✅ Succeeds (bad!)
```

**With CHECK constraint:**

```typescript
// TypeScript allows 1-4
const tier: TierNumeric = 5;  // ❌ TypeScript error

// Database also rejects invalid values
INSERT INTO vehicle_insights (tier_numeric) VALUES (999);
-- ❌ ERROR: new row violates check constraint
```

---

## JSONB Structure Guidelines

### Document Structure in Comments

Always document JSONB structure in column comments:

```sql
CREATE TABLE vehicle_insights (
  -- ...
  criteria_results JSONB,
  -- ...
);

COMMENT ON COLUMN vehicle_insights.criteria_results IS
'Full evaluation results in JSON format.

Structure:
{
  verifiable: [CriterionResult...],  // 6 verifiable criteria
  user_check: [CriterionResult...]   // 6 user-check criteria
}

CriterionResult interface:
{
  criterion: string,      // e.g., "low_mileage"
  passed: boolean | null, // null = user must verify
  label: string,          // e.g., "Low Mileage for Year"
  reason: string          // e.g., "45,230 < 50,000 avg"
}

TypeScript extraction:
  const verifiable = vehicle.criteria_results?.verifiable;
  const userCheck = vehicle.criteria_results?.user_check;';
```

### Access Pattern in TypeScript

```typescript
// ✅ GOOD: Extract with type safety and fallbacks

// Define TypeScript interface matching JSONB structure
interface CriterionResult {
  criterion: string;
  passed: boolean | null;
  label: string;
  reason: string;
}

interface CriteriaResults {
  verifiable: CriterionResult[];
  user_check: CriterionResult[];
}

// Component usage
interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  // Extract with fallbacks for different query sources
  const verifiableCriteria =
    vehicle.criteria_results?.verifiable ||           // View field
    vehicle.insights_criteria_results?.verifiable ||  // Direct join field
    vehicle.verifiable_criteria_results ||            // Legacy field
    [];                                               // Empty fallback

  const userCheckCriteria =
    vehicle.criteria_results?.user_check ||
    vehicle.insights_criteria_results?.user_check ||
    vehicle.user_verification_required ||
    [];

  return (
    <CriteriaBadge
      tier={vehicle.tier_numeric}
      criteriaMet={vehicle.verifiable_criteria_met}
      totalCriteria={6}
      verifiableCriteria={verifiableCriteria}
      userCheckCriteria={userCheckCriteria}
    />
  );
}
```

### Why Multiple Fallbacks?

Different query sources expose JSONB data with different field names:

```sql
-- View (vehicles_with_insights)
SELECT
  *,
  i.criteria_results  -- Field name: criteria_results
FROM curated_listings m
LEFT JOIN vehicle_insights i ON m.vin = i.vin;

-- Direct join
SELECT
  m.*,
  i.criteria_results as insights_criteria_results  -- Field name: insights_criteria_results
FROM curated_listings m
LEFT JOIN vehicle_insights i ON m.vin = i.vin;

-- Legacy table (V1.0)
SELECT
  *,
  verifiable_criteria_results,  -- Field name: verifiable_criteria_results
  user_verification_required    -- Field name: user_verification_required
FROM curated_listings;
```

---

## Algorithm Versioning

### Support Multiple Versions Simultaneously

```sql
CREATE TABLE vehicle_insights (
  id SERIAL PRIMARY KEY,
  vin TEXT NOT NULL REFERENCES curated_listings(vin),
  version TEXT NOT NULL DEFAULT 'v2.0',  -- Algorithm version

  -- Computed fields
  priority_score INTEGER,
  tier_numeric INTEGER,
  -- ...

  -- Unique constraint: One insight per VIN per version
  UNIQUE(vin, version)
);

-- View filters to latest version only
CREATE VIEW vehicles_with_insights AS
SELECT
  m.*,
  i.priority_score,
  i.tier_numeric
FROM curated_listings m
LEFT JOIN vehicle_insights i
  ON m.vin = i.vin
  AND i.version = 'v2.0'  -- Only latest version
ORDER BY
  COALESCE(i.tier_numeric, 99) ASC,
  COALESCE(i.priority_score, 0) DESC;
```

### Query Specific Version

```typescript
/**
 * Get insights for a specific algorithm version.
 */
export async function getVehicleInsights(
  vin: string,
  version: string = 'v2.0'
): Promise<VehicleInsights | null> {
  const { data, error } = await supabase
    .from('vehicle_insights')
    .select('*')
    .eq('vin', vin)
    .eq('version', version)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data;
}

/**
 * Compare multiple algorithm versions.
 */
export async function compareAlgorithmVersions(
  vin: string
): Promise<VehicleInsights[]> {
  const { data, error } = await supabase
    .from('vehicle_insights')
    .select('*')
    .eq('vin', vin)
    .in('version', ['v1.0', 'v2.0'])
    .order('version', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
```

### Migration Strategy

**V1.0 → V2.0 migration:**

1. **Keep V1.0 data** (don't delete)
2. **Calculate V2.0 insights** (new rows with version='v2.0')
3. **Update view** to use v2.0
4. **Test thoroughly**
5. **Monitor for issues**
6. **Delete V1.0 data** (only after confidence)

```sql
-- Step 1: Both versions coexist
SELECT vin, version, tier_numeric, priority_score
FROM vehicle_insights
WHERE vin = 'ABC123';

-- Result:
-- vin     version  tier_numeric  priority_score
-- ABC123  v1.0     'gold'        85    (old string tier)
-- ABC123  v2.0     1             87    (new numeric tier)

-- Step 2: View uses v2.0
SELECT * FROM vehicles_with_insights WHERE vin = 'ABC123';
-- Returns: tier_numeric=1, priority_score=87 (V2.0 data)

-- Step 3: After confidence, delete V1.0
DELETE FROM vehicle_insights WHERE version = 'v1.0';
```

---

## Index Strategy

### Composite Indexes for Common Queries

```sql
-- Most common: Sort by tier, then score (used by view)
CREATE INDEX idx_tier_priority
ON vehicle_insights(tier_numeric ASC NULLS LAST, priority_score DESC);

-- Filter by version
CREATE INDEX idx_version
ON vehicle_insights(version);

-- Lookup by VIN (foreign key)
CREATE INDEX idx_vin
ON vehicle_insights(vin);

-- Composite: VIN + version (unique constraint automatically creates this)
-- UNIQUE(vin, version) creates: idx_vehicle_insights_vin_version_key

-- JSONB queries (if needed)
CREATE INDEX idx_criteria_results_gin
ON vehicle_insights USING GIN (criteria_results);
```

### Query Performance

**Good query (uses indexes):**

```sql
-- Uses idx_tier_priority
SELECT * FROM vehicle_insights
WHERE tier_numeric = 1
ORDER BY priority_score DESC
LIMIT 10;

-- Uses idx_vin
SELECT * FROM vehicle_insights
WHERE vin = 'ABC123'
AND version = 'v2.0';
```

**Bad query (no index):**

```sql
-- Full table scan - no index on priority_score alone
SELECT * FROM vehicle_insights
WHERE priority_score > 80;

-- Consider adding index:
CREATE INDEX idx_priority_score ON vehicle_insights(priority_score DESC);
```

---

## Recalculation Script Pattern

### Safe Recalculation Process

```typescript
// scripts/recalculate-scores.ts

/**
 * Recalculate all vehicle insights with V2.0 algorithm.
 *
 * SAFE because:
 * - Doesn't touch curated_listings (raw data)
 * - Uses UPSERT to update existing or insert new
 * - Version-aware (won't overwrite other versions)
 * - Can be run multiple times safely (idempotent)
 */
async function recalculateAllScores() {
  console.log('🔄 Recalculating V2.0 insights...\n');

  // Step 1: Fetch raw data (source of truth)
  const { data: vehicles, error: fetchError } = await supabase
    .from('curated_listings')
    .select('*');

  if (fetchError || !vehicles) {
    console.error('❌ Error fetching vehicles:', fetchError);
    return;
  }

  console.log(`✅ Fetched ${vehicles.length} vehicles\n`);

  // Step 2: Calculate insights for each vehicle
  const updates = vehicles.map((vehicle) => {
    // Calculate priority score
    const priorityScore = calculatePriorityScore(vehicle);

    // Evaluate criteria (V2.0)
    const criteriaEval = evaluateAllCriteria(vehicle);

    return {
      vin: vehicle.vin,
      version: 'v2.0',
      priority_score: priorityScore,
      tier_numeric: criteriaEval.tier_numeric,
      verifiable_criteria_met: criteriaEval.verifiable_criteria_met,
      verifiable_criteria_total: 6,
      user_check_criteria_met: 0, // Not calculated yet
      user_check_criteria_total: 6,
      criteria_results: {
        verifiable: criteriaEval.verifiable_criteria_results,
        user_check: criteriaEval.user_verification_required,
      },
    };
  });

  // Step 3: Upsert to database (update or insert)
  console.log('💾 Writing to vehicle_insights...\n');

  for (const update of updates) {
    const { error } = await supabase.from('vehicle_insights').upsert(update, {
      onConflict: 'vin,version', // Unique constraint
    });

    if (error) {
      console.error(`❌ Failed to update ${update.vin}:`, error.message);
    } else {
      process.stdout.write(`✅ Updated: ${update.vin}\r`);
    }
  }

  console.log('\n✅ Recalculation complete!');
}

// Run the script
recalculateAllScores();
```

### When to Recalculate

**Trigger recalculation when:**

- Algorithm changes
- Weights/thresholds change
- New criteria added
- Bug fixes in calculation logic
- Testing new algorithm versions

**Don't recalculate for:**

- New raw data (calculate on insert)
- UI changes (no impact on logic)
- Documentation updates

---

## Migration Best Practices

### Create Migration Template

```sql
-- Migration: YYYYMMDDHHMMSS_description.sql
-- Example: 20251014120000_add_vehicle_insights.sql

-- ========================================
-- Migration: Add vehicle_insights table
-- Date: 2025-10-14
-- Author: YourName
-- Description: Separate computed insights from raw data
-- ========================================

-- Step 1: Create insights table
CREATE TABLE IF NOT EXISTS vehicle_insights (
  id SERIAL PRIMARY KEY,
  vin TEXT NOT NULL REFERENCES curated_listings(vin) ON DELETE CASCADE,
  version TEXT NOT NULL DEFAULT 'v2.0',

  -- Computed fields
  priority_score INTEGER CHECK (priority_score >= 0 AND priority_score <= 100),
  tier_numeric INTEGER CHECK (tier_numeric IN (1, 2, 3, 4)),

  -- ... other fields ...

  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(vin, version)
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_insights_tier_priority
ON vehicle_insights(tier_numeric ASC, priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_insights_version
ON vehicle_insights(version);

-- Step 3: Add column comments
COMMENT ON TABLE vehicle_insights IS
'Computed insights from algorithms. Can be recalculated from curated_listings.';

COMMENT ON COLUMN vehicle_insights.tier_numeric IS
'Quality tier (1=gold, 2=silver, 3=bronze, 4=standard).
Must match TypeScript Tier enum in lib/constants/tier.ts.';

-- Step 4: Create or replace view
CREATE OR REPLACE VIEW vehicles_with_insights AS
SELECT
  m.*,
  i.priority_score,
  i.tier_numeric,
  i.criteria_results
FROM curated_listings m
LEFT JOIN vehicle_insights i
  ON m.vin = i.vin
  AND i.version = 'v2.0'
ORDER BY
  COALESCE(i.tier_numeric, 99) ASC,
  COALESCE(i.priority_score, 0) DESC;

-- Step 5: Verify migration
DO $$
BEGIN
  -- Check table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicle_insights') THEN
    RAISE EXCEPTION 'Migration failed: vehicle_insights table not created';
  END IF;

  -- Check view exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'vehicles_with_insights') THEN
    RAISE EXCEPTION 'Migration failed: vehicles_with_insights view not created';
  END IF;

  RAISE NOTICE '✅ Migration successful';
END $$;
```

---

## Related Documentation

- **Migration Lessons**: [V2_MIGRATION_LESSONS.md](./V2_MIGRATION_LESSONS.md) - Real bugs we hit
- **Layer Separation**: [LAYER_SEPARATION_PRINCIPLES.md](./LAYER_SEPARATION_PRINCIPLES.md)
- **Feature Checklist**: [../development/FEATURE_ADDITION_CHECKLIST.md](../development/FEATURE_ADDITION_CHECKLIST.md)
- **Quick Reference**: [../../CLAUDE.md](../../CLAUDE.md) - Architecture Principles section
