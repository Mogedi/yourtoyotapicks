# Feature Addition Checklist

**Purpose**: Step-by-step guide for safely adding new features to YourToyotaPicks
**Last Updated**: October 14, 2025
**Based On**: V2.0 architecture lessons learned

## 📋 Overview

This checklist ensures you don't skip critical steps when adding features. Following this workflow prevents the bugs we encountered during V2.0 refactor (name collisions, mixed UI/data concerns, test failures).

**Time Investment**: 5 minutes reading, 0 minutes debugging
**Time Saved**: 5-7+ hours per feature

---

## Phase 1: Pre-Flight Checks ✈️

### Before Writing ANY Code

- [ ] **Run all existing tests**

  ```bash
  npm test              # Unit tests (should see "292 passing")
  npm run test:e2e      # E2E tests (should see "12/13 passing")
  ```

  - ✅ All must pass before proceeding
  - ❌ If any fail, fix them first - DO NOT add new features on broken code

- [ ] **Review architecture docs** (15 minutes)
  - [ ] [LAYER_SEPARATION_PRINCIPLES.md](../architecture/LAYER_SEPARATION_PRINCIPLES.md) - Data vs UI rules
  - [ ] [V2_MIGRATION_LESSONS.md](../architecture/V2_MIGRATION_LESSONS.md) - Common mistakes
  - [ ] [DATABASE_DESIGN_PATTERNS.md](../architecture/DATABASE_DESIGN_PATTERNS.md) - If touching database

- [ ] **Create feature branch**

  ```bash
  git checkout -b feature/your-feature-name
  git commit --allow-empty -m "chore: start feature-name"
  ```

- [ ] **Document current state** (screenshot UI if applicable)

---

## Phase 2: Design & Planning 📐

### Define Constants & Enums FIRST

Constants and enums are the foundation. Define these before writing any other code.

- [ ] **Create or update constants file**

  ```typescript
  // lib/constants/your-feature.ts

  /**
   * Your feature configuration.
   *
   * IMPORTANT: These values must match database CHECK constraints.
   */
  export const FeatureEnum = {
    VALUE_1: 1,
    VALUE_2: 2,
    VALUE_3: 3,
  } as const;

  export type FeatureType = (typeof FeatureEnum)[keyof typeof FeatureEnum];

  export const FEATURE_CONFIG = {
    MAX_ITEMS: 100,
    DEFAULT_VALUE: FeatureEnum.VALUE_1,
  } as const;
  ```

- [ ] **Define TypeScript types**

  ```typescript
  // lib/types.ts (or new file if complex)

  import type { FeatureType } from '@/lib/constants/your-feature';

  /**
   * Your feature interface.
   *
   * RULES:
   * - Only primitives (numbers, booleans, string IDs)
   * - NO emojis, labels, or UI strings
   * - NO formatted values
   */
  export interface YourFeature {
    id: string;
    value: FeatureType; // ✅ Numeric enum
    count: number; // ✅ Primitive
    enabled: boolean; // ✅ Primitive
    // ❌ NO: label: '🎯 Feature'
    // ❌ NO: displayValue: 'Value 1'
  }
  ```

### Database Schema (If Needed)

Only proceed with database changes after constants and types are defined.

- [ ] **Create migration file**

  ```bash
  # Naming: YYYYMMDDHHMMSS_description.sql
  touch supabase/migrations/20251014120000_add_your_feature.sql
  ```

- [ ] **Follow separation pattern**

  ```sql
  -- Raw data in source table
  ALTER TABLE curated_listings
  ADD COLUMN your_feature_raw TEXT;

  -- Computed data in insights table
  ALTER TABLE vehicle_insights
  ADD COLUMN your_feature_computed INTEGER;

  -- Update view to expose both
  CREATE OR REPLACE VIEW vehicles_with_insights AS
  SELECT
    m.*,
    i.your_feature_computed
  FROM curated_listings m
  LEFT JOIN vehicle_insights i ON m.vin = i.vin;
  ```

- [ ] **Add CHECK constraints that match TypeScript**

  ```sql
  ALTER TABLE vehicle_insights
  ADD COLUMN feature_type INTEGER CHECK (feature_type IN (1, 2, 3));
  -- Must match: FeatureEnum = { VALUE_1: 1, VALUE_2: 2, VALUE_3: 3 }
  ```

