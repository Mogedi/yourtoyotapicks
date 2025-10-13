# Dashboard V2: Table View Implementation Plan

## Overview

This document outlines the implementation plan for Dashboard V2, a modular, maintainable table-based view that will eventually replace the current card-based dashboard.

## Architecture Goals

1. ✅ **Modular**: Small, single-responsibility components
2. ✅ **Maintainable**: Easy to understand and modify
3. ✅ **View-Agnostic Backend**: Data layer works for any UI
4. ✅ **Easy to Deprecate**: Card view can be deleted cleanly later
5. ✅ **Type-Safe**: Strong TypeScript types throughout

## Design Analysis

### Current Wireframe Features

Based on the provided wireframe, the table view includes:

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
- Click row to expand details inline
- Sticky header on scroll
- Zebra striping for readability
- Pagination at bottom (← 1 2 3 ... 10 →)
- Items per page selector

### Comparison: Card View vs Table View

| Aspect | Card View (Current) | Table View (Proposed) |
|--------|-------------------|---------------------|
| **Density** | Low (large images, spacing) | High (compact rows) |
| **Use Case** | Visual browsing, detailed review | Quick comparison, data analysis |
| **Info Visible** | Limited per screen | Many vehicles at once |
| **Best For** | Casual browsing, first-time users | Power users, repeat visitors |
| **Interaction** | Click for details | Sort columns, quick scan |

## File Structure

```
app/
├── dashboard/
│   ├── layout.tsx                 # Shared layout for both views
│   ├── page.tsx                   # Card view (will be deprecated)
│   └── table/
│       └── page.tsx               # Table view (future default)

components/
├── dashboard/
│   ├── shared/                    # View-agnostic components
│   │   ├── VehicleFilters.tsx     # Shared filter logic
│   │   ├── FilterGroup.tsx        # Reusable filter group
│   │   ├── RangeInput.tsx         # Min/max input component
│   │   ├── SearchBar.tsx          # Search input component
│   │   ├── CheckboxGroup.tsx      # Checkbox list component
│   │   └── EmptyState.tsx         # No results component
│   │
│   ├── card-view/                 # Card-specific (to be removed)
│   │   ├── VehicleCard.tsx
│   │   ├── VehicleList.tsx
│   │   └── FilterBar.tsx
│   │
│   └── table-view/                # Table-specific (permanent)
│       ├── VehicleTable.tsx       # Main table container
│       ├── TableHeader.tsx        # Sortable header row
│       ├── TableBody.tsx          # Virtualized body
│       ├── TableRow.tsx           # Individual row
│       ├── TableCell.tsx          # Reusable cell components
│       ├── TablePagination.tsx    # Pagination controls
│       ├── TableFilters.tsx       # Sidebar filters
│       ├── TableSkeleton.tsx      # Loading state
│       └── ExpandedRowDetails.tsx # Inline expansion

lib/
├── api/                           # Backend API layer
│   ├── vehicles/
│   │   ├── queries.ts             # Database queries
│   │   ├── filters.ts             # Filter builders
│   │   ├── sorting.ts             # Sort logic
│   │   └── pagination.ts          # Pagination helpers
│   │
│   └── supabase-client.ts         # Supabase instance
│
├── hooks/                         # Custom React hooks
│   ├── useVehicles.ts             # Main data fetching hook
│   ├── useVehicleFilters.ts       # Filter state management
│   ├── useVehicleSort.ts          # Sort state management
│   ├── usePagination.ts           # Pagination state
│   └── useUrlSync.ts              # Sync state to URL
│
├── services/                      # Business logic
│   ├── vehicle-service.ts         # Vehicle operations
│   ├── filter-service.ts          # Filter calculations
│   ├── scoring-service.ts         # Score calculations
│   └── validation-service.ts      # Input validation
│
├── utils/                         # Pure utility functions
│   ├── format.ts                  # Number/date formatting
│   ├── vehicle-helpers.ts         # Vehicle-specific helpers
│   └── url-helpers.ts             # URL param helpers
│
└── types/                         # TypeScript definitions
    ├── vehicle.ts                 # Vehicle types (existing)
    ├── filters.ts                 # Filter types
    ├── api.ts                     # API response types
    └── index.ts                   # Barrel exports
```

