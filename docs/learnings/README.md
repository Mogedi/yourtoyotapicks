# Learnings

**Purpose**: Centralized index of all lessons learned, best practices, and architectural principles from YourToyotaPicks development.

**Philosophy**: Living documents that stay current. Outdated information is purged, not archived. Version control tracks history.

---

## 📚 Learning Documents

### Testing & Development Process

**[TESTING_BEST_PRACTICES.md](./TESTING_BEST_PRACTICES.md)**

- Test-first workflow (saves 2+ hours per change)
- Service layer testing patterns (98%+ coverage)
- E2E testing with Playwright
- React hydration testing
- Next.js configuration (image domains)
- Mock data strategies
- Test coverage goals and ROI analysis

**Key Takeaway**: Test services first (4 hours for 98% coverage), hooks second, components third.

---

## 🏗️ Architecture & Design

### Core Architectural Principles

**[LAYER_SEPARATION_PRINCIPLES.md](../architecture/LAYER_SEPARATION_PRINCIPLES.md)**

- Data layer = primitives only (no emojis, labels, CSS)
- UI layer = all formatting and visuals
- Single source of truth (constants → types → database)
- Enum patterns and TypeScript alignment
- JSONB storage guidelines
- Import naming to avoid collisions

**Key Takeaway**: Data returns `tier_numeric: 1`, UI maps to `{ emoji: '🥇', label: 'Gold' }`.

---

### V2.0 Refactor Lessons

**[V2_MIGRATION_LESSONS.md](../architecture/V2_MIGRATION_LESSONS.md)**

- 5 critical bugs documented (name collision, mixed UI/data, old fields, JSONB extraction, tests not run)
- Time lost: 7+ hours total
- Time to fix: 3 hours
- Prevention strategies for each bug
- Before/after code examples
- Real impact on 88 vehicles

**Key Takeaway**: ALWAYS run tests first. Alias imports to avoid name collisions.

---

### Database Design Patterns

**[DATABASE_DESIGN_PATTERNS.md](../architecture/DATABASE_DESIGN_PATTERNS.md)**

- Separation: raw data (`curated_listings`) vs computed insights (`vehicle_insights`)
- View patterns (`vehicles_with_insights`)
- CHECK constraints matching TypeScript enums
- Algorithm versioning strategies
- Recalculation scripts
- JSONB structure and extraction

**Key Takeaway**: Keep raw data separate from computed data. Supports algorithm versioning and safe recalculation.

---

## 🛠️ Implementation Guides

### Feature Addition Workflow

**[FEATURE_ADDITION_CHECKLIST.md](../development/FEATURE_ADDITION_CHECKLIST.md)**

- 6-phase workflow (pre-flight → planning → implementation → testing → docs → deploy)
- Step-by-step with real examples
- Common pitfalls with time costs
- Test-first approach
- Implementation order: constants → types → database → services → UI
- Success criteria checklist

**Key Takeaway**: Follow checklist to avoid 5-7+ hours of debugging per feature.

---

## 📊 Time Investment & ROI

### Documentation Investment

| Document                       | Lines     | Time to Create | Time Saved Per Use | ROI      |
| ------------------------------ | --------- | -------------- | ------------------ | -------- |
| V2_MIGRATION_LESSONS.md        | 477       | 1.5 hours      | 5-7 hours          | 3-5x     |
| LAYER_SEPARATION_PRINCIPLES.md | 350       | 1 hour         | 2-3 hours          | 2-3x     |
| FEATURE_ADDITION_CHECKLIST.md  | 634       | 1.5 hours      | 5-7 hours          | 3-5x     |
| TESTING_BEST_PRACTICES.md      | 520       | 1 hour         | 2-4 hours          | 2-4x     |
| **Total**                      | **1,981** | **5 hours**    | **14-21 hours**    | **3-4x** |

**Overall ROI**: Documentation pays for itself after 1-2 major features/refactors.

---

## 🎯 Quick Reference by Task

### "I'm adding a new feature"