- [ ] **Add column comments documenting the mapping**

  ```sql
  COMMENT ON COLUMN vehicle_insights.feature_type IS
  'Feature type as NUMBER (1=value1, 2=value2, 3=value3).
  MUST match TypeScript FeatureEnum in lib/constants/your-feature.ts:
  { VALUE_1: 1, VALUE_2: 2, VALUE_3: 3 }';
  ```

---

## Phase 3: Implementation Order 🔨

### Step 1: Constants & Types (Data Layer)

- [ ] Create enum/constants file
- [ ] Define TypeScript types
- [ ] Export from types index
- [ ] **Run tests** (should still pass - no code changes yet)
  ```bash
  npm test
  ```

### Step 2: Database (If Needed)

- [ ] Create migration file
- [ ] Test migration locally
  ```bash
  npx supabase db push  # Or your migration command
  ```
- [ ] Verify schema matches TypeScript
  ```sql
  \d+ vehicle_insights  -- Check column types and constraints
  ```
- [ ] Add seed data if needed
- [ ] **Run tests**

### Step 3: Services/Utils (Business Logic)

**IMPORTANT**: Write tests BEFORE implementation (TDD approach).

- [ ] **Write unit tests first**

  ```typescript
  // lib/services/__tests__/your-feature-service.test.ts

  describe('YourFeatureService', () => {
    it('should calculate feature value correctly', () => {
      const result = calculateFeature({ count: 5 });
      expect(result.value).toBe(FeatureEnum.VALUE_1);
    });
  });
  ```

- [ ] **Implement service functions**

  ```typescript
  // lib/services/your-feature-service.ts

  import { FeatureEnum, type FeatureType } from '@/lib/constants/your-feature';

  /**
   * Calculate feature value.
   *
   * RULES:
   * - Return primitives only (no UI concerns)
   * - No emojis, labels, or formatting
   */
  export function calculateFeature(input: { count: number }): {
    value: FeatureType; // ✅ Numeric
    score: number; // ✅ Primitive
  } {
    // Business logic here
    return {
      value: FeatureEnum.VALUE_1,
      score: 85,
    };
  }
  ```

- [ ] **Run tests** (new tests should pass)
  ```bash
  npm test -- your-feature-service
  ```

### Step 4: API/Queries (Data Fetching)

- [ ] **Update query functions**

  ```typescript
  // lib/database/supabase.ts

  export async function getFeatureData(): Promise<YourFeature[]> {
    // Try view first (with V2.0 computed data)
    const { data, error } = await supabase
      .from('vehicles_with_insights')
      .select('*');

    if (error) {
      // Fallback to raw table if view doesn't exist
      if (error.code === '42P01') {
        return await supabase.from('curated_listings').select('*');
      }
      throw error;
    }

    return data;
  }
  ```

- [ ] **Add fallback handling**
- [ ] **Write tests for queries**
- [ ] **Run tests**

### Step 5: UI Layer (Visual Mapping)

- [ ] **Create visual mapping file**

  ```typescript
  // lib/utils/your-feature-visuals.ts

  import { FeatureEnum, type FeatureType } from '@/lib/constants/your-feature';

  /**
   * Visual representation for feature types.
   *
   * This is the ONLY place where feature visuals are defined.
   */
  export interface FeatureVisuals {
    emoji: string;
    label: string;
    color: string;
    bgColor: string;
  }

  export const FEATURE_VISUALS: Record<FeatureType, FeatureVisuals> = {
    [FeatureEnum.VALUE_1]: {
      emoji: '✅',
      label: 'Value 1',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    // ...
  };

  export function getFeatureVisuals(type: FeatureType): FeatureVisuals {
    return FEATURE_VISUALS[type];
  }
  ```

### Step 6: Components

- [ ] **Update or create components**

  ```typescript
  // components/YourFeatureComponent.tsx

  import { getFeatureVisuals } from '@/lib/utils/your-feature-visuals';
  import type { FeatureType } from '@/lib/constants/your-feature';

  interface YourFeatureProps {
    type: FeatureType;  // ✅ Receive primitive from data layer
  }

  export function YourFeature({ type }: YourFeatureProps) {
    // ✅ Map primitive to visuals in component
    const { emoji, label, color, bgColor } = getFeatureVisuals(type);

    return (
      <div className={`${bgColor} ${color}`}>
        {emoji} {label}
      </div>
    );
  }
  ```

