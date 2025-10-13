'use client';

// useVehicleFilters - Manage filter state
import { useState, useCallback } from 'react';
import type { MileageRating } from '@/lib/types';

export interface FilterState {
  make: string;
  model: string;
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  mileageMax: string;
  mileageRating: MileageRating | 'all';
  reviewStatus: 'all' | 'reviewed' | 'not-reviewed';
  search: string;
}

const initialFilters: FilterState = {
  make: 'all',
  model: 'all',
  yearMin: '',
  yearMax: '',
  priceMin: '',
  priceMax: '',
  mileageMax: '',
  mileageRating: 'all',
  reviewStatus: 'all',
  search: '',
};

interface UseVehicleFiltersReturn {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function useVehicleFilters(): UseVehicleFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Check if any filters are active (not default)
  const hasActiveFilters =
    filters.make !== 'all' ||
    filters.model !== 'all' ||
    filters.yearMin !== '' ||
    filters.yearMax !== '' ||
    filters.priceMin !== '' ||
    filters.priceMax !== '' ||
    filters.mileageMax !== '' ||
    filters.mileageRating !== 'all' ||
    filters.reviewStatus !== 'all' ||
    filters.search !== '';

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}