1. Read: [FEATURE_ADDITION_CHECKLIST.md](../development/FEATURE_ADDITION_CHECKLIST.md) (10 min)
2. Read: [LAYER_SEPARATION_PRINCIPLES.md](../architecture/LAYER_SEPARATION_PRINCIPLES.md) (10 min)
3. Follow: 6-phase workflow
4. **Result**: Feature added safely, no regressions

### "I'm refactoring existing code"

1. Read: [V2_MIGRATION_LESSONS.md](../architecture/V2_MIGRATION_LESSONS.md) (15 min)
2. Read: [TESTING_BEST_PRACTICES.md](./TESTING_BEST_PRACTICES.md) (15 min)
3. **Run tests FIRST**: `npm test && npm run test:e2e`
4. Make changes incrementally
5. Run tests after each change
6. **Result**: Safe refactoring, bugs caught early

### "I'm adding database schema changes"

1. Read: [DATABASE_DESIGN_PATTERNS.md](../architecture/DATABASE_DESIGN_PATTERNS.md) (10 min)
2. Follow: Raw data vs computed insights pattern
3. Add CHECK constraints matching TypeScript enums
4. Document JSONB structure
5. **Result**: Clean schema, type-safe, versionable

### "I'm writing tests"

1. Read: [TESTING_BEST_PRACTICES.md](./TESTING_BEST_PRACTICES.md) (15 min)
2. Test services first (highest ROI)
3. Use mock data strategies
4. Follow E2E patterns for integration tests
5. **Result**: 98%+ coverage in 4 hours, not 15 hours

### "I'm debugging a production issue"

1. Check: [V2_MIGRATION_LESSONS.md](../architecture/V2_MIGRATION_LESSONS.md) - Common bugs
2. Verify: Tests are passing (`npm test`)
3. Check: Layer separation (data vs UI)
4. Review: JSONB extraction patterns
5. **Result**: Find root cause faster

---

## 🚨 Most Common Mistakes (With Prevention)

| Mistake                               | Time Lost | Document                       | Prevention                                |
| ------------------------------------- | --------- | ------------------------------ | ----------------------------------------- |
| **Skip running tests first**          | 2+ hours  | TESTING_BEST_PRACTICES.md      | Run `npm test` before changes             |
| **Name collision (import shadowing)** | 2 hours   | V2_MIGRATION_LESSONS.md        | Alias imports (`as calculateTierNumeric`) |
| **Mix UI in data layer**              | 1 hour    | LAYER_SEPARATION_PRINCIPLES.md | Return primitives only                    |
| **Use old field names**               | 1.5 hours | V2_MIGRATION_LESSONS.md        | Update all usages, use V2.0 fields        |
| **Improper JSONB extraction**         | 45 min    | DATABASE_DESIGN_PATTERNS.md    | Multiple fallback paths                   |
| **Forget CHECK constraints**          | 30 min    | DATABASE_DESIGN_PATTERNS.md    | Match TypeScript enums exactly            |
| **Skip backwards compatibility**      | 1 hour    | FEATURE_ADDITION_CHECKLIST.md  | Fallback to legacy fields                 |

**Total Time Saved**: 8+ hours per major feature/refactor by reading docs first.

---

## 📈 Success Metrics

### Current State (October 14, 2025)

**Tests**:

- ✅ 292 unit tests passing
- ✅ 12/13 E2E tests passing (1 pre-existing failure)
- ✅ 98%+ service layer coverage
- ✅ <1s unit test execution time

**Code Quality**:

- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ 0 console errors in browser
- ✅ Consistent formatting

**Architecture**:

- ✅ Data/UI layer separation established
- ✅ Numeric tier system (V2.0) implemented
- ✅ 88 vehicles populated with V2.0 data
- ✅ Split criteria (verifiable vs user-check)

**Documentation**:

- ✅ 5 comprehensive learning documents
- ✅ ~2,000 lines of actionable guidance
- ✅ Real code examples for every pattern
- ✅ Time costs documented for all mistakes

---

## 🔄 Document Maintenance

