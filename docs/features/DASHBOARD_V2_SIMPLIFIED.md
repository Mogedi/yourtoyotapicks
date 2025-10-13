# Dashboard V2: Table View Implementation Plan
**Single Claude Execution - Simplified**

## Overview

This is a streamlined implementation plan for Dashboard V2, optimized for a single Claude session executing sequentially. This modular, maintainable table-based view will eventually replace the current card-based dashboard.

**Key Features:**
- 🧪 **Test-Driven**: Write tests alongside implementation
- 🎯 **Incremental**: Build and verify piece by piece
- 📦 **Modular**: Small, focused components
- ♿ **Accessible**: WCAG 2.1 Level AA compliance
- ⚡ **Performant**: Handle 1000+ rows smoothly

**Estimated Timeline**: 20-25 hours (sequential execution)

---

## Design Overview

### Wireframe Features

**Top Section:**
- Brand/Model search input (left)
- Zip Code input with radius selector (right)

**Left Sidebar:**
- Price Range filter [min] - [max]
- Mileage Range filter [min] - [max]
- Year Range filter [min] - [max]
- Score Range filter [min] - [max]
- Make filter (checkboxes)
- Model filter (multi-select)
- Clear All Filters button
- Active filter count badge

**Main Content:**
- Data table with columns:
  - Thumbnail image
  - Name (Year Make Model)
  - Price (sortable, $ formatted)
  - Mileage (sortable, comma formatted)
  - Year (sortable)
  - Location (city, state)
  - VIN (with copy button)
  - Score (sortable, color-coded badge)
  - Actions (View Details, External Link, Review toggle)
- Sortable column headers (click to sort ASC/DESC)
- Row hover effects
- Sticky header on scroll
- Pagination at bottom
- Items per page selector

---

## Architecture Goals

1. ✅ **Modular**: Small, single-responsibility components
2. ✅ **Maintainable**: Easy to understand and modify
3. ✅ **View-Agnostic Backend**: Data layer works for any UI
4. ✅ **Easy to Deprecate**: Card view can be deleted cleanly later
5. ✅ **Type-Safe**: Strong TypeScript types throughout

---

## File Structure

```
app/
├── dashboard/
│   ├── page.tsx                   # Card view (existing)
│   └── table/
│       └── page.tsx               # Table view (new)

components/
├── dashboard/
│   ├── shared/                    # View-agnostic components
│   │   ├── RangeInput.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterGroup.tsx
│   │   ├── CheckboxGroup.tsx
│   │   └── EmptyState.tsx
│   │
│   └── table-view/                # Table-specific components
│       ├── VehicleTable.tsx
│       ├── TableHeader.tsx
│       ├── TableBody.tsx
│       ├── TableRow.tsx
│       ├── TableCell.tsx
│       ├── TablePagination.tsx
│       ├── TableFilters.tsx
│       └── TableSkeleton.tsx

lib/
├── types/
│   ├── filters.ts                 # Filter types
│   └── api.ts                     # API response types
│
├── api/vehicles/
│   └── queries.ts                 # Database queries
│
├── hooks/
│   ├── useVehicles.ts             # Data fetching
│   ├── useVehicleFilters.ts       # Filter state
│   ├── useVehicleSort.ts          # Sort state
│   ├── usePagination.ts           # Pagination state
│   └── useUrlSync.ts              # URL sync
│
├── services/
│   ├── filter-service.ts          # Filter logic
│   └── sort-service.ts            # Sort logic
│
└── utils/
    ├── format.ts                  # Formatting functions
    ├── vehicle-helpers.ts         # Vehicle helpers
    └── url-helpers.ts             # URL param helpers
```

---

## Implementation Phases

### Phase 0: Pre-Flight Checks

**Before starting, verify:**

1. **Dev environment works:**
   ```bash
   npm run dev  # Should start without errors
   ```

2. **Test infrastructure exists:**
   ```bash
   npm run test  # Should run (may have 0 tests)
   ```
   - If missing, check package.json for test script
   - Look for jest.config.js or vitest.config.ts

3. **Current state:**
   ```bash
   git status
   git branch  # Consider: git checkout -b feature/dashboard-v2
   ```

4. **Existing files:**
   ```bash
   # Check if any table view files already exist
   find . -name "*table*" | grep -E "(components|lib)"
   ```

