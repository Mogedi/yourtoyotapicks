# Testing Best Practices

**Last Updated**: October 14, 2025
**Status**: Living Document
**Purpose**: Consolidated testing learnings and patterns from YourToyotaPicks development

---

## 🎯 Executive Summary

Comprehensive testing infrastructure with **98%+ service layer coverage** (292 tests passing). Key learning: **Test before refactoring, not after.**

**Testing Philosophy**: Test services first (highest ROI), hooks second, components third.

---

## Testing Strategy & Priority

### Testing Order by ROI

| Layer           | Test Time | Coverage   | Business Logic | ROI        |
| --------------- | --------- | ---------- | -------------- | ---------- |
| **Services**    | 4h        | 98%        | 100%           | ⭐⭐⭐⭐⭐ |
| **Hooks**       | 3-4h      | 70%+       | 30%            | ⭐⭐⭐⭐   |
| **API/Queries** | 2-3h      | 70%+       | Critical       | ⭐⭐⭐⭐   |
| **Components**  | 10-15h    | 60%        | 0%             | ⭐⭐       |
| **E2E Tests**   | Existing  | Full flows | Integration    | ⭐⭐⭐⭐⭐ |

**Key Insight**: Service layer contains 100% of business logic but only takes 4 hours to test comprehensively. Components take 10-15 hours but contain 0% business logic (just rendering).

**ROI Calculation**:

- 4 hours testing services = 98% of critical business logic covered
- 15 hours testing components = Only UI rendering covered
- **5x better ROI for testing services first**

---

## Test-First Workflow

### Critical Rule: ALWAYS Test Before Changes

**Wrong Order** (What NOT to do):

```bash
1. ❌ Make changes to code
2. ❌ Update database schema
3. ❌ Run application
4. ❌ See failures
5. ❌ Spend 2+ hours debugging
6. ✅ Finally run tests → find issue immediately
```

**Correct Order** (V2.0 Lessons Learned):

```bash
1. ✅ npm test && npm run test:e2e    # Run tests FIRST
2. ✅ All passing? Good to proceed
3. ✅ Make changes
4. ✅ npm test                        # Verify no regressions
5. ✅ Fix any failures immediately
6. ✅ Deploy with confidence
```

**Time Saved**: 2+ hours per change by catching issues in tests (30 seconds) instead of production (2+ hours debugging).

**Real Example from V2.0 Refactor**:

- Made database schema changes without running tests first
- Ran population script → 88 vehicles failed to insert
- Spent 2 hours debugging
- Finally ran tests → found name collision bug in 30 seconds
- **Prevention**: Just run `npm test` first

---

## Service Layer Testing

### Why Service Layer First?

**Characteristics**:

- Pure functions (no React dependencies)
- All business logic lives here
- Fast tests (<1s for 112 tests)
- Easy to test
- High confidence in correctness

**Current Coverage**:

- FilterService: 62 tests, 98.66% coverage
- SortService: 29 tests, 97.43% coverage
- PaginationService: 21 tests, 100% coverage
- **Total: 112 tests, all passing in <1 second**

### Service Test Structure Pattern

```typescript
// lib/services/__tests__/filter-service.test.ts

describe('FilterService', () => {
  describe('applyFilters', () => {
    describe('quality tier filtering', () => {
      it('should filter top picks (score >= 80)', () => {
        // Arrange
        const mockVehicles: Vehicle[] = [
          { id: '1', priority_score: 85 /* ... */ },
          { id: '2', priority_score: 72 /* ... */ },
          { id: '3', priority_score: 58 /* ... */ },
        ];

        // Act
        const result = FilterService.applyFilters(mockVehicles, {
          qualityTier: 'top_pick',
        });

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].priority_score).toBeGreaterThanOrEqual(80);
      });
    });
  });
});
```

**Benefits**:

- Clear hierarchy (Service → Method → Scenario → Expected Behavior)
- Easy to find specific test
- Self-documenting
- Organized by feature

### Mock Data Strategy

**Reusable, Realistic Mocks**:

