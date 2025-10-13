import { renderHook, waitFor } from '@testing-library/react';
import { useVehicles } from '../useVehicles';
import { queryVehicles } from '@/lib/api/vehicles/queries';

// Mock the queryVehicles function
jest.mock('@/lib/api/vehicles/queries', () => ({
  queryVehicles: jest.fn(),
}));

const mockQueryVehicles = queryVehicles as jest.MockedFunction<
  typeof queryVehicles
>;

describe('useVehicles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should start with loading state', () => {
      mockQueryVehicles.mockImplementation(
        () =>
          new Promise(() => {
            /* never resolves */
          })
      );

      const { result } = renderHook(() => useVehicles());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Successful data fetching', () => {
    it('should fetch and set data successfully', async () => {
      const mockData = {
        vehicles: [
          {
            id: '1',
            vin: 'TEST123',
            make: 'Toyota',
            model: 'RAV4',
            year: 2021,
            price: 25000,
            mileage: 30000,
            priority_score: 85,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          pageSize: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockQueryVehicles.mockResolvedValue(mockData);

      const { result } = renderHook(() => useVehicles());

      // Should start loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });

    it('should call queryVehicles with provided options', async () => {
      mockQueryVehicles.mockResolvedValue({
        vehicles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          pageSize: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const options = {
        filters: { make: 'Toyota', model: 'RAV4' },
        sort: { field: 'price' as const, order: 'asc' as const },
        page: 2,
        pageSize: 50,
      };

      renderHook(() => useVehicles(options));

      await waitFor(() => {
        expect(mockQueryVehicles).toHaveBeenCalledWith(options);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      mockQueryVehicles.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useVehicles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.data).toBe(null);
    });

    it('should handle non-Error objects', async () => {
      mockQueryVehicles.mockRejectedValue('String error');

      const { result } = renderHook(() => useVehicles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch vehicles');
    });

    it('should clear previous errors on successful refetch', async () => {
      // First call fails
      mockQueryVehicles.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useVehicles());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Second call succeeds
      mockQueryVehicles.mockResolvedValue({
        vehicles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          pageSize: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('Enabled option', () => {
    it('should not fetch when enabled is false', async () => {
      mockQueryVehicles.mockResolvedValue({
        vehicles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          pageSize: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const { result } = renderHook(() => useVehicles({ enabled: false }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockQueryVehicles).not.toHaveBeenCalled();
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should fetch when enabled is true (default)', async () => {
      mockQueryVehicles.mockResolvedValue({
        vehicles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          pageSize: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      renderHook(() => useVehicles({ enabled: true }));

      await waitFor(() => {
        expect(mockQueryVehicles).toHaveBeenCalled();
      });
    });
  });

  describe('Refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const mockData1 = {
        vehicles: [{ id: '1' } as any],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          pageSize: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      const mockData2 = {
        vehicles: [{ id: '2' } as any],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          pageSize: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockQueryVehicles
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      const { result } = renderHook(() => useVehicles());

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.data).toEqual(mockData1);
      });

      // Refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2);
      });

      expect(mockQueryVehicles).toHaveBeenCalledTimes(2);
    });

    it('should set loading state during refetch', async () => {
      mockQueryVehicles.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  vehicles: [],
                  pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalItems: 0,
                    pageSize: 25,
                    hasNextPage: false,
                    hasPrevPage: false,
                  },
                }),
              100
            );
          })
      );

      const { result } = renderHook(() => useVehicles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger refetch and wait for loading state to update
      const refetchPromise = result.current.refetch();

      // Wait for loading state to be set to true
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await refetchPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Options changes', () => {
    it('should refetch when options change', async () => {
      mockQueryVehicles.mockResolvedValue({
        vehicles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          pageSize: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const { rerender } = renderHook(
        ({ options }) => useVehicles(options),
        {
          initialProps: {
            options: { filters: { make: 'Toyota' } },
          },
        }
      );

      await waitFor(() => {
        expect(mockQueryVehicles).toHaveBeenCalledWith({
          filters: { make: 'Toyota' },
        });
      });

      // Change options
      rerender({ options: { filters: { make: 'Honda' } } });

      await waitFor(() => {
        expect(mockQueryVehicles).toHaveBeenCalledWith({
          filters: { make: 'Honda' },
        });
      });

      expect(mockQueryVehicles).toHaveBeenCalledTimes(2);
    });
  });
});