**Context files to read:**
- `lib/supabase.ts` - Understand Supabase setup
- `lib/mock-data.ts` - Understand mock data structure
- `lib/types.ts` - Review existing Vehicle type
- `app/dashboard/page.tsx` - See current card view implementation
- `CLAUDE.md` - Project architecture overview

---

### Phase 1: Backend Foundation (3-4 hours)

**Goal**: Create view-agnostic data layer with types, services, and utilities.

**Implementation Order:**

#### 1.0 Create Directory Structure

Before implementing, create necessary directories:
```bash
mkdir -p lib/types
mkdir -p lib/utils
mkdir -p lib/services
mkdir -p lib/api/vehicles
mkdir -p lib/hooks
mkdir -p components/dashboard/shared
mkdir -p components/dashboard/table-view
mkdir -p app/dashboard/table
mkdir -p tests/e2e/flows
```

#### 1.1 Type Definitions

Create `lib/types/filters.ts`:
```typescript
export interface VehicleFilters {
  priceRange: { min: number; max: number } | null;
  mileageRange: { min: number; max: number } | null;
  yearRange: { min: number; max: number } | null;
  scoreRange: { min: number; max: number } | null;
  makes: string[];
  models: string[];
  zipCode: string | null;
  radius: number;
  searchQuery: string;
}

export interface SortConfig {
  field: 'price' | 'mileage' | 'year' | 'priority_score' | 'created_at';
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}

export const DEFAULT_FILTERS: VehicleFilters = {
  priceRange: null,
  mileageRange: null,
  yearRange: null,
  scoreRange: null,
  makes: [],
  models: [],
  zipCode: null,
  radius: 50,
  searchQuery: '',
};

export const DEFAULT_SORT: SortConfig = {
  field: 'priority_score',
  direction: 'desc',
};

export const DEFAULT_PAGINATION: PaginationConfig = {
  page: 1,
  pageSize: 25,
};
```

Create `lib/types/api.ts`:
```typescript
import type { Vehicle } from './vehicle';
import type { VehicleFilters, SortConfig, PaginationConfig } from './filters';

export interface VehicleQueryOptions {
  filters: VehicleFilters;
  sort: SortConfig;
  pagination: PaginationConfig;
}

export interface VehicleQueryResult {
  data: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

✅ **Verify**: `npm run type-check` (no errors)

#### 1.2 Utility Functions

Create `lib/utils/format.ts`:
```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatMileage(miles: number): string {
  return `${formatNumber(miles)} mi`;
}
```

Create `lib/utils/vehicle-helpers.ts`:
```typescript
import type { Vehicle } from '@/lib/types';

export function getVehicleDisplayName(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export function getVehicleLocation(vehicle: Vehicle): string {
  return `${vehicle.city}, ${vehicle.state}`;
}

export function getScoreBadgeVariant(
  score: number
): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'secondary';
  return 'destructive';
}
```

Create `lib/utils/url-helpers.ts`:
```typescript
import type { VehicleFilters, SortConfig, PaginationConfig } from '@/lib/types/filters';

export function filtersToQueryParams(filters: VehicleFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.priceRange) {
    params.set('minPrice', String(filters.priceRange.min));
    params.set('maxPrice', String(filters.priceRange.max));
  }

  if (filters.mileageRange) {
    params.set('minMileage', String(filters.mileageRange.min));
    params.set('maxMileage', String(filters.mileageRange.max));
  }

  if (filters.yearRange) {
    params.set('minYear', String(filters.yearRange.min));
    params.set('maxYear', String(filters.yearRange.max));
  }

  if (filters.scoreRange) {
    params.set('minScore', String(filters.scoreRange.min));
    params.set('maxScore', String(filters.scoreRange.max));
  }

  if (filters.makes.length > 0) {
    params.set('makes', filters.makes.join(','));
  }

  if (filters.models.length > 0) {
    params.set('models', filters.models.join(','));
  }

  if (filters.searchQuery) {
    params.set('q', filters.searchQuery);
  }

  if (filters.zipCode) {
    params.set('zip', filters.zipCode);
    params.set('radius', String(filters.radius));
  }

  return params;
}