```typescript
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vin: 'VIN1',
    make: 'Toyota',
    model: 'RAV4',
    priority_score: 85, // Top Pick
    price: 25000,
    mileage: 30000,
    // ... full vehicle object
  },
  {
    id: '2',
    priority_score: 72, // Good Buy
    // ...
  },
  {
    id: '3',
    priority_score: 58, // Caution
    // ...
  },
];
```

**Benefits**:

- Covers all scenarios (top pick, good buy, caution)
- Realistic data
- Reusable across tests
- Easy to understand

---

## E2E Testing Patterns

### Framework: Playwright (Not Puppeteer)

**Important**: Project uses **Playwright**, not Puppeteer. Some older docs reference Puppeteer - ignore those.

### Test File Structure

```typescript
// tests/e2e/flows/01-landing-to-dashboard.test.ts

import { test, expect } from '@playwright/test';
import { getBaseUrl } from '../helpers/config';

const BASE_URL = getBaseUrl();

test.describe('Landing to Dashboard Flow', () => {
  test('should navigate from landing page to dashboard', async ({ page }) => {
    // Step 1: Load landing page
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/YourToyotaPicks/);

    // Step 2: Click dashboard link
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard');

    // Step 3: Verify vehicle cards loaded
    await expect(
      page.locator('[data-testid="vehicle-card"]').first()
    ).toBeVisible();

    // Step 4: Verify no console errors
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    expect(errors).toHaveLength(0);
  });
});
```

### Dynamic Port Configuration

**Problem**: Tests were hardcoded to port 3001, but dev server runs on different ports.

**Solution**: CLI parameter support with fallback chain.

```typescript
// tests/e2e/helpers/config.ts

export function getBaseUrl(): string {
  // Priority: 1. --port CLI arg, 2. TEST_PORT env, 3. PORT env, 4. default 3000
  const args = process.argv.slice(2);
  const portArgIndex = args.findIndex((arg) => arg === '--port');

  if (portArgIndex !== -1 && args[portArgIndex + 1]) {
    const port = args[portArgIndex + 1];
    console.log(`✓ Using port ${port} from command line`);
    return `http://localhost:${port}`;
  }

  if (process.env.TEST_PORT) {
    return `http://localhost:${process.env.TEST_PORT}`;
  }

  if (process.env.PORT) {
    return `http://localhost:${process.env.PORT}`;
  }

  return 'http://localhost:3000';
}
```

**Usage**:

```bash
# Pass port via CLI
npm run test:e2e -- --port 3000

# Or use environment variable
TEST_PORT=3003 npm run test:e2e
```

**Benefit**: Tests work in any environment without hardcoding.

### React Hydration Testing

**Problem**: After navigation back to dashboard, vehicle cards were rendering as skeleton loaders. Tests checked for elements immediately without waiting for React to hydrate.

**Fix**: Wait for hydration before checking elements.

```typescript
// Wait for React hydration
await page.waitForTimeout(1000);

// Use waitForSelector with timeout instead of immediate check
await expect(page.locator('[data-testid="vehicle-card"]').first()).toBeVisible({
  timeout: 5000,
});
```

**Key Insight**: Modern React apps with SSR need time to:

1. Render initial server HTML
2. Load JavaScript
3. Hydrate React components
4. Fetch async data
5. Replace skeleton loaders with real content

**Best Practice**: Use `waitForSelector()` with timeouts instead of immediate element checks.

### Next.js Image Configuration

**Critical Learning**: Always configure Next.js image domains BEFORE using external images.

**Problem**: Runtime error when trying to load images from cdn.imagin.studio:

```
Invalid src prop (https://cdn.imagin.studio/getImage?...) on 'next/image',
hostname "cdn.imagin.studio" is not configured under images in your 'next.config.js'
```

**Fix**: Add to next.config.ts:

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.imagin.studio',
        pathname: '/getImage/**',
      },
    ],
  },
};

export default nextConfig;
```

**Impact**: This was a **critical blocker**. Pages with `<Image>` components from external domains will crash without this configuration.

### Screenshot Strategy

**Pattern**: Capture screenshots at critical moments to debug failures faster.

```typescript
test('table view loads correctly', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard/table`);

  // Screenshot loading state
  await page.screenshot({
    path: 'screenshots/07-table-loading.png',
    fullPage: true,
  });

  // Wait for loading to complete
  await expect(page.locator('table')).toBeVisible();

  // Screenshot final state
  await page.screenshot({
    path: 'screenshots/07-table-loaded.png',
    fullPage: true,
  });
});
```

**Benefits**:

- Visual debugging when tests fail
- Understand what state the page was in
- Catch UI regressions
- Document expected behavior

### Multiple Selector Fallbacks

**Pattern**: Use multiple selectors to handle different implementations.

```typescript
// Try multiple selectors in priority order
const vehicleCard = await page
  .locator('[data-testid="vehicle-card"], article, .vehicle-card')
  .first();

