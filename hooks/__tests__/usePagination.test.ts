import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  describe('Initial state', () => {
    it('should initialize with default values (page 1, size 25)', () => {
      const { result } = renderHook(() => usePagination());

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(25);
    });

    it('should initialize with custom page size', () => {
      const { result } = renderHook(() => usePagination(50));

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(50);
    });
  });

  describe('goToPage', () => {
    it('should navigate to a specific page', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.goToPage(5);
      });

      expect(result.current.page).toBe(5);
    });

    it('should prevent navigating to page less than 1', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.goToPage(0);
      });

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.goToPage(-5);
      });

      expect(result.current.page).toBe(1);
    });

    it('should allow navigating to any positive page number', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.goToPage(100);
      });

      expect(result.current.page).toBe(100);
    });
  });

  describe('setPageSize', () => {
    it('should update page size', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPageSize(50);
      });

      expect(result.current.pageSize).toBe(50);
    });

    it('should reset to page 1 when changing page size', () => {
      const { result } = renderHook(() => usePagination());

      // Navigate to page 5
      act(() => {
        result.current.goToPage(5);
      });

      expect(result.current.page).toBe(5);

      // Change page size
      act(() => {
        result.current.setPageSize(50);
      });

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(50);
    });

    it('should handle multiple page size changes', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPageSize(10);
      });

      expect(result.current.pageSize).toBe(10);

      act(() => {
        result.current.setPageSize(100);
      });

      expect(result.current.pageSize).toBe(100);
    });
  });

  describe('nextPage', () => {
    it('should increment page by 1', () => {
      const { result } = renderHook(() => usePagination());

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(2);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(3);
    });

    it('should allow navigating beyond reasonable bounds', () => {
      const { result } = renderHook(() => usePagination());

      // Simulate going to page 100
      act(() => {
        result.current.goToPage(100);
      });

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(101);
    });
  });

  describe('prevPage', () => {
    it('should decrement page by 1', () => {
      const { result } = renderHook(() => usePagination());

      // Start at page 5
      act(() => {
        result.current.goToPage(5);
      });

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(4);

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(3);
    });

    it('should not go below page 1', () => {
      const { result } = renderHook(() => usePagination());

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(1);
    });

    it('should handle prevPage from page 2 correctly', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(2);

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(1);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => usePagination(50));

      // Change state
      act(() => {
        result.current.goToPage(10);
        result.current.setPageSize(100);
      });

      expect(result.current.page).toBe(1); // Already reset by setPageSize
      expect(result.current.pageSize).toBe(100);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(50); // Back to initial
    });

    it('should reset to default page size if no initial size provided', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.goToPage(5);
        result.current.setPageSize(100);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(25); // Default
    });
  });

  describe('Combined behavior', () => {
    it('should handle complex navigation sequences', () => {
      const { result } = renderHook(() => usePagination());

      // Start at page 1, size 25
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(25);

      // Go to page 5
      act(() => {
        result.current.goToPage(5);
      });

      expect(result.current.page).toBe(5);

      // Next page
      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(6);

      // Change page size (resets to page 1)
      act(() => {
        result.current.setPageSize(50);
      });

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(50);

      // Go to page 3
      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.page).toBe(3);

      // Previous page
      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(2);
    });
  });

  describe('Callback stability', () => {
    it('should have stable goToPage callback', () => {
      const { result, rerender } = renderHook(() => usePagination());

      const firstGoToPage = result.current.goToPage;

      rerender();

      expect(result.current.goToPage).toBe(firstGoToPage);
    });

    it('should have stable setPageSize callback', () => {
      const { result, rerender } = renderHook(() => usePagination());

      const firstSetPageSize = result.current.setPageSize;

      rerender();

      expect(result.current.setPageSize).toBe(firstSetPageSize);
    });

    it('should have stable nextPage callback', () => {
      const { result, rerender } = renderHook(() => usePagination());

      const firstNextPage = result.current.nextPage;

      rerender();

      expect(result.current.nextPage).toBe(firstNextPage);
    });

    it('should have stable prevPage callback', () => {
      const { result, rerender } = renderHook(() => usePagination());

      const firstPrevPage = result.current.prevPage;

      rerender();

      expect(result.current.prevPage).toBe(firstPrevPage);
    });

    it('should have stable reset callback', () => {
      const { result, rerender } = renderHook(() => usePagination(50));

      const firstReset = result.current.reset;

      rerender();

      expect(result.current.reset).toBe(firstReset);
    });
  });
});