### Keeping Learnings Current

**Philosophy**: These are **living documents**, not historical archives.

**When to Update**:

1. ✅ New bug patterns discovered → Add to V2_MIGRATION_LESSONS.md
2. ✅ New testing patterns → Add to TESTING_BEST_PRACTICES.md
3. ✅ Architecture changes → Update LAYER_SEPARATION_PRINCIPLES.md
4. ✅ New feature workflows → Update FEATURE_ADDITION_CHECKLIST.md

**What to Purge**:

1. ❌ Outdated tool references (e.g., Puppeteer when using Playwright)
2. ❌ Old field names that no longer exist
3. ❌ Deprecated patterns
4. ❌ Superseded approaches

**Version Control = Archive**: Use `git log` to see historical versions. Don't create \_archive/ folders.

---

## 📖 Recommended Reading Order

### For AI Assistants (50 minutes total)

1. **[FEATURE_ADDITION_CHECKLIST.md](../development/FEATURE_ADDITION_CHECKLIST.md)** (10 min)
   - Quick overview of workflow
   - Common pitfalls

2. **[LAYER_SEPARATION_PRINCIPLES.md](../architecture/LAYER_SEPARATION_PRINCIPLES.md)** (10 min)
   - Core architectural rules
   - Data vs UI examples

3. **[V2_MIGRATION_LESSONS.md](../architecture/V2_MIGRATION_LESSONS.md)** (15 min)
   - Learn from real mistakes
   - See time costs

4. **[TESTING_BEST_PRACTICES.md](./TESTING_BEST_PRACTICES.md)** (10 min)
   - Test-first workflow
   - Service layer patterns

5. **[DATABASE_DESIGN_PATTERNS.md](../architecture/DATABASE_DESIGN_PATTERNS.md)** (10 min)
   - Database patterns
   - Migration strategies

**ROI**: 50 minutes reading saves 8-14+ hours per major feature/refactor.

---

### For New Developers (2 hours total)

1. Read all documents above
2. Review code examples
3. Run existing tests (`npm test`)
4. Try adding a small feature following checklist
5. Get familiar with architecture

**Result**: Confident to work on codebase without breaking things.

---

## 🆘 Getting Help

### When Stuck

1. **Check learnings first** - Search this folder for keywords
2. **Review V2_MIGRATION_LESSONS.md** - Common bugs documented
3. **Run tests** - `npm test && npm run test:e2e`
4. **Check architecture docs** - Verify layer separation
5. **Ask with context** - Share test results, error messages, what you've tried

### Contributing New Learnings

When you discover a new pattern or bug:

1. Document it immediately (future you will thank present you)
2. Add to appropriate learning document
3. Include:
   - Problem description
   - Root cause
   - Fix with code example
   - Time cost (how long to debug)
   - Prevention strategy
4. Update this README if it's a common issue

---

## 📁 File Locations

```
docs/
├── learnings/                          # THIS FOLDER
│   ├── README.md                       # You are here
│   └── TESTING_BEST_PRACTICES.md       # Testing patterns
│
├── architecture/                       # Core architectural principles
│   ├── LAYER_SEPARATION_PRINCIPLES.md  # Data vs UI rules
│   ├── V2_MIGRATION_LESSONS.md         # Bugs and fixes
│   └── DATABASE_DESIGN_PATTERNS.md     # DB patterns
│
├── development/                        # Implementation guides
│   └── FEATURE_ADDITION_CHECKLIST.md   # Step-by-step workflow
│
└── testing/                            # Test documentation
    └── (E2E test results and screenshots)
```

---

## ✨ Key Philosophy

> **"Document mistakes immediately, purge outdated information regularly, use version control as the archive."**

This approach ensures:

- ✅ Documentation stays current
- ✅ No confusion from outdated information
- ✅ Future developers learn from past mistakes
- ✅ Time saved: 8-14+ hours per major feature/refactor

---

**Last Updated**: October 14, 2025
**Status**: Living Document
**Maintained By**: Development team + AI assistants
