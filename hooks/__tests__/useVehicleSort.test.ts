import { renderHook, act } from '@testing-library/react';
import { useVehicleSort } from '../useVehicleSort';
import type { SortField } from '@/lib/services/sort-service';

describe('useVehicleSort', () => {
  describe('Initial state', () => {
    it('should initialize with default sort (priority desc)', () => {
      const { result } = renderHook(() => useVehicleSort());

      expect(result.current.sort).toEqual({
        field: 'priority',
        order: 'desc',
      });
    });
  });

  describe('toggleSort', () => {
    it('should toggle order when clicking the same field', () => {
      const { result } = renderHook(() => useVehicleSort());

      // Initial: priority desc
      expect(result.current.sort.order).toBe('desc');

      // Toggle same field
      act(() => {
        result.current.toggleSort('priority');
      });

      expect(result.current.sort).toEqual({
        field: 'priority',
        order: 'asc',
      });

      // Toggle again
      act(() => {
        result.current.toggleSort('priority');
      });

      expect(result.current.sort).toEqual({
        field: 'priority',
        order: 'desc',
      });
    });

    it('should default to ascending when clicking a new field', () => {
      const { result } = renderHook(() => useVehicleSort());

      act(() => {
        result.current.toggleSort('price');
      });

      expect(result.current.sort).toEqual({
        field: 'price',
        order: 'asc',
      });
    });

    it('should handle all valid sort fields', () => {
      const fields: SortField[] = [
        'priority',
        'quality_tier',
        'price',
        'mileage',
        'year',
        'make',
        'model',
        'date',
      ];

      fields.forEach((field) => {
        const { result, unmount } = renderHook(() => useVehicleSort());

        act(() => {
          result.current.toggleSort(field);
        });

        expect(result.current.sort.field).toBe(field);
        unmount();
      });
    });

    it('should maintain field when toggling order', () => {
      const { result } = renderHook(() => useVehicleSort());

      act(() => {
        result.current.toggleSort('mileage');
      });

      expect(result.current.sort.field).toBe('mileage');

      act(() => {
        result.current.toggleSort('mileage');
      });

      expect(result.current.sort.field).toBe('mileage');
    });
  });

  describe('setSort', () => {
    it('should set sort field and order directly', () => {
      const { result } = renderHook(() => useVehicleSort());

      act(() => {
        result.current.setSort('price', 'desc');
      });

      expect(result.current.sort).toEqual({
        field: 'price',
        order: 'desc',
      });
    });

    it('should override previous sort state', () => {
      const { result } = renderHook(() => useVehicleSort());

      act(() => {
        result.current.setSort('mileage', 'asc');
      });

      expect(result.current.sort).toEqual({
        field: 'mileage',
        order: 'asc',
      });

      act(() => {
        result.current.setSort('year', 'desc');
      });

      expect(result.current.sort).toEqual({
        field: 'year',
        order: 'desc',
      });
    });

    it('should allow setting the same field with different order', () => {
      const { result } = renderHook(() => useVehicleSort());

      act(() => {
        result.current.setSort('priority', 'asc');
      });

      expect(result.current.sort.order).toBe('asc');

      act(() => {
        result.current.setSort('priority', 'desc');
      });

      expect(result.current.sort.order).toBe('desc');
    });
  });

  describe('Combined behavior', () => {
    it('should work correctly when mixing toggleSort and setSort', () => {
      const { result } = renderHook(() => useVehicleSort());

      // Use setSort
      act(() => {
        result.current.setSort('price', 'asc');
      });

      expect(result.current.sort).toEqual({ field: 'price', order: 'asc' });

      // Use toggleSort on same field
      act(() => {
        result.current.toggleSort('price');
      });

      expect(result.current.sort).toEqual({ field: 'price', order: 'desc' });

      // Use setSort to change field
      act(() => {
        result.current.setSort('mileage', 'asc');
      });

      expect(result.current.sort).toEqual({ field: 'mileage', order: 'asc' });
    });
  });

  describe('Callback stability', () => {
    it('should have stable toggleSort callback', () => {
      const { result, rerender } = renderHook(() => useVehicleSort());

      const firstToggleSort = result.current.toggleSort;

      rerender();

      expect(result.current.toggleSort).toBe(firstToggleSort);
    });

    it('should have stable setSort callback', () => {
      const { result, rerender } = renderHook(() => useVehicleSort());

      const firstSetSort = result.current.setSort;

      rerender();

      expect(result.current.setSort).toBe(firstSetSort);
    });
  });
});
