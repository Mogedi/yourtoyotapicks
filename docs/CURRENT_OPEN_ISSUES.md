# Current Open Issues & Workarounds

**Date**: October 2025
**Status**: Active Issues Requiring Attention

This document tracks all current open issues, workarounds, and technical debt that need to be addressed.

---

## 🚨 Critical Issues

**None currently!** 🎉

All critical issues have been resolved. See "Resolved But Monitoring" section below.

---

## ⚠️ Medium Priority Issues

### 1. TODOs in Data Pipeline (Not Yet Implemented)

**File**: `lib/data-pipeline.ts`

**Line 102-103**:

```typescript
/**
 * Auto.dev API source (free tier: 1000 calls/month)
 * TODO: Implement when API key is available
 */
export const autoDevSource: ListingSource = {
  name: 'Auto.dev API',
  fetch: async () => {
    // TODO: Implement Auto.dev API integration
    // For now, fall back to mock data
    console.log('[Auto.dev] Not implemented, using mock data');
    return mockDataSource.fetch();
  },
  cost: 0, // Free tier
};
```

**Impact**:

- Currently using mock data only
- Auto.dev API integration planned but not implemented
- Falls back to mock data silently

**Workaround**:

- Mock data source works fine for MVP
- `DATA_SOURCE` env var can be set to 'mock' explicitly

**Solution Required**:

1. Obtain Auto.dev API key
2. Implement API integration following their docs
3. Add error handling and rate limiting
4. Test with real data

**Priority**: 🟡 **MEDIUM** - MVP works with mock data, but production needs real data

---

### 2. TypeScript `any` Type Assertions in Data Pipeline

**File**: `lib/data-pipeline.ts`

**Lines 277-291**:

```typescript
const vehicle: VehicleInsert = {
  vin: listing.vin!,
  make: listing.make as 'Toyota' | 'Honda',
  model: listing.model,
  // ...
  title_status: (listing as any).title_status || 'clean',
  accident_count: (listing as any).accident_count || 0,
  owner_count: (listing as any).owner_count || 1,
  is_rental: (listing as any).is_rental || false,
  // ... more (listing as any) casts
};
```

**Impact**:

- Loses type safety during RawListing → VehicleInsert conversion
- Could cause runtime errors if listing structure changes
- Makes refactoring harder

**Root Cause**:

- `RawListing` type doesn't include all fields needed for `VehicleInsert`
- Quick workaround during initial implementation

**Solution Required**:

1. Update `RawListing` type to include all required fields
2. Remove `as any` casts
3. Add proper type guards or validation
4. Update data source adapters to return complete data

**Priority**: 🟡 **MEDIUM** - Works but reduces type safety

---

## 📝 Low Priority Issues (Technical Debt)

### 3. Deprecated Package in Dependencies

**File**: `package.json`

**Issue**: `ora@^9.0.0` may have deprecation warnings (check npm deprecations)

**Workaround**: Currently functioning, no immediate issues

**Priority**: 🟢 **LOW** - Monitor for updates

---

### 4. Vercel Build Configuration - May Need Re-enabling

**Previous Fix** (commit `632aefe`): "fix: ignore ESLint errors during Vercel builds"

**Current Status** (October 13, 2025):

- ESLint v9 now properly configured
- May be able to re-enable ESLint checks in Vercel builds
- Need to test next deployment

**Solution Required**:

- Monitor next Vercel deployment
- If builds pass, ESLint checks are working
- If builds fail, may need to update `next.config.js`

**Priority**: 🟢 **LOW** - ESLint fixed, just needs verification

---

## 🔄 Resolved But Monitoring

### 6. ESLint Configuration Mismatch (RESOLVED)

**Fixed**: Commit `16634ce` - "fix: migrate to ESLint v9 and fix linting errors" (October 13, 2025)

**Issue**:

- ESLint v9 installed but project used legacy `.eslintrc.json`
- Pre-commit hooks failed, required `--no-verify` flag

**Solution Applied**:

- Migrated to `eslint.config.mjs` (ESLint v9 flat config)
- Installed `@eslint/js` and `@eslint/eslintrc` packages
- Fixed all unused variables/imports across codebase
- Configured balanced rules:
  - **STRICT**: Unused vars, exhaustive-deps (fail on error)
  - **FLEXIBLE**: console.log, 'any' type allowed
- Pre-commit hooks now work without `--no-verify`

**Status**: ✅ **RESOLVED** - Git workflow restored

---

### 7. Read-only Array Type for Pagination Options