---

## Phase 1: Backend Foundation (View-Agnostic)

### 1.1 Type Definitions

**File**: `lib/types/filters.ts`

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
  field: 'price' | 'mileage' | 'year' | 'score' | 'created_at';
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
  field: 'score',
  direction: 'desc',
};

export const DEFAULT_PAGINATION: PaginationConfig = {
  page: 1,
  pageSize: 25,
};
```

**File**: `lib/types/api.ts`

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

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
```

### 1.2 Database Query Builder

**File**: `lib/api/vehicles/queries.ts`

```typescript
import { createClient } from '@/lib/supabase';
import type { VehicleQueryOptions, VehicleQueryResult } from '@/lib/types/api';
import type { Vehicle } from '@/lib/types';
import { mockListings } from '@/lib/mock-data';

/**
 * Builds a Supabase query with filters, sorting, and pagination
 * Pure function - no side effects
 */
export function buildVehicleQuery(options: VehicleQueryOptions) {
  const supabase = createClient();
  let query = supabase.from('marketcheck').select('*', { count: 'exact' });

  // Apply filters
  const { filters, sort, pagination } = options;

  // Price range
  if (filters.priceRange) {
    query = query
      .gte('price', filters.priceRange.min)
      .lte('price', filters.priceRange.max);
  }

  // Mileage range
  if (filters.mileageRange) {
    query = query
      .gte('mileage', filters.mileageRange.min)
      .lte('mileage', filters.mileageRange.max);
  }

  // Year range
  if (filters.yearRange) {
    query = query
      .gte('year', filters.yearRange.min)
      .lte('year', filters.yearRange.max);
  }

  // Score range
  if (filters.scoreRange) {
    query = query
      .gte('priority_score', filters.scoreRange.min)
      .lte('priority_score', filters.scoreRange.max);
  }

  // Makes
  if (filters.makes.length > 0) {
    query = query.in('make', filters.makes);
  }

  // Models
  if (filters.models.length > 0) {
    query = query.in('model', filters.models);
  }

  // Search query (searches make, model, VIN)
  if (filters.searchQuery) {
    query = query.or(
      `make.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%,vin.ilike.%${filters.searchQuery}%`
    );
  }

  // Sorting
  query = query.order(sort.field, { ascending: sort.direction === 'asc' });

  // Pagination
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize - 1;
  query = query.range(start, end);

  return query;
}

/**
 * Fetches vehicles with filters, sorting, and pagination
 * Falls back to mock data if Supabase is not configured or fails
 */
export async function fetchVehicles(
  options: VehicleQueryOptions
): Promise<VehicleQueryResult> {
  try {
    const query = buildVehicleQuery(options);
    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / options.pagination.pageSize);

    return {
      data: data || [],
      total: count || 0,
      page: options.pagination.page,
      pageSize: options.pagination.pageSize,
      totalPages,
    };
  } catch (error) {
    // Fall back to mock data
    console.warn('Falling back to mock data:', error);
    return fetchMockVehicles(options);
  }
}

/**
 * Mock data fallback with client-side filtering
 */
function fetchMockVehicles(
  options: VehicleQueryOptions
): VehicleQueryResult {
  let vehicles = mockListings.map((v, index) => ({
    ...v,
    id: String(index),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    first_seen_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
  })) as Vehicle[];

  // Apply filters (client-side)
  const { filters, sort, pagination } = options;

  if (filters.priceRange) {
    vehicles = vehicles.filter(
      v => v.price >= filters.priceRange!.min && v.price <= filters.priceRange!.max
    );
  }

  if (filters.mileageRange) {
    vehicles = vehicles.filter(
      v => v.mileage >= filters.mileageRange!.min && v.mileage <= filters.mileageRange!.max
    );
  }

  if (filters.yearRange) {
    vehicles = vehicles.filter(
      v => v.year >= filters.yearRange!.min && v.year <= filters.yearRange!.max
    );
  }

  if (filters.scoreRange) {
    vehicles = vehicles.filter(
      v => v.priority_score >= filters.scoreRange!.min && v.priority_score <= filters.scoreRange!.max
    );
  }

  if (filters.makes.length > 0) {
    vehicles = vehicles.filter(v => filters.makes.includes(v.make));
  }

  if (filters.models.length > 0) {
    vehicles = vehicles.filter(v => filters.models.includes(v.model));
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    vehicles = vehicles.filter(
      v =>
        v.make.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.vin.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  vehicles.sort((a, b) => {
    const aVal = a[sort.field as keyof Vehicle] as number;
    const bVal = b[sort.field as keyof Vehicle] as number;
    return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Apply pagination
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const paginatedVehicles = vehicles.slice(start, end);

  return {
    data: paginatedVehicles,
    total: vehicles.length,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: Math.ceil(vehicles.length / pagination.pageSize),
  };
}
```

