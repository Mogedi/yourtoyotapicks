import { SortService } from '../sort-service';
import type { Vehicle } from '@/lib/types';

describe('SortService', () => {
  // Mock vehicle data with varied attributes for sorting
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      vin: 'VIN1',
      make: 'Toyota',
      model: 'RAV4',
      year: 2021,
      price: 25000,
      mileage: 30000,
      priority_score: 85,
      created_at: '2025-01-01T00:00:00Z',
    } as Vehicle,
    {
      id: '2',
      vin: 'VIN2',
      make: 'Honda',
      model: 'CR-V',
      year: 2020,
      price: 22000,
      mileage: 45000,
      priority_score: 72,
      created_at: '2025-01-02T00:00:00Z',
    } as Vehicle,
    {
      id: '3',
      vin: 'VIN3',
      make: 'Toyota',
      model: 'Camry',
      year: 2018,
      price: 18000,
      mileage: 60000,
      priority_score: 58,
      created_at: '2025-01-03T00:00:00Z',
    } as Vehicle,
    {
      id: '4',
      vin: 'VIN4',
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      price: 28000,
      mileage: 15000,
      priority_score: 90,
      created_at: '2025-01-04T00:00:00Z',
    } as Vehicle,
  ];

  describe('sortVehicles', () => {
    describe('Priority score sorting', () => {
      it('should sort by priority ascending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'priority',
          order: 'asc',
        });

        expect(result[0].priority_score).toBe(58);
        expect(result[1].priority_score).toBe(72);
        expect(result[2].priority_score).toBe(85);
        expect(result[3].priority_score).toBe(90);
      });

      it('should sort by priority descending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'priority',
          order: 'desc',
        });

        expect(result[0].priority_score).toBe(90);
        expect(result[1].priority_score).toBe(85);
        expect(result[2].priority_score).toBe(72);
        expect(result[3].priority_score).toBe(58);
      });
    });

    describe('Quality tier sorting', () => {
      it('should sort by quality tier (top pick first)', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'quality_tier',
          order: 'asc',
        });

        // Top Picks (80+): 90, 85
        expect(result[0].priority_score).toBe(90);
        expect(result[1].priority_score).toBe(85);
        // Good Buy (65-79): 72
        expect(result[2].priority_score).toBe(72);
        // Caution (<65): 58
        expect(result[3].priority_score).toBe(58);
      });

      it('should sort by quality tier descending (caution first)', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'quality_tier',
          order: 'desc',
        });

        // Caution first
        expect(result[0].priority_score).toBe(58);
        // Good Buy
        expect(result[1].priority_score).toBe(72);
        // Top Picks (ordered by score descending within tier)
        expect(result[2].priority_score).toBe(85);
        expect(result[3].priority_score).toBe(90);
      });

      it('should use priority_score as secondary sort within same tier', () => {
        // Add two vehicles with same tier
        const vehiclesWithSameTier = [
          {
            ...mockVehicles[0],
            priority_score: 82,
          },
          {
            ...mockVehicles[1],
            priority_score: 88,
          },
        ] as Vehicle[];

        const result = SortService.sortVehicles(vehiclesWithSameTier, {
          field: 'quality_tier',
          order: 'asc',
        });

        // Both are Top Picks, so higher score comes first
        expect(result[0].priority_score).toBe(88);
        expect(result[1].priority_score).toBe(82);
      });
    });

    describe('Price sorting', () => {
      it('should sort by price ascending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'price',
          order: 'asc',
        });

        expect(result[0].price).toBe(18000);
        expect(result[1].price).toBe(22000);
        expect(result[2].price).toBe(25000);
        expect(result[3].price).toBe(28000);
      });

      it('should sort by price descending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'price',
          order: 'desc',
        });

        expect(result[0].price).toBe(28000);
        expect(result[1].price).toBe(25000);
        expect(result[2].price).toBe(22000);
        expect(result[3].price).toBe(18000);
      });
    });

    describe('Mileage sorting', () => {
      it('should sort by mileage ascending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'mileage',
          order: 'asc',
        });

        expect(result[0].mileage).toBe(15000);
        expect(result[1].mileage).toBe(30000);
        expect(result[2].mileage).toBe(45000);
        expect(result[3].mileage).toBe(60000);
      });

      it('should sort by mileage descending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'mileage',
          order: 'desc',
        });

        expect(result[0].mileage).toBe(60000);
        expect(result[1].mileage).toBe(45000);
        expect(result[2].mileage).toBe(30000);
        expect(result[3].mileage).toBe(15000);
      });
    });

    describe('Year sorting', () => {
      it('should sort by year ascending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'year',
          order: 'asc',
        });

        expect(result[0].year).toBe(2018);
        expect(result[1].year).toBe(2020);
        expect(result[2].year).toBe(2021);
        expect(result[3].year).toBe(2022);
      });

      it('should sort by year descending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'year',
          order: 'desc',
        });

        expect(result[0].year).toBe(2022);
        expect(result[1].year).toBe(2021);
        expect(result[2].year).toBe(2020);
        expect(result[3].year).toBe(2018);
      });
    });

    describe('Make sorting', () => {
      it('should sort by make ascending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'make',
          order: 'asc',
        });

        expect(result[0].make).toBe('Honda');
        expect(result[1].make).toBe('Honda');
        expect(result[2].make).toBe('Toyota');
        expect(result[3].make).toBe('Toyota');
      });

      it('should sort by make descending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'make',
          order: 'desc',
        });

        expect(result[0].make).toBe('Toyota');
        expect(result[1].make).toBe('Toyota');
        expect(result[2].make).toBe('Honda');
        expect(result[3].make).toBe('Honda');
      });
    });

    describe('Model sorting', () => {
      it('should sort by model ascending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'model',
          order: 'asc',
        });

        expect(result[0].model).toBe('Accord');
        expect(result[1].model).toBe('Camry');
        expect(result[2].model).toBe('CR-V');
        expect(result[3].model).toBe('RAV4');
      });

      it('should sort by model descending', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'model',
          order: 'desc',
        });

        expect(result[0].model).toBe('RAV4');
        expect(result[1].model).toBe('CR-V');
        expect(result[2].model).toBe('Camry');
        expect(result[3].model).toBe('Accord');
      });
    });

    describe('Date sorting', () => {
      it('should sort by date ascending (oldest first)', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'date',
          order: 'asc',
        });

        // Date sorting default is newest first (desc), so asc reverses it
        expect(result[0].created_at).toBe('2025-01-04T00:00:00Z');
        expect(result[1].created_at).toBe('2025-01-03T00:00:00Z');
        expect(result[2].created_at).toBe('2025-01-02T00:00:00Z');
        expect(result[3].created_at).toBe('2025-01-01T00:00:00Z');
      });

      it('should sort by date descending (newest first)', () => {
        const result = SortService.sortVehicles(mockVehicles, {
          field: 'date',
          order: 'desc',
        });

        expect(result[0].created_at).toBe('2025-01-01T00:00:00Z');
        expect(result[1].created_at).toBe('2025-01-02T00:00:00Z');
        expect(result[2].created_at).toBe('2025-01-03T00:00:00Z');
        expect(result[3].created_at).toBe('2025-01-04T00:00:00Z');
      });
    });

    describe('Edge cases', () => {
      it('should not mutate original array', () => {
        const original = [...mockVehicles];
        SortService.sortVehicles(mockVehicles, {
          field: 'price',
          order: 'asc',
        });

        expect(mockVehicles).toEqual(original);
      });

      it('should handle empty array', () => {
        const result = SortService.sortVehicles([], {
          field: 'priority',
          order: 'asc',
        });

        expect(result).toEqual([]);
      });

      it('should handle single vehicle', () => {
        const result = SortService.sortVehicles([mockVehicles[0]], {
          field: 'priority',
          order: 'asc',
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(mockVehicles[0]);
      });

      it('should handle vehicles with same values', () => {
        const duplicates = [mockVehicles[0], mockVehicles[0]] as Vehicle[];

        const result = SortService.sortVehicles(duplicates, {
          field: 'priority',
          order: 'asc',
        });

        expect(result).toHaveLength(2);
        expect(result[0].priority_score).toBe(result[1].priority_score);
      });
    });
  });

  describe('toggleOrder', () => {
    it('should toggle from asc to desc', () => {
      const result = SortService.toggleOrder('asc');
      expect(result).toBe('desc');
    });

    it('should toggle from desc to asc', () => {
      const result = SortService.toggleOrder('desc');
      expect(result).toBe('asc');
    });
  });

  describe('getDefaultSort', () => {
    it('should return default sort options', () => {
      const result = SortService.getDefaultSort();

      expect(result).toEqual({
        field: 'priority',
        order: 'desc',
      });
    });
  });

  describe('getSortLabel', () => {
    it('should return label for priority', () => {
      expect(SortService.getSortLabel('priority')).toBe('Priority Score');
    });

    it('should return label for quality_tier', () => {
      expect(SortService.getSortLabel('quality_tier')).toBe('Quality Tier');
    });

    it('should return label for price', () => {
      expect(SortService.getSortLabel('price')).toBe('Price');
    });

    it('should return label for mileage', () => {
      expect(SortService.getSortLabel('mileage')).toBe('Mileage');
    });

    it('should return label for year', () => {
      expect(SortService.getSortLabel('year')).toBe('Year');
    });

    it('should return label for make', () => {
      expect(SortService.getSortLabel('make')).toBe('Make');
    });

    it('should return label for model', () => {
      expect(SortService.getSortLabel('model')).toBe('Model');
    });

    it('should return label for date', () => {
      expect(SortService.getSortLabel('date')).toBe('Date Added');
    });
  });
});
