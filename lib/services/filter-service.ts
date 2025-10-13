// FilterService - Handles all vehicle filtering logic
import type { Vehicle, ListingSummary, MileageRating, QualityTier } from '@/lib/types';

export interface FilterOptions {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  mileageRating?: MileageRating | 'all';
  qualityTier?: QualityTier | 'all';
  search?: string;
}

export class FilterService {
  /**
   * Apply all filters to a list of vehicles
   */
  static applyFilters(
    vehicles: (Vehicle | ListingSummary)[],
    filters: FilterOptions
  ): (Vehicle | ListingSummary)[] {
    let filtered = [...vehicles];

    // Filter by make
    if (filters.make && filters.make !== 'all') {
      filtered = filtered.filter((v) => v.make === filters.make);
    }

    // Filter by model
    if (filters.model && filters.model !== 'all') {
      filtered = filtered.filter((v) => v.model === filters.model);
    }

    // Filter by year range
    if (filters.yearMin !== undefined) {
      filtered = filtered.filter((v) => v.year >= filters.yearMin!);
    }
    if (filters.yearMax !== undefined) {
      filtered = filtered.filter((v) => v.year <= filters.yearMax!);
    }

    // Filter by price range
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter((v) => v.price >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter((v) => v.price <= filters.priceMax!);
    }

    // Filter by mileage max
    if (filters.mileageMax !== undefined) {
      filtered = filtered.filter((v) => v.mileage <= filters.mileageMax!);
    }

    // Filter by mileage rating
    if (filters.mileageRating && filters.mileageRating !== 'all') {
      filtered = filtered.filter(
        (v) => v.mileage_rating === filters.mileageRating
      );
    }

    // Filter by quality tier
    if (filters.qualityTier && filters.qualityTier !== 'all') {
      filtered = filtered.filter((v) => {
        const score = v.priority_score;
        if (filters.qualityTier === 'top_pick') {
          return score >= 80;
        } else if (filters.qualityTier === 'good_buy') {
          return score >= 65 && score < 80;
        } else if (filters.qualityTier === 'caution') {
          return score < 65;
        }
        return true;
      });
    }

    // Filter by search (VIN, make, model, year)
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter((v) => {
        const vinMatch = v.vin.toLowerCase().includes(searchLower);
        const makeMatch = v.make.toLowerCase().includes(searchLower);
        const modelMatch = v.model.toLowerCase().includes(searchLower);
        const yearMatch = v.year.toString().includes(searchLower);
        return vinMatch || makeMatch || modelMatch || yearMatch;
      });
    }

    return filtered;
  }

  /**
   * Get unique values for filter dropdowns
   */
  static getUniqueValues(vehicles: (Vehicle | ListingSummary)[]) {
    const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort();
    const models = Array.from(new Set(vehicles.map((v) => v.model))).sort();
    const years = Array.from(new Set(vehicles.map((v) => v.year))).sort(
      (a, b) => b - a
    );

    return { makes, models, years };
  }

  /**
   * Get filter summary (active filter count)
   */
  static getActiveFilterCount(filters: FilterOptions): number {
    let count = 0;
    if (filters.make && filters.make !== 'all') count++;
    if (filters.model && filters.model !== 'all') count++;
    if (filters.yearMin !== undefined) count++;
    if (filters.yearMax !== undefined) count++;
    if (filters.priceMin !== undefined) count++;
    if (filters.priceMax !== undefined) count++;
    if (filters.mileageMax !== undefined) count++;
    if (filters.mileageRating && filters.mileageRating !== 'all') count++;
    if (filters.qualityTier && filters.qualityTier !== 'all') count++;
    if (filters.search && filters.search.trim() !== '') count++;
    return count;
  }
}