### 1.3 Filter Service (Business Logic)

**File**: `lib/services/filter-service.ts`

```typescript
import type { Vehicle } from '@/lib/types';
import type { VehicleFilters } from '@/lib/types/filters';

/**
 * Filter service with pure functions
 * Easy to test, no side effects
 */
export class FilterService {
  /**
   * Applies all filters to a list of vehicles
   */
  static applyFilters(
    vehicles: Vehicle[],
    filters: VehicleFilters
  ): Vehicle[] {
    let filtered = vehicles;

    if (filters.priceRange) {
      filtered = this.filterByPrice(filtered, filters.priceRange);
    }

    if (filters.mileageRange) {
      filtered = this.filterByMileage(filtered, filters.mileageRange);
    }

    if (filters.yearRange) {
      filtered = this.filterByYear(filtered, filters.yearRange);
    }

    if (filters.scoreRange) {
      filtered = this.filterByScore(filtered, filters.scoreRange);
    }

    if (filters.makes.length > 0) {
      filtered = this.filterByMakes(filtered, filters.makes);
    }

    if (filters.models.length > 0) {
      filtered = this.filterByModels(filtered, filters.models);
    }

    if (filters.searchQuery) {
      filtered = this.filterBySearch(filtered, filters.searchQuery);
    }

    return filtered;
  }

  /**
   * Counts active filters (non-default values)
   */
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

  // Private filter methods - small, focused, testable

  private static filterByPrice(
    vehicles: Vehicle[],
    range: { min: number; max: number }
  ): Vehicle[] {
    return vehicles.filter(v => v.price >= range.min && v.price <= range.max);
  }

  private static filterByMileage(
    vehicles: Vehicle[],
    range: { min: number; max: number }
  ): Vehicle[] {
    return vehicles.filter(v => v.mileage >= range.min && v.mileage <= range.max);
  }

  private static filterByYear(
    vehicles: Vehicle[],
    range: { min: number; max: number }
  ): Vehicle[] {
    return vehicles.filter(v => v.year >= range.min && v.year <= range.max);
  }

  private static filterByScore(
    vehicles: Vehicle[],
    range: { min: number; max: number }
  ): Vehicle[] {
    return vehicles.filter(
      v => v.priority_score >= range.min && v.priority_score <= range.max
    );
  }

  private static filterByMakes(vehicles: Vehicle[], makes: string[]): Vehicle[] {
    return vehicles.filter(v => makes.includes(v.make));
  }

  private static filterByModels(
    vehicles: Vehicle[],
    models: string[]
  ): Vehicle[] {
    return vehicles.filter(v => models.includes(v.model));
  }

  private static filterBySearch(
    vehicles: Vehicle[],
    query: string
  ): Vehicle[] {
    const lowerQuery = query.toLowerCase();
    return vehicles.filter(
      v =>
        v.make.toLowerCase().includes(lowerQuery) ||
        v.model.toLowerCase().includes(lowerQuery) ||
        v.vin.toLowerCase().includes(lowerQuery)
    );
  }
}
```

