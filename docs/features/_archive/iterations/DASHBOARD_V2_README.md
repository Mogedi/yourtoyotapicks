# Dashboard V2 Documentation

## Quick Links

### 📘 Main Implementation Plan

**[DASHBOARD_V2_SIMPLIFIED.md](./DASHBOARD_V2_SIMPLIFIED.md)** - Single Claude execution, step-by-step guide (19-26 hours)

This is the **primary document** for implementing Dashboard V2. It includes:

- Pre-flight checks
- 7 sequential phases with code examples
- Verification steps after each phase
- Troubleshooting guide
- Success criteria

---

## Archive

### 📦 Archived Documents

**[\_archive/DASHBOARD_V2_IMPLEMENTATION_PLAN_SUBAGENT.md](./_archive/DASHBOARD_V2_IMPLEMENTATION_PLAN_SUBAGENT.md)**

- Original plan designed for parallel sub-agent execution
- More complex coordination required
- 40-45% faster but harder to manage
- **Archived**: Too complex for single-session implementation

**[\_archive/DASHBOARD_V2_FEEDBACK.md](./_archive/DASHBOARD_V2_FEEDBACK.md)**

- Detailed feedback on sub-agent plan
- Analysis for unrestricted Claude execution
- Identified 6 critical issues
- Recommendations and improvements
- **Archived**: Feedback incorporated into simplified plan

---

## Implementation Approach

### ✅ Recommended: Single Claude (Simplified Plan)

**Why:**

- Full context throughout implementation
- Can adapt on the fly
- Easier debugging
- Clearer communication
- No coordination overhead

**Timeline:** 19-26 hours

**Best for:**

- First-time implementation
- Want to review code as it's built
- Prefer steady, reliable progress

### ⚠️ Alternative: Sub-Agent Approach (Archived)

**Why:**

- 40-45% faster (12-18 hours)
- Parallel execution
- Specialized agents

**Challenges:**

- Complex coordination
- Potential integration conflicts
- Each agent has limited context
- Requires manual integration

**Status:** Archived - Use only if you have experience with multi-agent workflows

---

## Quick Start

### To Begin Implementation:

1. **Read the plan:**

   ```bash
   open docs/features/DASHBOARD_V2_SIMPLIFIED.md
   ```

2. **Run pre-flight checks:**

   ```bash
   npm run dev    # Should start without errors
   npm run test   # Should run
   git status     # Check current state
   ```

3. **Create feature branch:**

   ```bash
   git checkout -b feature/dashboard-v2
   ```

4. **Give to Claude:**
   ```
   "Implement Dashboard V2 following docs/features/DASHBOARD_V2_SIMPLIFIED.md.
   Execute phases sequentially, verify after each phase, and commit progress."
   ```

---

## Phase Overview

| Phase | Description         | Time    | Verification             |
| ----- | ------------------- | ------- | ------------------------ |
| 0     | Pre-flight checks   | 30 min  | Dev server runs          |
| 1     | Backend foundation  | 3-4 hrs | Types, services, queries |
| 2     | Custom hooks        | 2-3 hrs | State management         |
| 3     | Shared components   | 2-3 hrs | Reusable UI              |
| 4     | Table components    | 5-6 hrs | Table UI                 |
| 5     | Page implementation | 2-3 hrs | Wire everything          |
| 6     | Polish & testing    | 3-4 hrs | E2E tests                |
| 7     | Navigation          | 1 hr    | View switcher            |

**Total:** 19-26 hours

---

## Success Criteria

### MVP (Minimum Viable Product):

- ✅ Table renders at `/dashboard/table`
- ✅ Shows vehicles from mock data
- ✅ Basic filters work (price, make, search)
- ✅ Sorting works on 2+ columns
- ✅ Pagination works
- ✅ Zero console errors

### Full Feature Complete:

- ✅ All filters functional
- ✅ All columns sortable
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ E2E tests pass
- ✅ Accessible (keyboard nav, ARIA)

---

## File Structure (After Implementation)

```
app/
└── dashboard/
    ├── page.tsx              # Card view (existing)
    └── table/
        └── page.tsx          # Table view (new)

components/dashboard/
├── shared/                   # Reusable components
│   ├── RangeInput.tsx
│   ├── SearchBar.tsx
│   ├── CheckboxGroup.tsx
│   └── EmptyState.tsx
│
└── table-view/               # Table-specific
    ├── VehicleTable.tsx
    ├── TableHeader.tsx
    ├── TableBody.tsx
    ├── TableRow.tsx
    ├── TablePagination.tsx
    ├── TableFilters.tsx
    └── TableSkeleton.tsx

lib/
├── types/
│   ├── filters.ts
│   └── api.ts
│
├── api/vehicles/
│   └── queries.ts
│
├── hooks/
│   ├── useVehicles.ts
│   ├── useVehicleFilters.ts
│   ├── useVehicleSort.ts
│   └── usePagination.ts
│
├── services/
│   ├── filter-service.ts
│   └── sort-service.ts
│
└── utils/
    ├── format.ts
    ├── vehicle-helpers.ts
    └── url-helpers.ts
```

---

## Testing

### E2E Tests (Phase 6)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e:04  # Table view tests
```

**Test Coverage:**

- Table rendering
- Filter functionality
- Sort functionality
- Pagination
- Search
- Error handling
- Accessibility

---

## Troubleshooting

### Common Issues

**TypeScript Errors:**

- Check import paths use `@/` alias
- Verify tsconfig.json path mappings
- Ensure all types are exported

**Runtime Errors:**

- Check browser console
- Verify mock data loads
- Check React DevTools

**Hook Errors:**

- Ensure `'use client'` directive
- Check hook dependencies
- Verify immutable state updates

**Test Failures:**

- Ensure dev server running
- Check test selectors
- Add waitForTimeout if needed

---

## Next Steps After Completion

1. **Deploy to staging**
2. **User testing**
3. **Performance optimization** (virtualization for 1000+ rows)
4. **Advanced features** (location radius, date filters)
5. **Card view deprecation** (after user feedback)

---

## Questions?

- Check [DASHBOARD_V2_SIMPLIFIED.md](./DASHBOARD_V2_SIMPLIFIED.md) for detailed implementation steps
- Review existing code in `app/dashboard/` and `components/dashboard/`
- See [CLAUDE.md](../../CLAUDE.md) for project architecture

---

**Status:** 📝 Ready for implementation
**Last Updated:** 2025-10-12
**Estimated Effort:** 19-26 hours