- [ ] **Extract JSONB data properly** (if applicable)

  ```typescript
  // ✅ GOOD: Extract with fallbacks
  <YourFeature
    data={
      vehicle.feature_data?.specific_field ||
      vehicle.legacy_field ||
      []
    }
  />

  // ❌ BAD: Pass entire JSONB
  <YourFeature data={vehicle.feature_data} />
  ```

- [ ] **Use new field names, not legacy**

  ```typescript
  // ✅ GOOD: V2.0 first, fallback to legacy
  const value = vehicle.feature_numeric || vehicle.legacy_feature;

  // ❌ BAD: Only use legacy
  const value = vehicle.legacy_feature;
  ```

- [ ] **Write component tests**
- [ ] **Run all tests**
  ```bash
  npm test
  ```

### Step 7: Integration

- [ ] **Update parent components** to use new feature
- [ ] **Test in browser manually**
  - [ ] Feature displays correctly
  - [ ] No console errors
  - [ ] Tooltips/interactions work
  - [ ] Mobile responsive

- [ ] **Run E2E tests**

  ```bash
  npm run test:e2e
  ```

- [ ] **Fix any E2E failures**

---

## Phase 4: Testing & Verification ✅

### Run Full Test Suite

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type check
npm run type-check

# Lint
npm run lint
```

**All must pass before proceeding.**

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] Data displays correctly
- [ ] Tooltips/UI elements work
- [ ] Mobile responsive (if applicable)
- [ ] Edge cases handled (empty data, null values)

### Database Verification (If Applicable)

- [ ] **Check data is stored correctly**

  ```sql
  SELECT * FROM vehicle_insights
  WHERE vin = 'TEST_VIN'
  LIMIT 10;
  ```

- [ ] **Verify CHECK constraints work**

  ```sql
  -- Should FAIL
  INSERT INTO vehicle_insights (vin, feature_type)
  VALUES ('TEST', 999);  -- Invalid value
  ```

- [ ] **Test edge cases** (NULL values, min/max boundaries)

---

## Phase 5: Documentation & Cleanup 📝

### Update Documentation

- [ ] **Add feature to CLAUDE.md**
  - Update "Key Features" section
  - Add to "Quick Commands" if applicable

- [ ] **Update README** if user-facing

- [ ] **Add inline code comments**
  - Document WHY, not just WHAT
  - Explain non-obvious decisions

- [ ] **Document any new patterns**
  - Add to architecture docs if introducing new pattern

### Code Quality

- [ ] **Remove console.logs**

  ```bash
  # Search for console.log
  grep -r "console.log" components/ lib/
  ```

- [ ] **Remove commented code**

- [ ] **Fix ESLint warnings**

  ```bash
  npm run lint
  ```

- [ ] **Format with Prettier** (if applicable)
  ```bash
  npm run format
  ```

---

## Phase 6: Commit & Deploy 🚀

### Git Workflow

```bash
# Stage all changes
git add .

# Commit with conventional commits format
git commit -m "feat: add your feature description"

# Examples:
# feat: add vehicle comparison feature
# fix: correct tier calculation for edge cases
# refactor: improve criteria badge performance
# docs: update architecture principles