export function queryParamsToFilters(params: URLSearchParams): Partial<VehicleFilters> {
  const filters: Partial<VehicleFilters> = {};

  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  if (minPrice && maxPrice) {
    filters.priceRange = { min: Number(minPrice), max: Number(maxPrice) };
  }

  const minMileage = params.get('minMileage');
  const maxMileage = params.get('maxMileage');
  if (minMileage && maxMileage) {
    filters.mileageRange = { min: Number(minMileage), max: Number(maxMileage) };
  }

  // Year range
  const minYear = params.get('minYear');
  const maxYear = params.get('maxYear');
  if (minYear && maxYear) {
    filters.yearRange = { min: Number(minYear), max: Number(maxYear) };
  }

  // Score range
  const minScore = params.get('minScore');
  const maxScore = params.get('maxScore');
  if (minScore && maxScore) {
    filters.scoreRange = { min: Number(minScore), max: Number(maxScore) };
  }

  const makes = params.get('makes');
  if (makes) {
    filters.makes = makes.split(',');
  }

  const models = params.get('models');
  if (models) {
    filters.models = models.split(',');
  }

  const searchQuery = params.get('q');
  if (searchQuery) {
    filters.searchQuery = searchQuery;
  }

  // Zip code and radius
  const zipCode = params.get('zip');
  if (zipCode) {
    filters.zipCode = zipCode;
    const radius = params.get('radius');
    if (radius) {
      filters.radius = Number(radius);
    }
  }

  return filters;
}
```

✅ **Verify**: `npm run type-check` (no errors)

#### 1.3 Service Layer

Create `lib/services/filter-service.ts`:
```typescript
import type { Vehicle } from '@/lib/types';
import type { VehicleFilters } from '@/lib/types/filters';