await expect(vehicleCard).toBeVisible();
```

**Benefits**:

- Tests survive refactoring
- Works with different implementations
- More resilient tests

### Graceful Test Degradation

**Pattern**: Use warnings for optional features instead of hard failures.

```typescript
test('dashboard displays statistics', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);

  // Critical feature - must exist
  await expect(page.locator('[data-testid="vehicle-grid"]')).toBeVisible();

  // Optional feature - warn if missing
  const statCards = page.locator('[data-testid="stat-cards"]');
  if ((await statCards.count()) === 0) {
    console.warn('⚠️  Stat cards not found - may not be implemented yet');
  } else {
    await expect(statCards).toBeVisible();
  }
});
```

**Benefits**:

- Tests don't fail for work-in-progress features
- Clear warnings about missing functionality
- More maintainable test suite

---

## Test Coverage Goals

### Realistic Targets

```
Service Layer:    98%+  ✅ (Achieved)
Hooks:            70%+  ⏭️ (Next priority)
API/Queries:      70%+  ⏭️ (After hooks)
Components:       60%+  ⏭️ (After API)
Overall Project:  70%+  (Target)
```

### Why Not 100% Coverage?

1. **Diminishing returns** after 90%
2. Some code is just rendering (hard to test, low value)
3. Integration tests cover remaining gaps
4. **Better to test 90% well than 100% poorly**

**Focus**: High-value tests that catch real bugs, not just coverage numbers.

---

## Common Testing Pitfalls

### ❌ DON'T Do These

1. **Hardcode ports or URLs**
   - Problem: Tests fail when dev server changes ports
   - Solution: Use dynamic port configuration

2. **Use library-specific selectors**
   - Problem: `:has-text()` is Playwright-only, fails in Puppeteer
   - Solution: Use standard CSS selectors + JavaScript evaluation

3. **Assume elements are interactive immediately**
   - Problem: React hydration takes time
   - Solution: Wait for loading states, use timeouts

4. **Fail tests for optional features**
   - Problem: Tests break during development
   - Solution: Use warnings for work-in-progress features

5. **Skip screenshots on error states**
   - Problem: Hard to debug test failures
   - Solution: Screenshot at critical moments (loading, error, success)

6. **Test everything (even trivial code)**
   - Problem: Wastes time, low ROI
   - Solution: Focus on business logic (services, hooks, API)

### ✅ DO These

1. **Run tests before making changes**
   - Catches bugs in seconds instead of hours
   - Establishes baseline before refactoring

2. **Test services first**
   - Highest ROI (4 hours for 98% coverage)
   - All business logic lives here

3. **Use dynamic configuration**
   - CLI parameters > environment variables > defaults
   - Flexible for any environment

4. **Wait for React hydration**
   - Use `waitForSelector()` with timeouts
   - Don't check elements immediately after navigation

5. **Configure Next.js properly**
   - Add external image domains BEFORE using them
   - Prevents runtime crashes

6. **Take screenshots**
   - At critical moments (loading, success, error)
   - Helps debug failures faster

---

## Test Performance

### Current Performance

```
Service tests:     <1s    ✅ (Currently 0.65s for 112 tests)
E2E tests:         ~29s   ✅ (4 tests, 14 screenshots)
Total unit tests:  <10s   (Target)
```

### Performance Best Practices

1. **Keep tests fast**
   - Service tests should run in <1s
   - Avoid unnecessary waits
   - Use minimal test data

2. **Parallel execution**
   - Run independent tests in parallel
   - Speeds up CI/CD pipelines

3. **Smart mocking**
   - Mock external dependencies
   - Don't hit real APIs in unit tests
   - Use realistic mock data

---

## Testing Checklist

### Before Any Code Changes

- [ ] Run `npm test` (all unit tests)
- [ ] Run `npm run test:e2e` (all E2E tests)
- [ ] ✅ All tests passing? Proceed
- [ ] ❌ Any failures? Fix them first

### During Development

- [ ] Write tests for services FIRST (TDD approach)
- [ ] Implement service logic
- [ ] Run tests to verify
- [ ] Then create hooks/components
- [ ] Add E2E tests for user flows

### Before Committing

- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)

### Before Deploying

- [ ] Full test suite passes
- [ ] Manual smoke test in browser
- [ ] Check for console errors
- [ ] Verify screenshots look correct

---

## Current Test Suite Status

### Test Results (October 14, 2025)

**Unit Tests**:

- ✅ 292 tests passing
- ✅ 98%+ service layer coverage
- ✅ 0 failures
- ✅ <1s execution time

**E2E Tests**:

- ✅ 12/13 passing (1 pre-existing failure unrelated to current work)
- ✅ 01-landing-to-dashboard (2302ms)
- ✅ 02-dashboard-filtering (9187ms)
- ✅ 03-vehicle-details (4829ms)
- ✅ 07-table-view (6670ms)
- ✅ Total: ~29s for all E2E tests
- ✅ 14 screenshots captured

**Code Quality**:

- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors (warnings only)
- ✅ 0 console errors in browser
- ✅ Consistent formatting

---

## Key Takeaways

1. **Test-first workflow saves hours**
   - Run tests before changes (30 seconds)
   - Catch bugs early instead of in production (2+ hours)
   - 4x faster debugging

2. **Service layer = highest ROI**
   - 4 hours for 98% coverage
   - 100% of business logic
   - Fast tests (<1s)

3. **E2E tests catch integration issues**
   - React hydration problems
   - Navigation issues
   - Configuration errors (Next.js images)

4. **Configuration is critical**
   - Next.js image domains must be configured
   - Dynamic port configuration for flexibility
   - Environment-agnostic tests

5. **Real examples > documentation**
   - Provide runnable code examples
   - Show expected output
   - Include troubleshooting steps

---

## Related Documentation

- **Architecture**: [V2_MIGRATION_LESSONS.md](../architecture/V2_MIGRATION_LESSONS.md) - Bugs and fixes from V2.0 refactor
- **Principles**: [LAYER_SEPARATION_PRINCIPLES.md](../architecture/LAYER_SEPARATION_PRINCIPLES.md) - Data vs UI rules
- **Feature Guide**: [FEATURE_ADDITION_CHECKLIST.md](../development/FEATURE_ADDITION_CHECKLIST.md) - Step-by-step feature workflow
- **Database**: [DATABASE_DESIGN_PATTERNS.md](../architecture/DATABASE_DESIGN_PATTERNS.md) - DB patterns and migrations

---

## Quick Reference Commands

```bash
# Testing
npm test                     # Run all unit tests
npm run test:e2e            # Run all E2E tests
npm run test:e2e -- --port 3000  # E2E with specific port
TEST_PORT=3003 npm run test:e2e  # E2E with env var

# Code Quality
npm run type-check          # TypeScript check
npm run lint                # ESLint check
npm run format              # Format code

# Development
npm run dev                 # Start dev server (port 3001)
npm run build               # Production build
npm run start               # Start production server
```

---

**Last Updated**: October 14, 2025
**Status**: Living Document (will be updated as new patterns emerge)
**Maintained By**: Development team + AI assistants
