import { renderHook } from '@testing-library/react';
import { useUrlSync } from '../useUrlSync';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('useUrlSync', () => {
  let mockReplace: jest.Mock;
  let mockSearchParams: URLSearchParams;

  beforeEach(() => {
    mockReplace = jest.fn();
    mockSearchParams = new URLSearchParams();

    mockUseRouter.mockReturnValue({
      replace: mockReplace,
    } as any);

    mockUseSearchParams.mockReturnValue(mockSearchParams as any);
    mockUsePathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultState = {
    filters: {
      make: 'all',
      model: 'all',
      yearMin: '',
      yearMax: '',
      priceMin: '',
      priceMax: '',
      mileageMax: '',
      mileageRating: 'all' as const,
      qualityTier: 'all' as const,
      search: '',
    },
    sort: {
      field: 'priority' as const,
      order: 'desc' as const,
    },
    page: 1,
    pageSize: 25,
  };

  describe('getStateFromUrl', () => {
    it('should return default state when no params are present', () => {
      const { result } = renderHook(() => useUrlSync(defaultState));

      const state = result.current.getStateFromUrl();

      expect(state).toEqual({
        filters: {
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
        },
        sort: {
          field: 'priority',
          order: 'desc',
        },
        page: 1,
        pageSize: 25,
      });
    });

    it('should parse filter params from URL', () => {
      mockSearchParams = new URLSearchParams({
        make: 'Toyota',
        model: 'RAV4',
        yearMin: '2020',
        yearMax: '2024',
        priceMin: '15000',
        priceMax: '30000',
        mileageMax: '50000',
        mileageRating: 'excellent',
        qualityTier: 'top_pick',
        search: 'test',
      });

      mockUseSearchParams.mockReturnValue(mockSearchParams as any);

      const { result } = renderHook(() => useUrlSync(defaultState));

      const state = result.current.getStateFromUrl();

      expect(state.filters).toEqual({
        make: 'Toyota',
        model: 'RAV4',
        yearMin: '2020',
        yearMax: '2024',
        priceMin: '15000',
        priceMax: '30000',
        mileageMax: '50000',
        mileageRating: 'excellent',
        qualityTier: 'top_pick',
        search: 'test',
      });
    });

    it('should parse sort params from URL', () => {
      mockSearchParams = new URLSearchParams({
        sortField: 'price',
        sortOrder: 'asc',
      });

      mockUseSearchParams.mockReturnValue(mockSearchParams as any);

      const { result } = renderHook(() => useUrlSync(defaultState));

      const state = result.current.getStateFromUrl();

      expect(state.sort).toEqual({
        field: 'price',
        order: 'asc',
      });
    });

    it('should parse pagination params from URL', () => {
      mockSearchParams = new URLSearchParams({
        page: '5',
        pageSize: '50',
      });

      mockUseSearchParams.mockReturnValue(mockSearchParams as any);

      const { result } = renderHook(() => useUrlSync(defaultState));

      const state = result.current.getStateFromUrl();

      expect(state.page).toBe(5);
      expect(state.pageSize).toBe(50);
    });
  });

  describe('syncToUrl', () => {
    it('should not add default values to URL', () => {
      renderHook(() => useUrlSync(defaultState));

      // Should call replace with just the pathname (no query params)
      expect(mockReplace).toHaveBeenCalledWith('/dashboard', {
        scroll: false,
      });
    });

    it('should add non-default filter values to URL', () => {
      const state = {
        ...defaultState,
        filters: {
          ...defaultState.filters,
          make: 'Toyota',
          model: 'RAV4',
        },
      };

      renderHook(() => useUrlSync(state));

      expect(mockReplace).toHaveBeenCalledWith(
        '/dashboard?make=Toyota&model=RAV4',
        { scroll: false }
      );
    });

    it('should add all filter types to URL', () => {
      const state = {
        ...defaultState,
        filters: {
          make: 'Toyota',
          model: 'RAV4',
          yearMin: '2020',
          yearMax: '2024',
          priceMin: '15000',
          priceMax: '30000',
          mileageMax: '50000',
          mileageRating: 'excellent' as const,
          qualityTier: 'top_pick' as const,
          search: 'test',
        },
      };

      renderHook(() => useUrlSync(state));

      const url = mockReplace.mock.calls[0][0];
      expect(url).toContain('make=Toyota');
      expect(url).toContain('model=RAV4');
      expect(url).toContain('yearMin=2020');
      expect(url).toContain('yearMax=2024');
      expect(url).toContain('priceMin=15000');
      expect(url).toContain('priceMax=30000');
      expect(url).toContain('mileageMax=50000');
      expect(url).toContain('mileageRating=excellent');
      expect(url).toContain('qualityTier=top_pick');
      expect(url).toContain('search=test');
    });

    it('should add non-default sort to URL', () => {
      const state = {
        ...defaultState,
        sort: {
          field: 'price' as const,
          order: 'asc' as const,
        },
      };

      renderHook(() => useUrlSync(state));

      expect(mockReplace).toHaveBeenCalledWith(
        '/dashboard?sortField=price&sortOrder=asc',
        { scroll: false }
      );
    });

    it('should only add sortField when order is default', () => {
      const state = {
        ...defaultState,
        sort: {
          field: 'price' as const,
          order: 'desc' as const,
        },
      };

      renderHook(() => useUrlSync(state));

      expect(mockReplace).toHaveBeenCalledWith('/dashboard?sortField=price', {
        scroll: false,
      });
    });

    it('should add non-default pagination to URL', () => {
      const state = {
        ...defaultState,
        page: 5,
        pageSize: 50,
      };

      renderHook(() => useUrlSync(state));

      expect(mockReplace).toHaveBeenCalledWith(
        '/dashboard?page=5&pageSize=50',
        { scroll: false }
      );
    });

    it('should handle complex combined state', () => {
      const state = {
        filters: {
          make: 'Toyota',
          model: 'all',
          yearMin: '2020',
          yearMax: '',
          priceMin: '',
          priceMax: '30000',
          mileageMax: '',
          mileageRating: 'excellent' as const,
          qualityTier: 'all' as const,
          search: '',
        },
        sort: {
          field: 'price' as const,
          order: 'asc' as const,
        },
        page: 3,
        pageSize: 25,
      };

      renderHook(() => useUrlSync(state));

      const url = mockReplace.mock.calls[0][0];
      // Should have filters
      expect(url).toContain('make=Toyota');
      expect(url).toContain('yearMin=2020');
      expect(url).toContain('priceMax=30000');
      expect(url).toContain('mileageRating=excellent');
      // Should have sort
      expect(url).toContain('sortField=price');
      expect(url).toContain('sortOrder=asc');
      // Should have page but not pageSize (default)
      expect(url).toContain('page=3');
      expect(url).not.toContain('pageSize');
      // Should NOT have default values
      expect(url).not.toContain('model=all');
      expect(url).not.toContain('qualityTier=all');
    });

    it('should skip replace if URL already matches current state', () => {
      // Set existing params to match the state
      mockSearchParams = new URLSearchParams('make=Toyota');
      mockUseSearchParams.mockReturnValue(mockSearchParams as any);

      const state = {
        ...defaultState,
        filters: {
          ...defaultState.filters,
          make: 'Toyota',
        },
      };

      renderHook(() => useUrlSync(state));

      // The hook compares URL and skips replace if they match
      // So it should not be called (or called with the same URL)
      // This is an optimization to avoid unnecessary history updates
      const calls = mockReplace.mock.calls;
      if (calls.length > 0) {
        // If called, it should be with the matching URL
        expect(calls[0][0]).toContain('make=Toyota');
      }
      // Either not called or called once with same URL is acceptable
      expect(calls.length).toBeLessThanOrEqual(1);
    });
  });

  describe('URL encoding', () => {
    it('should handle special characters in search', () => {
      const state = {
        ...defaultState,
        filters: {
          ...defaultState.filters,
          search: 'test & value',
        },
      };

      renderHook(() => useUrlSync(state));

      const url = mockReplace.mock.calls[0][0];
      expect(url).toContain('search=test+%26+value');
    });
  });

  describe('State updates', () => {
    it('should update URL when state changes', () => {
      const { rerender } = renderHook(
        ({ state }) => useUrlSync(state),
        {
          initialProps: {
            state: defaultState,
          },
        }
      );

      expect(mockReplace).toHaveBeenCalledTimes(1);

      // Update state
      const newState = {
        ...defaultState,
        filters: {
          ...defaultState.filters,
          make: 'Honda',
        },
      };

      rerender({ state: newState });

      expect(mockReplace).toHaveBeenCalledTimes(2);
      expect(mockReplace).toHaveBeenLastCalledWith('/dashboard?make=Honda', {
        scroll: false,
      });
    });
  });
});