export class FilterService {
  static applyFilters(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
    let filtered = vehicles;

    if (filters.priceRange) {
      filtered = filtered.filter(
        v => v.price >= filters.priceRange!.min && v.price <= filters.priceRange!.max
      );
    }

    if (filters.mileageRange) {
      filtered = filtered.filter(
        v => v.mileage >= filters.mileageRange!.min && v.mileage <= filters.mileageRange!.max
      );
    }

    if (filters.yearRange) {
      filtered = filtered.filter(
        v => v.year >= filters.yearRange!.min && v.year <= filters.yearRange!.max
      );
    }

    if (filters.scoreRange) {
      filtered = filtered.filter(
        v => v.priority_score >= filters.scoreRange!.min && v.priority_score <= filters.scoreRange!.max
      );
    }

    if (filters.makes.length > 0) {
      filtered = filtered.filter(v => filters.makes.includes(v.make));
    }

    if (filters.models.length > 0) {
      filtered = filtered.filter(v => filters.models.includes(v.model));
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        v =>
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.vin.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  static countActiveFilters(filters: VehicleFilters): number {
    let count = 0;
    if (filters.priceRange) count++;
    if (filters.mileageRange) count++;
    if (filters.yearRange) count++;
    if (filters.scoreRange) count++;
    if (filters.makes.length > 0) count++;
    if (filters.models.length > 0) count++;
    if (filters.searchQuery) count++;
    if (filters.zipCode) count++;
    return count;
  }
}
```

Create `lib/services/sort-service.ts`:
```typescript
import type { Vehicle } from '@/lib/types';
import type { SortConfig } from '@/lib/types/filters';

export class SortService {
  static sort(vehicles: Vehicle[], config: SortConfig): Vehicle[] {
    const sorted = [...vehicles];

    sorted.sort((a, b) => {
      const aVal = a[config.field] as number | string;
      const bVal = b[config.field] as number | string;

      let result = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        result = aVal - bVal;
      } else {
        result = String(aVal).localeCompare(String(bVal));
      }

      return config.direction === 'asc' ? result : -result;
    });

    return sorted;
  }
}
```

✅ **Verify**: `npm run type-check` (no errors)

#### 1.4 Query Builder

Create `lib/api/vehicles/queries.ts`:
```typescript
import { getMarketcheckListings } from '@/lib/supabase';
import type { VehicleQueryOptions, VehicleQueryResult } from '@/lib/types/api';
import type { Vehicle } from '@/lib/types';
import { mockListings } from '@/lib/mock-data';
import { FilterService } from '@/lib/services/filter-service';
import { SortService } from '@/lib/services/sort-service';

export async function fetchVehicles(
  options: VehicleQueryOptions
): Promise<VehicleQueryResult> {
  try {
    // Try Supabase first
    const vehicles = await getMarketcheckListings();

    if (vehicles && vehicles.length > 0) {
      return processVehicles(vehicles, options);
    }
  } catch (error) {
    console.warn('Supabase query failed, falling back to mock data');
  }

  // Fallback to mock data
  const mockVehicles = mockListings.map((v, index) => ({
    ...v,
    id: String(index),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
  })) as Vehicle[];

  return processVehicles(mockVehicles, options);
}

function processVehicles(
  vehicles: Vehicle[],
  options: VehicleQueryOptions
): VehicleQueryResult {
  // Apply filters
  let filtered = FilterService.applyFilters(vehicles, options.filters);

  // Apply sorting
  filtered = SortService.sort(filtered, options.sort);

  // Apply pagination
  const start = (options.pagination.page - 1) * options.pagination.pageSize;
  const end = start + options.pagination.pageSize;
  const paginated = filtered.slice(start, end);

  return {
    data: paginated,
    total: filtered.length,
    page: options.pagination.page,
    pageSize: options.pagination.pageSize,
    totalPages: Math.ceil(filtered.length / options.pagination.pageSize),
  };
}
```

✅ **Verify**:
- `npm run type-check` (no errors)
- `npm run dev` (starts without errors)

**Phase 1 Complete** ✅

---

### Phase 2: Custom Hooks (2-3 hours)

**Goal**: Create React hooks for state management.

#### 2.1 Data Fetching Hook

Create `lib/hooks/useVehicles.ts`:
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchVehicles } from '@/lib/api/vehicles/queries';
import type { VehicleQueryOptions, VehicleQueryResult } from '@/lib/types/api';

export function useVehicles(options: VehicleQueryOptions) {
  const [data, setData] = useState<VehicleQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize options to prevent infinite loop (objects are recreated on each render)
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchVehicles(options);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [optionsKey]); // Use serialized key instead of object reference

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchVehicles(options);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [optionsKey]);

  return { data, loading, error, refetch };
}
```

#### 2.2 Filter Hook

Create `lib/hooks/useVehicleFilters.ts`:
```typescript
'use client';

import { useState, useCallback } from 'react';
import type { VehicleFilters } from '@/lib/types/filters';
import { DEFAULT_FILTERS } from '@/lib/types/filters';

export function useVehicleFilters(initialFilters: VehicleFilters = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState<VehicleFilters>(initialFilters);

  const updateFilter = useCallback(
    <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateFilters = useCallback((updates: Partial<VehicleFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    setFilters,
  };
}
```

#### 2.3 Sort Hook

Create `lib/hooks/useVehicleSort.ts`:
```typescript
'use client';

import { useState, useCallback } from 'react';
import type { SortConfig } from '@/lib/types/filters';
import { DEFAULT_SORT } from '@/lib/types/filters';

export function useVehicleSort(initialSort: SortConfig = DEFAULT_SORT) {
  const [sort, setSort] = useState<SortConfig>(initialSort);

  const toggleSort = useCallback((field: SortConfig['field']) => {
    setSort(prev => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        return { field, direction: 'desc' };
      }
    });
  }, []);

  return { sort, toggleSort, setSort };
}
```

#### 2.4 Pagination Hook

Create `lib/hooks/usePagination.ts`:
```typescript
'use client';

import { useState, useCallback } from 'react';
import { DEFAULT_PAGINATION } from '@/lib/types/filters';

export function usePagination(
  initialPage: number = DEFAULT_PAGINATION.page,
  initialPageSize: number = DEFAULT_PAGINATION.pageSize
) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const nextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page
  }, []);

  return {
    page,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}
```

#### 2.5 URL Sync Hook

Create `lib/hooks/useUrlSync.ts`:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { VehicleFilters, SortConfig, PaginationConfig } from '@/lib/types/filters';
import { filtersToQueryParams } from '@/lib/utils/url-helpers';

/**
 * Syncs filter, sort, and pagination state to URL query parameters
 * Enables shareable links
 */
export function useUrlSync(
  filters: VehicleFilters,
  sort: SortConfig,
  pagination: PaginationConfig
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();

    // Add filter params
    const filterParams = filtersToQueryParams(filters);
    filterParams.forEach((value, key) => params.set(key, value));

    // Add sort params
    params.set('sortBy', sort.field);
    params.set('order', sort.direction);

    // Add pagination params
    params.set('page', String(pagination.page));
    params.set('pageSize', String(pagination.pageSize));

    const newUrl = `${pathname}?${params.toString()}`;
    const currentUrl = `${pathname}?${searchParams.toString()}`;

    // Only update if URL changed (avoid unnecessary re-renders)
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, sort, pagination, router, pathname, searchParams]);
}
```

✅ **Verify**:
- `npm run type-check` (no errors)
- `npm run dev` (starts without errors)

**Phase 2 Complete** ✅

---

### Phase 3: Shared Components (2-3 hours)

**Goal**: Create reusable UI components for both card and table views.

#### 3.1 RangeInput Component

Create `components/dashboard/shared/RangeInput.tsx`:
```typescript
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RangeInputProps {
  label: string;
  min: number | null;
  max: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  placeholder?: { min: string; max: string };
  prefix?: string;
  className?: string;
}