### 1.4 Sort Service

**File**: `lib/services/sort-service.ts`

```typescript
import type { Vehicle } from '@/lib/types';
import type { SortConfig } from '@/lib/types/filters';

/**
 * Sort service with pure functions
 */
export class SortService {
  /**
   * Sorts vehicles by the given configuration
   */
  static sort(vehicles: Vehicle[], config: SortConfig): Vehicle[] {
    const sorted = [...vehicles];

    sorted.sort((a, b) => {
      return this.compare(a, b, config.field, config.direction);
    });

    return sorted;
  }

  /**
   * Compares two vehicles by a specific field
   */
  private static compare(
    a: Vehicle,
    b: Vehicle,
    field: SortConfig['field'],
    direction: 'asc' | 'desc'
  ): number {
    const aVal = a[field] as number | string;
    const bVal = b[field] as number | string;

    let result = 0;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      result = aVal - bVal;
    } else {
      result = String(aVal).localeCompare(String(bVal));
    }

    return direction === 'asc' ? result : -result;
  }

  /**
   * Gets the opposite sort direction
   */
  static toggleDirection(current: 'asc' | 'desc'): 'asc' | 'desc' {
    return current === 'asc' ? 'desc' : 'asc';
  }
}
```

### 1.5 Utility Functions

**File**: `lib/utils/format.ts`

```typescript
/**
 * Pure formatting utility functions
 */

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

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateRelative(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
```

**File**: `lib/utils/vehicle-helpers.ts`

```typescript
import type { Vehicle } from '@/lib/types';

/**
 * Vehicle-specific helper functions
 */

export function getVehicleDisplayName(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export function getMileageRatingColor(rating: string): string {
  const colors: Record<string, string> = {
    excellent: 'green',
    good: 'blue',
    acceptable: 'yellow',
    high: 'orange',
    'very-high': 'red',
  };
  return colors[rating] || 'gray';
}

export function getScoreBadgeVariant(
  score: number
): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'secondary';
  return 'destructive';
}

export function isHighPriority(vehicle: Vehicle): boolean {
  return vehicle.priority_score >= 80;
}

export function getVehicleLocation(vehicle: Vehicle): string {
  return `${vehicle.city}, ${vehicle.state}`;
}

export function calculateDaysListed(vehicle: Vehicle): number {
  const firstSeen = new Date(vehicle.first_seen_at);
  const now = new Date();
  const diffMs = now.getTime() - firstSeen.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
```

**File**: `lib/utils/url-helpers.ts`

```typescript
import type { VehicleFilters, SortConfig, PaginationConfig } from '@/lib/types/filters';

/**
 * URL query parameter helpers
 */

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

  const minYear = params.get('minYear');
  const maxYear = params.get('maxYear');
  if (minYear && maxYear) {
    filters.yearRange = { min: Number(minYear), max: Number(maxYear) };
  }

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

export function sortToQueryParams(sort: SortConfig): URLSearchParams {
  const params = new URLSearchParams();
  params.set('sortBy', sort.field);
  params.set('order', sort.direction);
  return params;
}

export function queryParamsToSort(params: URLSearchParams): Partial<SortConfig> {
  const sort: Partial<SortConfig> = {};

  const sortBy = params.get('sortBy');
  if (sortBy) {
    sort.field = sortBy as SortConfig['field'];
  }

  const order = params.get('order');
  if (order) {
    sort.direction = order as 'asc' | 'desc';
  }

  return sort;
}

export function paginationToQueryParams(pagination: PaginationConfig): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', String(pagination.page));
  params.set('pageSize', String(pagination.pageSize));
  return params;
}

export function queryParamsToPagination(
  params: URLSearchParams
): Partial<PaginationConfig> {
  const pagination: Partial<PaginationConfig> = {};

  const page = params.get('page');
  if (page) {
    pagination.page = Number(page);
  }

  const pageSize = params.get('pageSize');
  if (pageSize) {
    pagination.pageSize = Number(pageSize);
  }

  return pagination;
}
```

