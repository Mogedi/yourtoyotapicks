# Layer Separation Principles

**Status**: Active Architecture Rule
**Applies To**: All new code and refactors
**Last Updated**: October 14, 2025

## 🎯 Core Principle

**Data Layer = Primitives Only | UI Layer = All Formatting**

This is the foundational rule for maintaining clean, maintainable architecture in YourToyotaPicks.

### Why This Matters

- **Testability**: Data logic can be tested without UI dependencies
- **Reusability**: Same data can be displayed in multiple formats
- **Maintainability**: Changing UI doesn't require data layer changes
- **Type Safety**: Primitives are more type-safe than strings
- **Performance**: Primitives are smaller and faster to serialize

---

## Data Layer Rules

### ✅ DO: Use Primitives

Data layer should ONLY return these types:

```typescript
// ✅ Numbers (for enums, counts, scores)
tier_numeric: 1 | 2 | 3 | 4
verifiable_criteria_met: 6
priority_score: 87

// ✅ Booleans (for flags)
is_rental: true
is_fleet: false
flood_damage: false

// ✅ Strings for identifiers only
vin: "5YFBURHE5HP690324"
make: "Toyota"
model: "RAV4"

// ✅ Enums as numeric constants
export const Tier = {
  GOLD: 1,
  SILVER: 2,
  BRONZE: 3,
  STANDARD: 4,
} as const;

// ✅ Arrays/Objects of primitives
criteria_results: {
  verifiable: [...],  // Array of CriterionResult
  user_check: [...]   // Array of CriterionResult
}
```

### ❌ DON'T: Return UI Concerns

Data layer should NEVER return:

```typescript
// ❌ Emojis
tier_emoji: '🥇';
tier_emoji: '🥈';

// ❌ Display labels
tier_label: 'Gold';
tier_label: 'Silver';

// ❌ CSS classes
tier_class: 'bg-yellow-500';
tier_color: 'text-blue-600';

// ❌ Formatted strings
price_formatted: '$12,345';
mileage_formatted: '45,000 mi';

// ❌ HTML/JSX
tier_html: '<span class="badge">Gold</span>';
```

### Why Primitives?

**Problem with strings:**

```typescript
// ❌ BAD: String-based tier
tier: 'gold' | 'silver' | 'bronze' | 'standard';

// Issues:
// - Can't sort efficiently (alphabetical: bronze, gold, silver, standard)
// - Database needs string comparison
// - Easy to typo ('glod' instead of 'gold')
// - Takes more space (4-8 bytes vs 1 byte)
// - Slower to compare
```

**Solution with numbers:**

```typescript
// ✅ GOOD: Numeric tier
tier_numeric: 1 | 2 | 3 | 4;

// Benefits:
// - Natural sort order (1 < 2 < 3 < 4)
// - Fast integer comparison in database
// - Type-safe (can't typo a number)
// - Compact (1 byte in database)
// - Fast to serialize/deserialize
```

---

## Enum & Constants Pattern

### Single Source of Truth

Create ONE canonical definition for each enum:

```typescript
// lib/constants/tier.ts

/**
 * Quality tier as numeric enum.
 *
 * Lower number = better tier (for database sorting):
 * - 1 = Gold (best)
 * - 2 = Silver
 * - 3 = Bronze
 * - 4 = Standard (worst)
 */
export const Tier = {
  GOLD: 1,
  SILVER: 2,
  BRONZE: 3,
  STANDARD: 4,
} as const;

export type TierNumeric = (typeof Tier)[keyof typeof Tier];

// Helper to get tier name (for debugging only)
export const TIER_NAMES: Record<TierNumeric, string> = {
  [Tier.GOLD]: 'gold',
  [Tier.SILVER]: 'silver',
  [Tier.BRONZE]: 'bronze',
  [Tier.STANDARD]: 'standard',
};
```

### Database Alignment

Database CHECK constraints MUST match TypeScript enum exactly:

```sql
-- supabase/migrations/20251014000000_create_vehicle_insights.sql

CREATE TABLE vehicle_insights (
  vin TEXT REFERENCES curated_listings(vin),

  -- ✅ CHECK constraint matches TypeScript Tier enum
  tier_numeric INTEGER CHECK (tier_numeric IN (1, 2, 3, 4)),

  verifiable_criteria_met INTEGER CHECK (
    verifiable_criteria_met >= 0 AND
    verifiable_criteria_met <= 6
  ),

  -- ...
);

-- ✅ Document the mapping
COMMENT ON COLUMN vehicle_insights.tier_numeric IS
'Quality tier as NUMBER (1=gold, 2=silver, 3=bronze, 4=standard).
MUST match TypeScript Tier enum in lib/constants/tier.ts:
{ GOLD: 1, SILVER: 2, BRONZE: 3, STANDARD: 4 }

Lower number = better tier (for sorting ASC)';
```