export function RangeInput({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  placeholder = { min: 'Min', max: 'Max' },
  prefix,
  className,
}: RangeInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {prefix}
            </span>
          )}
          <Input
            type="number"
            placeholder={placeholder.min}
            value={min ?? ''}
            onChange={e => onMinChange(e.target.value ? Number(e.target.value) : null)}
            className={prefix ? 'pl-7' : ''}
            aria-label={`${label} minimum`}
          />
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {prefix}
            </span>
          )}
          <Input
            type="number"
            placeholder={placeholder.max}
            value={max ?? ''}
            onChange={e => onMaxChange(e.target.value ? Number(e.target.value) : null)}
            className={prefix ? 'pl-7' : ''}
            aria-label={`${label} maximum`}
          />
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 SearchBar Component

Create `components/dashboard/shared/SearchBar.tsx`:
```typescript
'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-10"
        aria-label="Search vehicles"
      />
    </div>
  );
}
```

#### 3.3 CheckboxGroup Component

Create `components/dashboard/shared/CheckboxGroup.tsx`:
```typescript
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: CheckboxGroupProps) {
  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {options.map(option => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${label}-${option}`}
              checked={selected.includes(option)}
              onCheckedChange={() => handleToggle(option)}
            />
            <label
              htmlFor={`${label}-${option}`}
              className="text-sm cursor-pointer"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 3.4 EmptyState Component

Create `components/dashboard/shared/EmptyState.tsx`:
```typescript
import { Car } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export function EmptyState({
  message = 'No vehicles found',
  description = 'Try adjusting your filters',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Car className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{message}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
```

✅ **Verify**:
- `npm run type-check` (no errors)
- `npm run dev` (starts without errors)
- Visit existing dashboard to ensure no breakage

**Phase 3 Complete** ✅

---

### Phase 4: Table Components (5-6 hours)

**Goal**: Create table-specific UI components.

**Note**: These components are detailed but follow similar patterns. Implement incrementally and test as you go.

#### Key Components to Create:

1. `components/dashboard/table-view/TableFilters.tsx` - Left sidebar with all filters
2. `components/dashboard/table-view/VehicleTable.tsx` - Main table container
3. `components/dashboard/table-view/TableHeader.tsx` - Sortable column headers
4. `components/dashboard/table-view/TableBody.tsx` - Table rows (use simple rendering, virtualization optional)
5. `components/dashboard/table-view/TableRow.tsx` - Individual row
6. `components/dashboard/table-view/TablePagination.tsx` - Pagination controls
7. `components/dashboard/table-view/TableSkeleton.tsx` - Loading state

**Implementation Strategy:**
- Start with simple table rendering (no virtualization yet)
- Use native HTML `<table>` elements with Tailwind styling
- Add sortable headers with visual indicators (arrows)
- Add hover effects and click interactions
- Sticky header with `position: sticky`

✅ **Verify after each component**:
- TypeScript compiles
- Component renders without errors

**Phase 4 Complete** ✅

---

### Phase 5: Page Implementation (2-3 hours)

**Goal**: Wire everything together in `app/dashboard/table/page.tsx`.