# Push to remote
git push origin feature/your-feature-name
```

### Pre-Push Checklist

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code formatted
- [ ] Commit message follows conventions
- [ ] No sensitive data committed (.env files, API keys)

### Create Pull Request

- [ ] Descriptive title matching commit message
- [ ] Summary of changes (what, why, how)
- [ ] Link to any issues/tickets
- [ ] Screenshots if UI changes
- [ ] Note any breaking changes
- [ ] List manual testing performed

---

## ⚠️ Common Pitfalls

### ❌ DON'T Do These

1. **Skip running tests before changes**
   - ❌ Problem: Miss existing bugs, make them worse
   - ✅ Solution: ALWAYS run `npm test && npm run test:e2e` first
   - ⏱️ Time cost: 2+ hours debugging

2. **Mix UI concerns in data layer**
   - ❌ Problem: Returns `{ tier_emoji: '🥇', tier_label: 'Gold' }`
   - ✅ Solution: Return `{ tier_numeric: 1 }`, map to visuals in UI layer
   - ⏱️ Time cost: 1 hour refactoring

3. **Use old field names**
   - ❌ Problem: Use `criteria_tier` (V1.0) instead of `tier_numeric` (V2.0)
   - ✅ Solution: Use V2.0 fields first, fallback to legacy
   - ⏱️ Time cost: 1.5 hours finding all usages

4. **Forget to extract JSONB properly**
   - ❌ Problem: Pass `vehicle.criteria_results` (entire object)
   - ✅ Solution: Extract `vehicle.criteria_results?.verifiable`
   - ⏱️ Time cost: 45 minutes

5. **Name collisions**
   - ❌ Problem: Import `calculateTier`, define local `calculateTier` → shadowing
   - ✅ Solution: Alias imports: `import { calculateTier as calculateTierNumeric }`
   - ⏱️ Time cost: 2 hours debugging

6. **Forget CHECK constraints**
   - ❌ Problem: TypeScript allows 1-4, database allows any integer
   - ✅ Solution: Add `CHECK (tier_numeric IN (1, 2, 3, 4))`
   - ⏱️ Time cost: 30 minutes + production bugs

7. **Skip backwards compatibility**
   - ❌ Problem: Only support `tier_numeric`, break existing data
   - ✅ Solution: `vehicle.tier_numeric || vehicle.criteria_tier`
   - ⏱️ Time cost: 1 hour fixing + user complaints

### ✅ DO These

1. **Test → Code → Test workflow**
   - Run tests before changes
   - Implement feature
   - Run tests after changes

2. **Primitives in data layer only**
   - Numbers, booleans, string IDs
   - NO emojis, labels, colors

3. **UI mapping in separate file**
   - `lib/utils/*-visuals.ts`
   - Map primitives to visual elements

4. **Comprehensive unit tests**
   - Test edge cases
   - Test error conditions
   - Test backwards compatibility

5. **Update ALL component usages**
   - Use find/replace to find all occurrences
   - Don't miss any components

6. **Document JSONB structure**
   - In migration comments
   - In TypeScript types
   - In component docs

---

## 📚 Quick Reference

### Testing Commands

```bash
npm test                     # Unit tests
npm run test:e2e            # All E2E tests
npm run test:e2e -- <file>  # Specific E2E test
npm run type-check          # TypeScript check
npm run lint                # ESLint
```

### File Locations

```
lib/
├── constants/        → Enums, constants (data layer)
├── types.ts          → Type definitions
├── services/         → Business logic (data layer)
├── utils/            → UI mappings (*-visuals.ts, UI layer)
├── database/         → Query functions
components/           → React components (UI layer)
supabase/migrations/  → Database schema
```

### Layer Rules

| Layer    | Allowed                                   | Forbidden                                      |
| -------- | ----------------------------------------- | ---------------------------------------------- |
| **Data** | Numbers, booleans, string IDs, primitives | Emojis, labels, CSS classes, formatted strings |
| **UI**   | Components, visuals, formatting           | Business logic, calculations, database queries |

### Import Pattern

```typescript
// ✅ GOOD: Clear imports with aliases if needed
import { calculateTier as calculateTierNumeric } from '@/lib/constants/tier';
import { getTierVisuals } from '@/lib/utils/tier-visuals';
import { Tier } from '@/lib/constants/tier';

// ❌ BAD: Import collision
import { calculateTier } from '@/lib/constants/tier';
export function calculateTier() { ... }  // Shadows import!
```

---

## 🎯 Success Criteria

Before marking feature complete, ensure:

- [ ] ✅ All tests passing (unit + E2E)
- [ ] ✅ No TypeScript errors
- [ ] ✅ No ESLint warnings
- [ ] ✅ No console errors in browser
- [ ] ✅ Works in Chrome, Safari, Firefox
- [ ] ✅ Mobile responsive (if applicable)
- [ ] ✅ Documentation updated
- [ ] ✅ Code reviewed (self or peer)
- [ ] ✅ Committed with conventional commit message

---

## Related Documentation

- **Core Principles**: [LAYER_SEPARATION_PRINCIPLES.md](../architecture/LAYER_SEPARATION_PRINCIPLES.md)
- **Common Mistakes**: [V2_MIGRATION_LESSONS.md](../architecture/V2_MIGRATION_LESSONS.md)
- **Database Patterns**: [DATABASE_DESIGN_PATTERNS.md](../architecture/DATABASE_DESIGN_PATTERNS.md)
- **Quick Reference**: [CLAUDE.md](../../CLAUDE.md) - Architecture Principles section
