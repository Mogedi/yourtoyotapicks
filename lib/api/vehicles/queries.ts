// Vehicle Query API - Unified interface for fetching and filtering vehicles
import { getMarketcheckListings } from '@/lib/supabase';
import type { VehicleQueryOptions, VehicleQueryResult, Vehicle } from '@/lib/types';
import { mockListings } from '@/lib/mock-data';
import { FilterService } from '@/lib/services/filter-service';
import { SortService } from '@/lib/services/sort-service';
import { PaginationService } from '@/lib/services/pagination-service';

/**
 * Main query function - fetches vehicles with filters, sorting, and pagination
 * Follows the same pattern as app/dashboard/page.tsx:
 * 1. Try Supabase (Marketcheck data)
 * 2. Fallback to mock data
 */
export async function queryVehicles(
  options: VehicleQueryOptions = {}
): Promise<VehicleQueryResult> {
  try {
    // Try Supabase first (uses same pattern as app/dashboard/page.tsx)
    const response = await getMarketcheckListings({ limit: 1000 });

    if (response.data && response.data.length > 0) {
      // Convert ListingSummary to Vehicle format if needed
      const vehicles = response.data as unknown as Vehicle[];
      return processVehicles(vehicles, options);
    }
  } catch (error) {
    // Silently fallback to mock data (expected when Supabase not configured)
    console.warn('Supabase unavailable, using mock data...');
  }

  // Fallback to mock data (same pattern as app/dashboard/page.tsx)
  const mockVehicles = mockListings.map((listing, index) => ({
    ...listing,
    id: String(index),
    created_at: new Date().toISOString(),
    reviewed_by_user: false,
  })) as unknown as Vehicle[];

  return processVehicles(mockVehicles, options);
}

/**
 * Process vehicles with filters, sorting, and pagination
 */
function processVehicles(
  vehicles: Vehicle[],
  options: VehicleQueryOptions
): VehicleQueryResult {
  // Step 1: Apply filters
  const filterOptions = {
    make: options.make,
    model: options.model,
    yearMin: options.yearMin,
    yearMax: options.yearMax,
    priceMin: options.priceMin,
    priceMax: options.priceMax,
    mileageMax: options.mileageMax,
    mileageRating: options.mileageRating,
    reviewStatus: options.reviewStatus,
    search: options.search,
  };

  const filtered = FilterService.applyFilters(vehicles, filterOptions);

  // Step 2: Apply sorting
  const sortOptions = {
    field: options.sortField || 'priority',
    order: options.sortOrder || 'desc',
  };

  const sorted = SortService.sortVehicles(filtered, sortOptions);

  // Step 3: Apply pagination
  const paginationOptions = {
    page: options.page || 1,
    pageSize: options.pageSize || 25,
  };

  const paginated = PaginationService.paginate(sorted, paginationOptions);

  // Return result with metadata
  return {
    data: paginated.data as Vehicle[],
    allFilteredVehicles: sorted as Vehicle[], // Include all filtered vehicles before pagination
    pagination: paginated.pagination,
    filters: {
      activeCount: FilterService.getActiveFilterCount(filterOptions),
    },
  };
}

/**
 * Get vehicle by VIN (for detail pages)
 */
export async function getVehicleByVin(vin: string): Promise<Vehicle | null> {
  try {
    // Try Supabase first
    const response = await getMarketcheckListings({ limit: 1000 });

    if (response.data && response.data.length > 0) {
      const vehicle = response.data.find(
        (v) => v.vin.toLowerCase() === vin.toLowerCase()
      );
      return (vehicle as unknown as Vehicle) || null;
    }
  } catch (error) {
    console.warn('Supabase unavailable, searching mock data...');
  }

  // Fallback to mock data
  const mockVehicles = mockListings.map((listing, index) => ({
    ...listing,
    id: String(index),
    created_at: new Date().toISOString(),
    reviewed_by_user: false,
  })) as unknown as Vehicle[];

  const vehicle = mockVehicles.find(
    (v) => v.vin.toLowerCase() === vin.toLowerCase()
  );

  return vehicle || null;
}

/**
 * Get unique filter values (for filter dropdowns)
 */
export async function getFilterOptions(): Promise<{
  makes: string[];
  models: string[];
  years: number[];
}> {
  try {
    // Try Supabase first
    const response = await getMarketcheckListings({ limit: 1000 });

    if (response.data && response.data.length > 0) {
      return FilterService.getUniqueValues(response.data);
    }
  } catch (error) {
    console.warn('Supabase unavailable, using mock data filter options...');
  }

  // Fallback to mock data (convert to proper format)
  const mockVehicles = mockListings.map((listing, index) => ({
    ...listing,
    id: String(index),
    created_at: new Date().toISOString(),
    reviewed_by_user: false,
  })) as unknown as Vehicle[];

  return FilterService.getUniqueValues(mockVehicles);
}