Create `app/dashboard/table/page.tsx`:
```typescript
'use client';

import { VehicleTable } from '@/components/dashboard/table-view/VehicleTable';
import { TableFilters } from '@/components/dashboard/table-view/TableFilters';
import { TablePagination } from '@/components/dashboard/table-view/TablePagination';
import { SearchBar } from '@/components/dashboard/shared/SearchBar';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useVehicleFilters } from '@/lib/hooks/useVehicleFilters';
import { useVehicleSort } from '@/lib/hooks/useVehicleSort';
import { usePagination } from '@/lib/hooks/usePagination';
import { useUrlSync } from '@/lib/hooks/useUrlSync';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TableViewPage() {
  const { filters, updateFilter, clearFilters } = useVehicleFilters();
  const { sort, toggleSort } = useVehicleSort();
  const { page, pageSize, goToPage, setPageSize, nextPage, prevPage } = usePagination();

  const { data, loading, error } = useVehicles({
    filters,
    sort,
    pagination: { page, pageSize },
  });

  // Sync state to URL for shareable links
  useUrlSync(filters, sort, { page, pageSize });

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <TableFilters
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="p-6 border-b flex gap-4">
          <SearchBar
            placeholder="Search by make, model, or VIN..."
            value={filters.searchQuery}
            onChange={value => updateFilter('searchQuery', value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Zip Code"
              value={filters.zipCode ?? ''}
              onChange={e => updateFilter('zipCode', e.target.value)}
              className="w-32"
            />
            <Select
              value={String(filters.radius)}
              onValueChange={v => updateFilter('radius', Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 mi</SelectItem>
                <SelectItem value="50">50 mi</SelectItem>
                <SelectItem value="100">100 mi</SelectItem>
                <SelectItem value="250">250 mi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="text-red-500 p-4 text-center">
              Error: {error.message}
            </div>
          )}
          <VehicleTable
            vehicles={data?.data ?? []}
            sort={sort}
            onSortChange={toggleSort}
            loading={loading}
          />
        </div>

        {/* Pagination */}
        {data && (
          <TablePagination
            currentPage={page}
            totalPages={data.totalPages}
            pageSize={pageSize}
            totalItems={data.total}
            onPageChange={goToPage}
            onPageSizeChange={setPageSize}
            onNext={nextPage}
            onPrev={prevPage}
          />
        )}
      </main>
    </div>
  );
}
```

✅ **Verify**:
- Visit http://localhost:3000/dashboard/table
- Table renders with mock data
- Filters work
- Sorting works
- Pagination works

**Phase 5 Complete** ✅

---

### Phase 6: Polish & Testing (3-4 hours)

**Goal**: Add finishing touches and write E2E tests.

#### 6.1 Add Loading States
- Use `TableSkeleton` component during loading
- Add smooth transitions

#### 6.2 Add Error Boundaries
- Wrap table in error boundary
- Graceful error handling

#### 6.3 Accessibility Improvements
- Add ARIA labels
- Ensure keyboard navigation works
- Test with screen reader

#### 6.4 E2E Tests

Create `tests/e2e/flows/04-table-view.test.ts`:
```typescript
import puppeteer from 'puppeteer';

describe('Dashboard V2 - Table View', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should load table view', async () => {
    await page.goto('http://localhost:3000/dashboard/table');
    await page.waitForSelector('table');
    const rows = await page.$$('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should filter by price', async () => {
    await page.goto('http://localhost:3000/dashboard/table');

    // Set min price
    await page.type('input[aria-label="Price Range minimum"]', '15000');

    // Set max price
    await page.type('input[aria-label="Price Range maximum"]', '25000');

    // Wait for table update
    await page.waitForTimeout(500);

    // Verify filtered results
    const rows = await page.$$('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should sort by price', async () => {
    await page.goto('http://localhost:3000/dashboard/table');

    // Click price column header
    await page.click('th:has-text("Price")');

    // Wait for sort
    await page.waitForTimeout(500);

    // Verify sort indicator appears
    const sortIcon = await page.$('th:has-text("Price") svg');
    expect(sortIcon).toBeTruthy();
  });
});
```

✅ **Verify**:
- Run: `npm run test:e2e`
- All tests pass
- Zero console errors

**Phase 6 Complete** ✅

---

### Phase 7: Navigation & Migration Prep (1 hour)

#### 7.1 Add View Switcher