---

## Phase 2: Custom Hooks (State Management)

### 2.1 Main Data Hook

**File**: `lib/hooks/useVehicles.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchVehicles } from '@/lib/api/vehicles/queries';
import type { VehicleQueryOptions, VehicleQueryResult } from '@/lib/types/api';

/**
 * Main hook for fetching vehicle data
 * Used by BOTH card and table views
 */
export function useVehicles(options: VehicleQueryOptions) {
  const [data, setData] = useState<VehicleQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
  }, [options]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
```

### 2.2 Filter Hook

**File**: `lib/hooks/useVehicleFilters.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { VehicleFilters } from '@/lib/types/filters';
import { DEFAULT_FILTERS } from '@/lib/types/filters';

/**
 * Hook for managing filter state
 */
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

  const resetFilter = useCallback(<K extends keyof VehicleFilters>(key: K) => {
    setFilters(prev => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    resetFilter,
    setFilters,
  };
}
```

### 2.3 Sort Hook

**File**: `lib/hooks/useVehicleSort.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { SortConfig } from '@/lib/types/filters';
import { DEFAULT_SORT } from '@/lib/types/filters';

/**
 * Hook for managing sort state
 */
export function useVehicleSort(initialSort: SortConfig = DEFAULT_SORT) {
  const [sort, setSort] = useState<SortConfig>(initialSort);

  const toggleSort = useCallback((field: SortConfig['field']) => {
    setSort(prev => {
      if (prev.field === field) {
        // Toggle direction if same field
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        // Default to descending for new field
        return {
          field,
          direction: 'desc',
        };
      }
    });
  }, []);

  const setSortField = useCallback((field: SortConfig['field']) => {
    setSort(prev => ({ ...prev, field }));
  }, []);

  const setSortDirection = useCallback((direction: 'asc' | 'desc') => {
    setSort(prev => ({ ...prev, direction }));
  }, []);

  return {
    sort,
    toggleSort,
    setSortField,
    setSortDirection,
    setSort,
  };
}
```

### 2.4 Pagination Hook

**File**: `lib/hooks/usePagination.ts`

```typescript
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { PaginationConfig } from '@/lib/types/filters';
import { DEFAULT_PAGINATION } from '@/lib/types/filters';

interface UsePaginationResult {
  page: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  canGoNext: (totalPages: number) => boolean;
  canGoPrev: boolean;
}

/**
 * Hook for managing pagination state
 */
export function usePagination(
  initialPage: number = DEFAULT_PAGINATION.page,
  initialPageSize: number = DEFAULT_PAGINATION.pageSize
): UsePaginationResult {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const nextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);

  const updatePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const canGoNext = useCallback(
    (totalPages: number) => page < totalPages,
    [page]
  );

  const canGoPrev = useMemo(() => page > 1, [page]);

  return {
    page,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: updatePageSize,
    canGoNext,
    canGoPrev,
  };
}
```

### 2.5 URL Sync Hook

**File**: `lib/hooks/useUrlSync.ts`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { VehicleFilters, SortConfig, PaginationConfig } from '@/lib/types/filters';
import {
  filtersToQueryParams,
  sortToQueryParams,
  paginationToQueryParams,
} from '@/lib/utils/url-helpers';