### UI Layer Mapping

Map numeric primitives to visual elements in separate file:

```typescript
// lib/utils/tier-visuals.ts

import { Tier, type TierNumeric } from '@/lib/constants/tier';

/**
 * Visual representation for quality tiers.
 *
 * This is the ONLY place where tier visuals are defined.
 * Data layer returns tier_numeric (1-4), UI layer uses this mapping.
 */
export interface TierVisuals {
  emoji: string;
  label: string;
  color: string; // Tailwind text color
  bgColor: string; // Tailwind background color
  borderColor: string; // Tailwind border color
}

export const TIER_VISUALS: Record<TierNumeric, TierVisuals> = {
  [Tier.GOLD]: {
    emoji: '🥇',
    label: 'Gold',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  [Tier.SILVER]: {
    emoji: '🥈',
    label: 'Silver',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  [Tier.BRONZE]: {
    emoji: '🥉',
    label: 'Bronze',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  [Tier.STANDARD]: {
    emoji: '⚪',
    label: 'Standard',
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
};

/**
 * Get visual elements for a tier.
 *
 * @param tier - Numeric tier (1-4)
 * @returns Visual elements (emoji, label, colors)
 */
export function getTierVisuals(tier: TierNumeric): TierVisuals {
  return TIER_VISUALS[tier];
}

/**
 * Get tier label with emoji prefix.
 *
 * @param tier - Numeric tier (1-4)
 * @returns Formatted label like "🥇 Gold"
 */
export function getTierLabelWithEmoji(tier: TierNumeric): string {
  const { emoji, label } = TIER_VISUALS[tier];
  return `${emoji} ${label}`;
}
```

### Component Usage

Components consume primitives and map to visuals:

```typescript
// components/CriteriaBadge.tsx

import { getTierVisuals } from '@/lib/utils/tier-visuals';
import type { TierNumeric } from '@/lib/constants/tier';

interface CriteriaBadgeProps {
  tier: TierNumeric;  // ✅ Numeric primitive from data layer
  criteriaMet: number;
  totalCriteria: number;
}

export function CriteriaBadge({ tier, criteriaMet, totalCriteria }: CriteriaBadgeProps) {
  // ✅ Map primitive to visuals in component
  const { emoji, label, color, bgColor, borderColor } = getTierVisuals(tier);

  return (
    <div className={`flex items-center gap-2 ${bgColor} ${borderColor} border rounded-lg px-3 py-1.5`}>
      <span className={`text-lg ${color}`}>{emoji}</span>
      <span className="font-medium">{label}</span>
      <span className="text-sm text-gray-600">
        {criteriaMet}/{totalCriteria}
      </span>
    </div>
  );
}
```

---

## JSONB Storage Patterns

### Structured Data

Store complex data structures as JSONB with clear schema:

```typescript
// ✅ GOOD: Split structure with clear purpose
{
  verifiable: [
    {
      criterion: 'low_mileage',
      passed: true,
      label: 'Low Mileage',
      reason: 'Below average for 2019 (45,230 < 50,000)'
    },
    // ... 6 total verifiable criteria
  ],
  user_check: [
    {
      criterion: 'no_accidents',
      passed: null,  // User must verify via Carfax
      label: 'No Accidents',
      reason: 'Check Carfax report for accident history'
    },
    // ... 6 total user-check criteria
  ]
}

// ❌ BAD: Flat array loses meaning
[
  { criterion: 'low_mileage', passed: true, ... },
  { criterion: 'no_accidents', passed: null, ... },
  // Which ones are verifiable? Which need user check?
]
```

### Database Schema

Document JSONB structure in migration:

```sql
CREATE TABLE vehicle_insights (
  -- ...

  criteria_results JSONB,

  -- ...
);

-- ✅ Document structure
COMMENT ON COLUMN vehicle_insights.criteria_results IS
'Full evaluation results in JSON format.

Structure:
{
  verifiable: [CriterionResult...],  // 6 verifiable criteria (we can confirm)
  user_check: [CriterionResult...]   // 6 user-check criteria (user must verify via Carfax)
}

CriterionResult shape:
{
  criterion: string,    // Criterion ID
  passed: boolean|null, // Pass status (null = needs user verification)
  label: string,        // Display label
  reason: string        // Explanation
}';
```

### Component Extraction

Extract JSONB data with proper fallbacks:

```typescript
// ✅ GOOD: Extract with multiple fallback paths
<CriteriaBadge
  tier={vehicle.tier_numeric}
  criteriaMet={vehicle.verifiable_criteria_met}
  totalCriteria={6}
  // Extract verifiable array with fallbacks
  verifiableCriteria={
    vehicle.criteria_results?.verifiable ||             // View field
    vehicle.insights_criteria_results?.verifiable ||    // Direct join field
    vehicle.verifiable_criteria_results ||              // Legacy field
    []                                                   // Empty fallback
  }
  // Extract user_check array with fallbacks
  userCheckCriteria={
    vehicle.criteria_results?.user_check ||
    vehicle.insights_criteria_results?.user_check ||
    vehicle.user_verification_required ||
    []
  }
/>

// ❌ BAD: No extraction, passes entire object
<CriteriaBadge
  tier={vehicle.tier_numeric}
  criteriaMet={vehicle.verifiable_criteria_met}
  totalCriteria={6}
  results={vehicle.criteria_results}  // Wrong - can't display split sections
/>
```

### Why Multiple Fallbacks?

Different query sources expose JSONB data with different field names:

```typescript
// vehicles_with_insights view (preferred)
SELECT
  *,
  i.criteria_results  -- Field name: criteria_results
FROM curated_listings m
LEFT JOIN vehicle_insights i ON m.vin = i.vin;

// Direct join (if view doesn't exist)
SELECT
  m.*,
  i.criteria_results as insights_criteria_results  -- Field name: insights_criteria_results
FROM curated_listings m
LEFT JOIN vehicle_insights i ON m.vin = i.vin;

// Legacy table (V1.0 data)
SELECT
  *,
  verifiable_criteria_results,  -- Field name: verifiable_criteria_results
  user_verification_required    -- Field name: user_verification_required
FROM curated_listings;
```

---

## Import Naming Patterns

### Avoid Name Collisions

Always alias imports when there's potential for collision:

```typescript
// ❌ BAD: Import shadows local function
import { calculateTier } from '@/lib/constants/tier';

// ... 100+ lines later ...

export function calculateTier(criteriaMet: number) {
  // This function shadows the import!
  // Calls to calculateTier() will use THIS function, not the import
}

// ✅ GOOD: Alias imports when needed
import { calculateTier as calculateTierNumeric } from '@/lib/constants/tier';

export function calculateTier(criteriaMet: number) {
  // Now we can call the imported function explicitly
  const tier = calculateTierNumeric(criteriaMet);
  return tierNumericToLegacyString(tier);
}
```

### Naming Conventions

Use descriptive aliases that clarify intent:

```typescript
// ✅ GOOD: Clear aliases
import { calculateTier as calculateTierNumeric } from '@/lib/constants/tier';
import { getTierVisuals as getTierUI } from '@/lib/utils/tier-visuals';
import { Tier } from '@/lib/constants/tier';

// ✅ GOOD: Namespace imports for clarity
import * as TierUtils from '@/lib/constants/tier';
import * as TierVisuals from '@/lib/utils/tier-visuals';

const tier = TierUtils.calculateTier(6);
const { emoji, label } = TierVisuals.getTierVisuals(tier);
```

---

## Type System Conventions

### Numeric vs String Types

Always prefer numeric types for new code:

```typescript
// ✅ NEW: Numeric types (preferred)
export type TierNumeric = 1 | 2 | 3 | 4;

export interface VehicleInsights {
  tier_numeric: TierNumeric;
  verifiable_criteria_met: number; // 0-6
  user_check_criteria_met: number; // 0-6
}

// ⚠️ LEGACY: String types (deprecated, for backwards compatibility only)
export type TierString = 'gold' | 'silver' | 'bronze' | 'standard';

export interface LegacyVehicle {
  criteria_tier: TierString;
  criteria_met: number; // 0-12 (combined verifiable + user-check)
}
```

### Backwards Compatibility

Support both old and new types during migration:

```typescript
// ✅ Support both types with proper fallbacks
export interface Vehicle {
  // V2.0 fields (preferred)
  tier_numeric?: TierNumeric;
  verifiable_criteria_met?: number;

  // V1.0 fields (deprecated)
  /** @deprecated Use tier_numeric instead */
  criteria_tier?: TierString;
  /** @deprecated Use verifiable_criteria_met instead */
  criteria_met?: number;
}

// ✅ Component handles both
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  // Try V2.0 first, fallback to V1.0
  const tier = vehicle.tier_numeric ||
               legacyStringToNumeric(vehicle.criteria_tier);

  const { emoji, label } = getTierVisuals(tier);

  return (
    <div>
      <span>{emoji} {label}</span>
    </div>
  );
}

// ✅ Conversion helper for migration
export function legacyStringToNumeric(tierString?: TierString): TierNumeric {
  switch (tierString) {
    case 'gold': return Tier.GOLD;
    case 'silver': return Tier.SILVER;
    case 'bronze': return Tier.BRONZE;
    default: return Tier.STANDARD;
  }
}
```

---

## File Organization

### Recommended Structure

```
lib/
├── constants/
│   ├── tier.ts              # ✅ Numeric enum definitions
│   ├── criteria.ts          # ✅ Criteria constants
│   └── ...
├── utils/
│   ├── tier-visuals.ts      # ✅ UI mappings for tiers
│   ├── criteria-visuals.ts  # ✅ UI mappings for criteria
│   └── ...
├── types.ts                 # ✅ TypeScript interfaces
├── scoring/
│   ├── priority-calculator.ts    # ✅ Returns numbers only
│   └── criteria-evaluator.ts     # ✅ Returns primitives only
└── services/
    └── vehicle-service.ts    # ✅ Business logic, no UI
```

### Layer Boundaries

```typescript
// ✅ ALLOWED: Data layer → Data layer
import { Tier } from '@/lib/constants/tier';
import { calculatePriorityScore } from '@/lib/scoring/priority-calculator';

// ✅ ALLOWED: UI layer → Data layer
import { getTierVisuals } from '@/lib/utils/tier-visuals';
import { Tier } from '@/lib/constants/tier';

// ❌ FORBIDDEN: Data layer → UI layer
// lib/scoring/criteria-evaluator.ts
import { getTierVisuals } from '@/lib/utils/tier-visuals'; // ❌ NO!

// ❌ FORBIDDEN: Data layer returns UI concerns
export function evaluateCriteria(): CriteriaEvaluation {
  return {
    tier_emoji: '🥇', // ❌ NO!
    tier_label: 'Gold', // ❌ NO!
  };
}
```

---

## Quick Reference

### ✅ DO

| Layer    | Allowed                                                     |
| -------- | ----------------------------------------------------------- |
| **Data** | Numbers, booleans, string IDs, arrays/objects of primitives |
| **UI**   | Emojis, labels, colors, CSS classes, formatted strings      |

### ❌ DON'T

| Layer    | Forbidden                                              |
| -------- | ------------------------------------------------------ |
| **Data** | Emojis, display labels, CSS classes, formatted strings |
| **UI**   | Business logic, calculations, database queries         |

### Migration Pattern

```typescript
// 1. Define numeric enum
export const Tier = { GOLD: 1, SILVER: 2, BRONZE: 3, STANDARD: 4 };

// 2. Create UI mapping
export const TIER_VISUALS = {
  [Tier.GOLD]: { emoji: '🥇', label: 'Gold', ... },
  // ...
};

// 3. Update database
tier_numeric INTEGER CHECK (tier_numeric IN (1, 2, 3, 4))

// 4. Update services to return tier_numeric
return { tier_numeric: Tier.GOLD };

// 5. Update components to map to UI
const { emoji, label } = getTierVisuals(vehicle.tier_numeric);
```

---

## Related Documentation

- **Migration Lessons**: [V2_MIGRATION_LESSONS.md](./V2_MIGRATION_LESSONS.md) - Real bugs we encountered
- **Database Patterns**: [DATABASE_DESIGN_PATTERNS.md](./DATABASE_DESIGN_PATTERNS.md)
- **Feature Checklist**: [../development/FEATURE_ADDITION_CHECKLIST.md](../development/FEATURE_ADDITION_CHECKLIST.md)
- **Quick Reference**: [../../CLAUDE.md](../../CLAUDE.md) - Architecture Principles section