Update `app/dashboard/page.tsx` to add a banner:
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <>
      {/* Banner */}
      <div className="bg-blue-50 dark:bg-blue-950 p-4 text-center border-b">
        <p className="text-sm">
          Try our new table view for faster browsing!{' '}
          <Link href="/dashboard/table">
            <Button variant="link" className="p-0 h-auto">
              Switch to Table View →
            </Button>
          </Link>
        </p>
      </div>

      {/* Existing dashboard content */}
      {/* ... */}
    </>
  );
}
```

#### 7.2 Add Back Navigation

Update `app/dashboard/table/page.tsx` to add back link:
```typescript
<div className="p-4 border-b flex items-center gap-4">
  <Link href="/dashboard">
    <Button variant="ghost" size="sm">
      ← Back to Card View
    </Button>
  </Link>
  {/* ... rest of top bar */}
</div>
```

✅ **Verify**:
- Can navigate between card and table views
- Both views work independently

**Phase 7 Complete** ✅

---

## Final Checklist

Before marking complete:

- [ ] All TypeScript compiles (`npm run type-check`)
- [ ] Dev server runs without errors (`npm run dev`)
- [ ] Table view loads at `/dashboard/table`
- [ ] Filters work (price, mileage, year, score, make, model)
- [ ] Search works (VIN, make, model)
- [ ] Sorting works (all columns)
- [ ] Pagination works (next, prev, page size)
- [ ] Loading states display correctly
- [ ] Empty state displays when no results
- [ ] Error handling works gracefully
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] E2E tests pass
- [ ] Zero console errors
- [ ] Code committed with descriptive messages

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/dashboard-v2

# Commit after each phase
git add .
git commit -m "feat(dashboard): phase 1 - backend foundation"

# Continue for each phase
git commit -m "feat(dashboard): phase 2 - custom hooks"
git commit -m "feat(dashboard): phase 3 - shared components"
git commit -m "feat(dashboard): phase 4 - table components"
git commit -m "feat(dashboard): phase 5 - page implementation"
git commit -m "feat(dashboard): phase 6 - polish and testing"
git commit -m "feat(dashboard): phase 7 - navigation and migration prep"

# Push to remote
git push origin feature/dashboard-v2
```

---

## Troubleshooting

### TypeScript Errors
- Check import paths use `@/` alias
- Verify all types are exported
- Check tsconfig.json for path mappings

### Runtime Errors
- Check browser console for errors
- Verify Supabase client works or mock data loads
- Check React component rendering

### Hook Errors
- Ensure hooks are only called in client components (`'use client'`)
- Check hook dependencies in useEffect/useCallback
- Verify state updates are immutable

### Test Failures
- Check if dev server is running (`npm run dev`)
- Verify test selectors match actual DOM
- Check for timing issues (add waitForTimeout)

---

## Success Criteria

**Minimum Viable Product (MVP)**:
- ✅ Table view renders at `/dashboard/table`
- ✅ Shows all vehicles from mock data
- ✅ At least 3 filters work (price, make, search)
- ✅ Sorting works on at least 2 columns
- ✅ Pagination works
- ✅ Zero console errors
- ✅ Accessible (can tab through UI)

**Full Feature Complete**:
- ✅ All filters work
- ✅ All columns sortable
- ✅ URL sync (shareable links)
- ✅ Loading states
- ✅ Error boundaries
- ✅ Responsive design
- ✅ E2E tests pass
- ✅ Performance optimized (smooth scrolling)

---

## Timeline Estimate

- **Phase 0**: 30 min (pre-flight checks)
- **Phase 1**: 3-4 hours (backend)
- **Phase 2**: 2-3 hours (hooks)
- **Phase 3**: 2-3 hours (shared components)
- **Phase 4**: 5-6 hours (table components)
- **Phase 5**: 2-3 hours (page)
- **Phase 6**: 3-4 hours (polish/testing)
- **Phase 7**: 1 hour (navigation)

**Total**: 19-26 hours (realistic for single Claude execution)

---

## Next Steps After Completion

1. **User Testing**: Get feedback on table view
2. **Performance**: Add virtualization if needed for 1000+ rows
3. **Features**: Add advanced filters (location radius, date range)
4. **Migration**: Plan card view deprecation timeline
5. **Documentation**: Update README with new features

---

**Good luck! This plan is designed to be executed sequentially with verification at each step. Build incrementally, test often, and commit frequently.** 🚀
