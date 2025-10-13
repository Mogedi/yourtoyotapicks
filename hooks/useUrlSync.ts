'use client';

// useUrlSync - Sync filters, sorting, and pagination with URL params for shareable links
import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { FilterState } from './useVehicleFilters';
import type { SortField, SortOrder } from '@/lib/services/sort-service';

interface UrlSyncState {
  filters: FilterState;
  sort: {
    field: SortField;
    order: SortOrder;
  };
  page: number;
  pageSize: number;
}

export function useUrlSync(state: UrlSyncState) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync state to URL
  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();

    // Add filters
    if (state.filters.make && state.filters.make !== 'all') {
      params.set('make', state.filters.make);
    }
    if (state.filters.model && state.filters.model !== 'all') {
      params.set('model', state.filters.model);
    }
    if (state.filters.yearMin) params.set('yearMin', state.filters.yearMin);
    if (state.filters.yearMax) params.set('yearMax', state.filters.yearMax);
    if (state.filters.priceMin) params.set('priceMin', state.filters.priceMin);
    if (state.filters.priceMax) params.set('priceMax', state.filters.priceMax);
    if (state.filters.mileageMax) params.set('mileageMax', state.filters.mileageMax);
    if (state.filters.mileageRating && state.filters.mileageRating !== 'all') {
      params.set('mileageRating', state.filters.mileageRating);
    }
    if (state.filters.reviewStatus && state.filters.reviewStatus !== 'all') {
      params.set('reviewStatus', state.filters.reviewStatus);
    }
    if (state.filters.search) params.set('search', state.filters.search);

    // Add sorting
    if (state.sort.field !== 'priority') {
      params.set('sortField', state.sort.field);
    }
    if (state.sort.order !== 'desc') {
      params.set('sortOrder', state.sort.order);
    }

    // Add pagination
    if (state.page > 1) {
      params.set('page', state.page.toString());
    }
    if (state.pageSize !== 25) {
      params.set('pageSize', state.pageSize.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    // Only update if URL changed
    if (url !== `${pathname}?${searchParams.toString()}`) {
      router.replace(url, { scroll: false });
    }
  }, [state, router, pathname, searchParams]);

  // Sync URL to state (on mount)
  const getStateFromUrl = useCallback((): Partial<UrlSyncState> => {
    return {
      filters: {
        make: searchParams.get('make') || 'all',
        model: searchParams.get('model') || 'all',
        yearMin: searchParams.get('yearMin') || '',
        yearMax: searchParams.get('yearMax') || '',
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || '',
        mileageMax: searchParams.get('mileageMax') || '',
        mileageRating: (searchParams.get('mileageRating') as any) || 'all',
        reviewStatus: (searchParams.get('reviewStatus') as any) || 'all',
        search: searchParams.get('search') || '',
      },
      sort: {
        field: (searchParams.get('sortField') as SortField) || 'priority',
        order: (searchParams.get('sortOrder') as SortOrder) || 'desc',
      },
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '25', 10),
    };
  }, [searchParams]);

  // Update URL when state changes
  useEffect(() => {
    syncToUrl();
  }, [syncToUrl]);

  return {
    getStateFromUrl,
  };
}