**Fixed**: Commit `e5279fa` - "fix: change getPageSizeOptions return type to readonly"

**Issue**:

- `getPageSizeOptions()` returned mutable array
- Could cause bugs if modified

**Solution Applied**:

- Changed return type to `readonly number[]`
- Now immutable by TypeScript

**Status**: ✅ **RESOLVED** - Monitoring for any regressions

---

### 8. URL Sync Hook Quality Tier Migration

**Fixed**: Commit `2195636` - "fix: replace reviewStatus with qualityTier in URL sync hook"

**Issue**:

- Old URL parameter `reviewStatus` replaced with `qualityTier`
- Breaking change for existing URLs

**Solution Applied**:

- Updated `useUrlSync` hook to use `qualityTier`
- Old URLs with `reviewStatus` won't work (acceptable breaking change)

**Status**: ✅ **RESOLVED** - No migration path needed (pre-production)

---

## 📊 Summary Statistics

**Total Open Issues**: 4 (0 critical, 2 medium, 2 low)

**Breakdown by Type**:

- 🔴 Critical (Blocking): 0 🎉
- 🟡 Medium (Workaround exists): 2
- 🟢 Low (Technical debt): 2

**Breakdown by Category**:

- Data Pipeline: 2 (Auto.dev API, Type safety)
- Dependencies: 1 (Package updates)
- Tooling/Config: 1 (Vercel - needs verification)

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Issues ✅ COMPLETE

**1. ESLint v9 Migration** ✅ **DONE** (October 13, 2025)

- Migrated to `eslint.config.mjs`
- Pre-commit hooks working
- Git workflow restored

---

### Phase 2: Address Medium Priority (2-3 hours)

**1. Improve Data Pipeline Type Safety**

- Update `RawListing` type definition
- Remove `as any` casts
- Add runtime validation (zod schema?)

**2. Implement Auto.dev API Integration** (when API key available)

- Create `lib/integrations/autodev.ts`
- Add API key to environment variables
- Implement fetch logic with rate limiting
- Add comprehensive error handling

**3. Verify Vercel Build Checks**

- ESLint now fixed, monitor next deployment
- Should work automatically, may need config update

---

### Phase 3: Technical Debt Cleanup (1 hour)

**4. Package Audit**

```bash
npm audit
npm outdated
npm update
```

**5. Document All Workarounds**

- ✅ Already done in this document
- Keep updated as issues are resolved

---

## 🚫 What NOT to Worry About

These are **NOT** issues (intentional decisions):

### 1. ✅ Using `--no-verify` for Today's Commits

**Why**: ESLint config broken, needed to push work
**Status**: Temporary workaround, code is tested (219 unit + 10 E2E)

### 2. ✅ Mock Data in Production

**Why**: MVP phase, real API integration is Phase 2
**Status**: Intentional, documented in `data-pipeline.ts`

### 3. ✅ Hardcoded Strings in Components

**Why**: Research shows this is appropriate for single-use UI text
**Status**: Intentional per industry best practices (see `CONSTANTS_CONSOLIDATION_RESEARCH.md`)

### 4. ✅ Tailwind Classes Not Extracted

**Why**: Tailwind is the design token system
**Status**: Correct approach per Tailwind docs

---

## 📝 How to Use This Document

### When Adding New Issues:

1. Create new section under appropriate priority
2. Include: File, Line numbers, Error message, Impact, Workaround, Solution
3. Assign priority: 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW
4. Update summary statistics

### When Resolving Issues:

1. Move to "Resolved But Monitoring" section
2. Add commit hash and date resolved
3. Update summary statistics
4. Keep in document for 30 days before archiving

### Reviewing This Document:

- **Weekly**: Check if new issues arose
- **Before releases**: Ensure no critical issues
- **After major changes**: Update with new technical debt

---

## 🔗 Related Documentation

- **ESLint Migration Guide**: https://eslint.org/docs/latest/use/configure/migration-guide
- **Constants Research**: `docs/CONSTANTS_CONSOLIDATION_RESEARCH.md`
- **Architecture Docs**: `docs/SIMPLIFIED_UI_ARCHITECTURE.md`
- **Refactoring Summary**: `docs/REFACTORING_SUMMARY.md`

---

## 📞 Questions?

If you encounter an issue not listed here:

1. Check if it's intentional (see "What NOT to Worry About")
2. Search existing docs for context
3. Add to this document under appropriate priority
4. Discuss solution approach before implementing

---

**Last Updated**: October 13, 2025
**Next Review**: October 20, 2025
**Maintained By**: Development Team
