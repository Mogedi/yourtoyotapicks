'use client';

/**
 * useVehicleDashboard - Centralized hook for all dashboard data needs
 *
 * This hook consolidates all data fetching, filtering, sorting, pagination,
 * and multi-select state into one place. Feature components can consume
 * only what they need from this hook.
 *
 * Benefits:
 * - Single source of truth for dashboard state
 * - Easy to swap data sources (API vs mock)
 * - Testable in isolation
 * - No props drilling needed
 */

import { useMemo } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import { useVehicleFilters } from '@/hooks/useVehicleFilters';
import { useVehicleSort } from '@/hooks/useVehicleSort';
import { usePagination } from '@/hooks/usePagination';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { FilterService } from '@/lib/services/filter-service';
import { getQualityTier } from '@/lib/constants';
import type { Vehicle } from '@/lib/types';

export interface DashboardStats {
  totalVehicles: number;
  topPicks: number;
  goodBuys: number;
  caution: number;
  activeFilters: number;
}

export interface UseVehicleDashboardReturn {
  // Data
  vehicles: Vehicle[];
  allFilteredVehicles: Vehicle[];
  stats: DashboardStats;

  // State
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: ReturnType<typeof useVehicleFilters>['filters'];
  updateFilter: ReturnType<typeof useVehicleFilters>['updateFilter'];
  clearFilters: ReturnType<typeof useVehicleFilters>['clearFilters'];
  hasActiveFilters: boolean;
  filterOptions: {
    makes: string[];
    models: string[];
    years: number[];
  };

  // Sorting
  sort: ReturnType<typeof useVehicleSort>['sort'];
  toggleSort: ReturnType<typeof useVehicleSort>['toggleSort'];

  // Pagination
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Multi-select
  selectedVehicles: Vehicle[];
  selectedKeys: Set<string>;
  toggleSelect: (vehicle: Vehicle) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  isSelected: (vehicle: Vehicle) => boolean;
  allSelected: boolean;
  hasSelection: boolean;

  // Actions
  refetch: () => Promise<void>;
}

export function useVehicleDashboard(): UseVehicleDashboardReturn {
  // State hooks
  const { filters, updateFilter, clearFilters, hasActiveFilters } =
    useVehicleFilters();
  const { sort, toggleSort } = useVehicleSort();
  const { page, pageSize, goToPage, setPageSize } = usePagination();

  // Build query options from state
  const queryOptions = useMemo(
    () => ({
      make: filters.make !== 'all' ? filters.make : undefined,
      model: filters.model !== 'all' ? filters.model : undefined,
      yearMin: filters.yearMin ? parseInt(filters.yearMin) : undefined,
      yearMax: filters.yearMax ? parseInt(filters.yearMax) : undefined,
      priceMin: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
      priceMax: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
      mileageMax: filters.mileageMax ? parseInt(filters.mileageMax) : undefined,
      mileageRating:
        filters.mileageRating !== 'all' ? filters.mileageRating : undefined,
      qualityTier:
        filters.qualityTier !== 'all' ? filters.qualityTier : undefined,
      search: filters.search !== '' ? filters.search : undefined,
      sortField: sort.field,
      sortOrder: sort.order,
      page,
      pageSize,
    }),
    [filters, sort, page, pageSize]
  );

  // Fetch vehicles
  const { data, isLoading, error, refetch } = useVehicles(queryOptions);

  // Multi-select state
  const {
    selectedItems,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    allSelected,
    selectedKeys,
  } = useMultiSelect(data?.data ?? [], (vehicle) => vehicle.id);

  // Calculate stats from all filtered vehicles (before pagination)
  const stats: DashboardStats = useMemo(() => {
    const allVehicles = data?.allFilteredVehicles ?? [];

    return {
      totalVehicles: data?.pagination.totalItems ?? 0,
      topPicks: allVehicles.filter(
        (v) => getQualityTier(v.priority_score) === 'top_pick'
      ).length,
      goodBuys: allVehicles.filter(
        (v) => getQualityTier(v.priority_score) === 'good_buy'
      ).length,
      caution: allVehicles.filter(
        (v) => getQualityTier(v.priority_score) === 'caution'
      ).length,
      activeFilters: data?.filters.activeCount ?? 0,
    };
  }, [data]);

  // Get unique filter options from current data
  const filterOptions = useMemo(() => {
    if (!data?.allFilteredVehicles) return { makes: [], models: [], years: [] };
    return FilterService.getUniqueValues(data.allFilteredVehicles);
  }, [data?.allFilteredVehicles]);

  return {
    // Data
    vehicles: data?.data ?? [],
    allFilteredVehicles: data?.allFilteredVehicles ?? [],
    stats,

    // State
    isLoading,
    error,

    // Filters
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,

    // Sorting
    sort,
    toggleSort,

    // Pagination
    page,
    pageSize,
    totalPages: data?.pagination.totalPages ?? 1,
    totalItems: data?.pagination.totalItems ?? 0,
    goToPage,
    setPageSize,

    // Multi-select
    selectedVehicles: selectedItems,
    selectedKeys,
    toggleSelect: toggleItem,
    toggleSelectAll: toggleAll,
    clearSelection,
    isSelected,
    allSelected,
    hasSelection: selectedItems.length > 0,

    // Actions
    refetch,
  };
}
