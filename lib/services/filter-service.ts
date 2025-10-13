// FilterService - Handles all vehicle filtering logic
import type { Vehicle, ListingSummary, MileageRating, QualityTier } from '@/lib/types';
import { QUALITY_TIER, getQualityTier } from '@/lib/constants';

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
   * Filters are applied sequentially to progressively narrow down results
   * @param vehicles - Array of vehicles to filter
   * @param filters - Filter options to apply
   * @returns Filtered array of vehicles
   */
  static applyFilters(
    vehicles: (Vehicle | ListingSummary)[],
    filters: FilterOptions
  ): (Vehicle | ListingSummary)[] {
    let filtered = [...vehicles];

    // Apply each filter if specified
    filtered = this.filterByMake(filtered, filters.make);
    filtered = this.filterByModel(filtered, filters.model);
    filtered = this.filterByYearRange(filtered, filters.yearMin, filters.yearMax);
    filtered = this.filterByPriceRange(filtered, filters.priceMin, filters.priceMax);
    filtered = this.filterByMileage(filtered, filters.mileageMax);
    filtered = this.filterByMileageRating(filtered, filters.mileageRating);
    filtered = this.filterByQualityTier(filtered, filters.qualityTier);
    filtered = this.filterBySearch(filtered, filters.search);

    return filtered;
  }

  /**
   * Filter vehicles by make
   */
  private static filterByMake(
    vehicles: (Vehicle | ListingSummary)[],
    make?: string
  ): (Vehicle | ListingSummary)[] {
    if (!make || make === 'all') return vehicles;
    return vehicles.filter((v) => v.make === make);
  }

  /**
   * Filter vehicles by model
   */
  private static filterByModel(
    vehicles: (Vehicle | ListingSummary)[],
    model?: string
  ): (Vehicle | ListingSummary)[] {
    if (!model || model === 'all') return vehicles;
    return vehicles.filter((v) => v.model === model);
  }

  /**
   * Filter vehicles by year range
   */
  private static filterByYearRange(
    vehicles: (Vehicle | ListingSummary)[],
    yearMin?: number,
    yearMax?: number
  ): (Vehicle | ListingSummary)[] {
    let filtered = vehicles;
    if (yearMin !== undefined) {
      filtered = filtered.filter((v) => v.year >= yearMin);
    }
    if (yearMax !== undefined) {
      filtered = filtered.filter((v) => v.year <= yearMax);
    }
    return filtered;
  }

  /**
   * Filter vehicles by price range
   */
  private static filterByPriceRange(
    vehicles: (Vehicle | ListingSummary)[],
    priceMin?: number,
    priceMax?: number
  ): (Vehicle | ListingSummary)[] {
    let filtered = vehicles;
    if (priceMin !== undefined) {
      filtered = filtered.filter((v) => v.price >= priceMin);
    }
    if (priceMax !== undefined) {
      filtered = filtered.filter((v) => v.price <= priceMax);
    }
    return filtered;
  }

  /**
   * Filter vehicles by maximum mileage
   */
  private static filterByMileage(
    vehicles: (Vehicle | ListingSummary)[],
    mileageMax?: number
  ): (Vehicle | ListingSummary)[] {
    if (mileageMax === undefined) return vehicles;
    return vehicles.filter((v) => v.mileage <= mileageMax);
  }

  /**
   * Filter vehicles by mileage rating
   */
  private static filterByMileageRating(
    vehicles: (Vehicle | ListingSummary)[],
    mileageRating?: MileageRating | 'all'
  ): (Vehicle | ListingSummary)[] {
    if (!mileageRating || mileageRating === 'all') return vehicles;
    return vehicles.filter((v) => v.mileage_rating === mileageRating);
  }

  /**
   * Filter vehicles by quality tier
   * Uses getQualityTier helper to determine tier from priority score
   */
  private static filterByQualityTier(
    vehicles: (Vehicle | ListingSummary)[],
    qualityTier?: QualityTier | 'all'
  ): (Vehicle | ListingSummary)[] {
    if (!qualityTier || qualityTier === 'all') return vehicles;
    return vehicles.filter((v) => {
      const vehicleTier = getQualityTier(v.priority_score);
      return vehicleTier === qualityTier;
    });
  }

  /**
   * Filter vehicles by search query
   * Searches across VIN, make, model, and year
   */
  private static filterBySearch(
    vehicles: (Vehicle | ListingSummary)[],
    search?: string
  ): (Vehicle | ListingSummary)[] {
    if (!search || search.trim() === '') return vehicles;

    const searchLower = search.toLowerCase().trim();
    return vehicles.filter((v) => {
      const vinMatch = v.vin.toLowerCase().includes(searchLower);
      const makeMatch = v.make.toLowerCase().includes(searchLower);
      const modelMatch = v.model.toLowerCase().includes(searchLower);
      const yearMatch = v.year.toString().includes(searchLower);
      return vinMatch || makeMatch || modelMatch || yearMatch;
    });
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
