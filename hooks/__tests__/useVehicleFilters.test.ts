import { renderHook, act } from '@testing-library/react';
import { useVehicleFilters } from '../useVehicleFilters';

describe('useVehicleFilters', () => {
  describe('Initial state', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useVehicleFilters());

      expect(result.current.filters).toEqual({
        make: 'all',
        model: 'all',
        yearMin: '',
        yearMax: '',
        priceMin: '',
        priceMax: '',
        mileageMax: '',
        mileageRating: 'all',
        qualityTier: 'all',
        search: '',
      });
    });

    it('should have no active filters initially', () => {
      const { result } = renderHook(() => useVehicleFilters());

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('updateFilter', () => {
    it('should update make filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('make', 'Toyota');
      });

      expect(result.current.filters.make).toBe('Toyota');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update model filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('model', 'RAV4');
      });

      expect(result.current.filters.model).toBe('RAV4');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update yearMin filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('yearMin', '2020');
      });

      expect(result.current.filters.yearMin).toBe('2020');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update yearMax filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('yearMax', '2024');
      });

      expect(result.current.filters.yearMax).toBe('2024');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update priceMin filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('priceMin', '15000');
      });

      expect(result.current.filters.priceMin).toBe('15000');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update priceMax filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('priceMax', '30000');
      });

      expect(result.current.filters.priceMax).toBe('30000');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update mileageMax filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('mileageMax', '50000');
      });

      expect(result.current.filters.mileageMax).toBe('50000');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update mileageRating filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('mileageRating', 'excellent');
      });

      expect(result.current.filters.mileageRating).toBe('excellent');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update qualityTier filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('qualityTier', 'top_pick');
      });

      expect(result.current.filters.qualityTier).toBe('top_pick');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update search filter', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('search', 'RAV4');
      });

      expect(result.current.filters.search).toBe('RAV4');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should update multiple filters independently', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('make', 'Toyota');
        result.current.updateFilter('model', 'RAV4');
        result.current.updateFilter('yearMin', '2020');
      });

      expect(result.current.filters.make).toBe('Toyota');
      expect(result.current.filters.model).toBe('RAV4');
      expect(result.current.filters.yearMin).toBe('2020');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should preserve other filters when updating one', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('make', 'Toyota');
        result.current.updateFilter('model', 'RAV4');
      });

      act(() => {
        result.current.updateFilter('yearMin', '2020');
      });

      expect(result.current.filters.make).toBe('Toyota');
      expect(result.current.filters.model).toBe('RAV4');
      expect(result.current.filters.yearMin).toBe('2020');
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to initial state', () => {
      const { result } = renderHook(() => useVehicleFilters());

      // Set multiple filters
      act(() => {
        result.current.updateFilter('make', 'Toyota');
        result.current.updateFilter('model', 'RAV4');
        result.current.updateFilter('yearMin', '2020');
        result.current.updateFilter('priceMax', '30000');
        result.current.updateFilter('qualityTier', 'top_pick');
      });

      expect(result.current.hasActiveFilters).toBe(true);

      // Clear all filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({
        make: 'all',
        model: 'all',
        yearMin: '',
        yearMax: '',
        priceMin: '',
        priceMax: '',
        mileageMax: '',
        mileageRating: 'all',
        qualityTier: 'all',
        search: '',
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should have no effect if no filters are set', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.filters).toEqual({
        make: 'all',
        model: 'all',
        yearMin: '',
        yearMax: '',
        priceMin: '',
        priceMax: '',
        mileageMax: '',
        mileageRating: 'all',
        qualityTier: 'all',
        search: '',
      });
    });
  });

  describe('hasActiveFilters', () => {
    it('should be false when make is "all"', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('make', 'all');
      });

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should be true when make is not "all"', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('make', 'Toyota');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should be true when any filter has a non-default value', () => {
      const testCases = [
        { key: 'make' as const, value: 'Toyota' },
        { key: 'model' as const, value: 'RAV4' },
        { key: 'yearMin' as const, value: '2020' },
        { key: 'yearMax' as const, value: '2024' },
        { key: 'priceMin' as const, value: '10000' },
        { key: 'priceMax' as const, value: '30000' },
        { key: 'mileageMax' as const, value: '50000' },
        { key: 'mileageRating' as const, value: 'excellent' as const },
        { key: 'qualityTier' as const, value: 'top_pick' as const },
        { key: 'search' as const, value: 'test' },
      ];

      testCases.forEach(({ key, value }) => {
        const { result, unmount } = renderHook(() => useVehicleFilters());

        act(() => {
          result.current.updateFilter(key, value as any);
        });

        expect(result.current.hasActiveFilters).toBe(true);
        unmount();
      });
    });

    it('should be false after clearing filters', () => {
      const { result } = renderHook(() => useVehicleFilters());

      act(() => {
        result.current.updateFilter('make', 'Toyota');
        result.current.updateFilter('search', 'RAV4');
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('Callback stability', () => {
    it('should have stable updateFilter callback', () => {
      const { result, rerender } = renderHook(() => useVehicleFilters());

      const firstUpdateFilter = result.current.updateFilter;

      rerender();

      expect(result.current.updateFilter).toBe(firstUpdateFilter);
    });

    it('should have stable clearFilters callback', () => {
      const { result, rerender } = renderHook(() => useVehicleFilters());

      const firstClearFilters = result.current.clearFilters;

      rerender();

      expect(result.current.clearFilters).toBe(firstClearFilters);
    });
  });
});
