'use client';

// useVehicleSort - Manage sorting state
import { useState, useCallback } from 'react';
import type { SortField, SortOrder } from '@/lib/services/sort-service';

interface SortState {
  field: SortField;
  order: SortOrder;
}

const initialSort: SortState = {
  field: 'priority',
  order: 'desc',
};

interface UseVehicleSortReturn {
  sort: SortState;
  toggleSort: (field: SortField) => void;
  setSort: (field: SortField, order: SortOrder) => void;
}

export function useVehicleSort(): UseVehicleSortReturn {
  const [sort, setSortState] = useState<SortState>(initialSort);

  const toggleSort = useCallback((field: SortField) => {
    setSortState((prev) => {
      // If clicking the same field, toggle order
      if (prev.field === field) {
        return {
          field,
          order: prev.order === 'asc' ? 'desc' : 'asc',
        };
      }
      // If clicking a new field, default to ascending
      return {
        field,
        order: 'asc',
      };
    });
  }, []);

  const setSort = useCallback((field: SortField, order: SortOrder) => {
    setSortState({ field, order });
  }, []);

  return {
    sort,
    toggleSort,
    setSort,
  };
}