/**
 * Hook to sync state to URL query params
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

    // Merge all params
    const filterParams = filtersToQueryParams(filters);
    const sortParams = sortToQueryParams(sort);
    const paginationParams = paginationToQueryParams(pagination);

    filterParams.forEach((value, key) => params.set(key, value));
    sortParams.forEach((value, key) => params.set(key, value));
    paginationParams.forEach((value, key) => params.set(key, value));

    const newUrl = `${pathname}?${params.toString()}`;
    const currentUrl = `${pathname}?${searchParams.toString()}`;

    // Only update if URL actually changed
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, sort, pagination, router, pathname, searchParams]);
}
```

---

## Phase 3: Shared UI Components

See implementation details in separate files:
- `components/dashboard/shared/RangeInput.tsx`
- `components/dashboard/shared/SearchBar.tsx`
- `components/dashboard/shared/FilterGroup.tsx`
- `components/dashboard/shared/CheckboxGroup.tsx`
- `components/dashboard/shared/EmptyState.tsx`

---

## Phase 4: Table View Components

See implementation details in separate files:
- `components/dashboard/table-view/VehicleTable.tsx`
- `components/dashboard/table-view/TableHeader.tsx`
- `components/dashboard/table-view/TableBody.tsx`
- `components/dashboard/table-view/TableRow.tsx`
- `components/dashboard/table-view/TableCell.tsx`
- `components/dashboard/table-view/TablePagination.tsx`
- `components/dashboard/table-view/TableFilters.tsx`
- `components/dashboard/table-view/TableSkeleton.tsx`

---

## Phase 5: Page Implementation

**File**: `app/dashboard/table/page.tsx`

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
  // Composable hooks
  const { filters, updateFilter, clearFilters } = useVehicleFilters();
  const { sort, toggleSort } = useVehicleSort();
  const { page, pageSize, goToPage, setPageSize } = usePagination();

  // Single data fetching hook
  const { data, loading, error } = useVehicles({
    filters,
    sort,
    pagination: { page, pageSize },
  });

  // Sync to URL
  useUrlSync(filters, sort, { page, pageSize });

  return (
    <div className="flex h-screen">
      {/* Left Sidebar Filters */}
      <TableFilters
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Search Bar */}
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

        {/* Vehicle Table */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="text-red-500 p-4 text-center">
              Error loading vehicles: {error.message}
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
          />
        )}
      </main>
    </div>
  );
}
```

---

## Implementation Checklist

### **Phase 1: Backend Foundation** ✓
- [ ] Create `lib/types/filters.ts` with all filter types
- [ ] Create `lib/types/api.ts` with API types
- [ ] Create `lib/api/vehicles/queries.ts` with query builders
- [ ] Create `lib/services/filter-service.ts` with filter logic
- [ ] Create `lib/services/sort-service.ts` with sort logic
- [ ] Create `lib/utils/format.ts` with formatting functions
- [ ] Create `lib/utils/vehicle-helpers.ts` with helper functions
- [ ] Create `lib/utils/url-helpers.ts` with URL param helpers
- [ ] Write unit tests for all services and utilities

### **Phase 2: Custom Hooks** ✓
- [ ] Create `lib/hooks/useVehicles.ts` for data fetching
- [ ] Create `lib/hooks/useVehicleFilters.ts` for filter state
- [ ] Create `lib/hooks/useVehicleSort.ts` for sort state
- [ ] Create `lib/hooks/usePagination.ts` for pagination state
- [ ] Create `lib/hooks/useUrlSync.ts` for URL sync
- [ ] Test hooks with React Testing Library

### **Phase 3: Shared Components**
- [ ] Create `components/dashboard/shared/RangeInput.tsx`
- [ ] Create `components/dashboard/shared/SearchBar.tsx`
- [ ] Create `components/dashboard/shared/FilterGroup.tsx`
- [ ] Create `components/dashboard/shared/EmptyState.tsx`
- [ ] Create `components/dashboard/shared/CheckboxGroup.tsx`
- [ ] Test each component in isolation

### **Phase 4: Table Components**
- [ ] Create `components/dashboard/table-view/VehicleTable.tsx`
- [ ] Create `components/dashboard/table-view/TableHeader.tsx`
- [ ] Create `components/dashboard/table-view/TableBody.tsx`
- [ ] Create `components/dashboard/table-view/TableRow.tsx`
- [ ] Create `components/dashboard/table-view/TableCell.tsx`
- [ ] Create `components/dashboard/table-view/TablePagination.tsx`
- [ ] Create `components/dashboard/table-view/TableFilters.tsx`
- [ ] Create `components/dashboard/table-view/TableSkeleton.tsx`
- [ ] Add hover effects and interactions

### **Phase 5: Page Implementation**
- [ ] Create `app/dashboard/table/page.tsx`
- [ ] Wire up all hooks
- [ ] Connect components
- [ ] Test full page flow
- [ ] Verify URL sync works
- [ ] Test with real data

### **Phase 6: Polish & Optimization**
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Optimize re-renders with React.memo
- [ ] Add keyboard shortcuts
- [ ] Test responsive behavior
- [ ] Add ARIA labels for accessibility
- [ ] Performance testing with large datasets
- [ ] Add animations/transitions

### **Phase 7: Testing**
- [ ] E2E tests for table view
- [ ] Test sorting functionality
- [ ] Test filtering functionality
- [ ] Test pagination
- [ ] Test URL sync (shareable links)
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Performance audit

### **Phase 8: Migration Prep**
- [ ] Add "Try new table view" banner to card view
- [ ] Track usage metrics (localStorage)
- [ ] Get user feedback
- [ ] Document migration plan
- [ ] Plan card view removal

---

## Estimated Timeline

- **Phase 1**: 3-4 hours (Backend foundation)
- **Phase 2**: 2-3 hours (Custom hooks)
- **Phase 3**: 2-3 hours (Shared components)
- **Phase 4**: 5-6 hours (Table components)
- **Phase 5**: 2-3 hours (Page implementation)
- **Phase 6**: 3-4 hours (Polish)
- **Phase 7**: 2-3 hours (Testing)
- **Phase 8**: 1 hour (Migration prep)

**Total**: 20-29 hours

---

## Why This Architecture is Better

### ✅ **Maintainability**
- Small, focused files (each file does ONE thing)
- Pure functions (easy to test)
- Clear separation of concerns
- Self-documenting code structure

### ✅ **Modularity**
- Components are composable
- Hooks are reusable
- Services are view-agnostic
- Easy to add new views

### ✅ **Easy to Delete Card View**
```bash
# When ready to deprecate:
rm -rf components/dashboard/card-view
rm app/dashboard/page.tsx
mv app/dashboard/table/page.tsx app/dashboard/page.tsx
```

### ✅ **Testability**
- Pure functions (services, utils)
- Isolated components
- Mockable hooks
- No tight coupling

### ✅ **Performance**
- Hooks handle memoization
- Components use React.memo
- Debounced inputs
- Optimized queries

### ✅ **Type Safety**
- Strong TypeScript throughout
- No `any` types
- Compile-time safety
- Better IDE autocomplete

---

## Migration Strategy (Deprecating Card View)

### Step 1: Soft Launch (Week 1-2)
- Deploy table view to `/dashboard/table`
- Add banner to card view: "Try our new table view →"
- Track which view users prefer

### Step 2: Make Table Default (Week 3-4)
- Switch default route to table view
- Keep card view at `/dashboard/cards`
- Continue tracking usage

### Step 3: Deprecation (Week 5-6)
- Show deprecation warning on card view
- "Card view will be removed on [date]"
- Give users time to adjust

### Step 4: Removal (Week 7)
- Delete `components/dashboard/card-view/`
- Delete card view page
- Rename table route to main route
- Clean up unused code

This gives users a smooth transition and you a clean codebase!
