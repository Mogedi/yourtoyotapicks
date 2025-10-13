// SortService - Handles all vehicle sorting logic
import type { Vehicle, ListingSummary } from '@/lib/types';
import { getQualityTier } from '@/lib/constants';

export type SortField =
  | 'priority'
  | 'quality_tier'
  | 'price'
  | 'mileage'
  | 'year'
  | 'make'
  | 'model'
  | 'date';

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

export class SortService {
  /**
   * Sort vehicles by the specified field and order
   */
  static sortVehicles(
    vehicles: (Vehicle | ListingSummary)[],
    sortOptions: SortOptions
  ): (Vehicle | ListingSummary)[] {
    const sorted = [...vehicles];
    const { field, order } = sortOptions;

    sorted.sort((a, b) => {
      let compareResult = 0;

      switch (field) {
        case 'priority':
          compareResult = a.priority_score - b.priority_score;
          break;

        case 'quality_tier':
          // Calculate tier rank (1 = Top Pick, 2 = Good Buy, 3 = Caution)
          const getTierRank = (score: number): number => {
            const tier = getQualityTier(score);
            if (tier === 'top_pick') return 1;
            if (tier === 'good_buy') return 2;
            return 3;
          };

          const aTier = getTierRank(a.priority_score);
          const bTier = getTierRank(b.priority_score);

          // Sort by tier first (low number = high tier)
          compareResult = aTier - bTier;

          // If same tier, sort by priority_score as secondary sort
          if (compareResult === 0) {
            compareResult = b.priority_score - a.priority_score;
          }
          break;

        case 'price':
          compareResult = a.price - b.price;
          break;

        case 'mileage':
          compareResult = a.mileage - b.mileage;
          break;

        case 'year':
          compareResult = a.year - b.year;
          break;

        case 'make':
          compareResult = a.make.localeCompare(b.make);
          break;

        case 'model':
          compareResult = a.model.localeCompare(b.model);
          break;

        case 'date':
          compareResult =
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime();
          break;

        default:
          // Default to priority
          compareResult = a.priority_score - b.priority_score;
      }

      // Apply order
      return order === 'desc' ? -compareResult : compareResult;
    });

    return sorted;
  }

  /**
   * Get the opposite order (for toggling)
   */
  static toggleOrder(currentOrder: SortOrder): SortOrder {
    return currentOrder === 'asc' ? 'desc' : 'asc';
  }

  /**
   * Get default sort options
   */
  static getDefaultSort(): SortOptions {
    return {
      field: 'priority',
      order: 'desc',
    };
  }

  /**
   * Get sort label for display
   */
  static getSortLabel(field: SortField): string {
    const labels: Record<SortField, string> = {
      priority: 'Priority Score',
      quality_tier: 'Quality Tier',
      price: 'Price',
      mileage: 'Mileage',
      year: 'Year',
      make: 'Make',
      model: 'Model',
      date: 'Date Added',
    };
    return labels[field] || field;
  }
}
