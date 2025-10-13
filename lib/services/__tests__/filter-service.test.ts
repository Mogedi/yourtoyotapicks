import { FilterService } from '../filter-service';
import type { Vehicle, MileageRating, QualityTier } from '@/lib/types';

describe('FilterService', () => {
  // Mock vehicle data
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      vin: '5YFBURHE5HP690324',
      make: 'Toyota',
      model: 'RAV4',
      year: 2021,
      price: 25000,
      mileage: 30000,
      priority_score: 85,
      mileage_rating: 'excellent' as MileageRating,
      quality_tier: 'top_pick' as QualityTier,
      title_status: 'clean',
      accident_count: 0,
      owner_count: 1,
      is_rental: false,
      is_fleet: false,
      has_lien: false,
      flood_damage: false,
      state_of_origin: 'CA',
      is_rust_belt_state: false,
      current_location: 'Portland, OR',
      distance_miles: 25,
      flag_rust_concern: false,
      source_platform: 'Marketcheck',
      source_url: 'https://example.com/1',
      reviewed_by_user: false,
      first_seen_at: '2025-01-01T00:00:00Z',
      last_updated_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    } as Vehicle,
    {
      id: '2',
      vin: '2HKRM4H72MH101234',
      make: 'Honda',
      model: 'CR-V',
      year: 2020,
      price: 22000,
      mileage: 45000,
      priority_score: 72,
      mileage_rating: 'good' as MileageRating,
      quality_tier: 'good_buy' as QualityTier,
      title_status: 'clean',
      accident_count: 0,
      owner_count: 2,
      is_rental: false,
      is_fleet: false,
      has_lien: false,
      flood_damage: false,
      state_of_origin: 'WA',
      is_rust_belt_state: false,
      current_location: 'Seattle, WA',
      distance_miles: 150,
      flag_rust_concern: false,
      source_platform: 'Marketcheck',
      source_url: 'https://example.com/2',
      reviewed_by_user: false,
      first_seen_at: '2025-01-01T00:00:00Z',
      last_updated_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    } as Vehicle,
    {
      id: '3',
      vin: '4T1B11HK8JU123456',
      make: 'Toyota',
      model: 'Camry',
      year: 2018,
      price: 18000,
      mileage: 60000,
      priority_score: 58,
      mileage_rating: 'acceptable' as MileageRating,
      quality_tier: 'caution' as QualityTier,
      title_status: 'clean',
      accident_count: 1,
      owner_count: 3,
      is_rental: false,
      is_fleet: true,
      has_lien: false,
      flood_damage: false,
      state_of_origin: 'OH',
      is_rust_belt_state: true,
      current_location: 'Portland, OR',
      distance_miles: 50,
      flag_rust_concern: true,
      source_platform: 'Marketcheck',
      source_url: 'https://example.com/3',
      reviewed_by_user: false,
      first_seen_at: '2025-01-01T00:00:00Z',
      last_updated_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    } as Vehicle,
  ];

  describe('applyFilters', () => {
    it('should return all vehicles when no filters applied', () => {
      const result = FilterService.applyFilters(mockVehicles, {});
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockVehicles);
    });

    describe('Make filter', () => {
      it('should filter by make - Toyota', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          make: 'Toyota',
        });
        expect(result).toHaveLength(2);
        expect(result.every((v) => v.make === 'Toyota')).toBe(true);
      });

      it('should filter by make - Honda', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          make: 'Honda',
        });
        expect(result).toHaveLength(1);
        expect(result[0].make).toBe('Honda');
      });

      it('should return all vehicles when make is "all"', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          make: 'all',
        });
        expect(result).toHaveLength(3);
      });
    });

    describe('Model filter', () => {
      it('should filter by model - RAV4', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          model: 'RAV4',
        });
        expect(result).toHaveLength(1);
        expect(result[0].model).toBe('RAV4');
      });

      it('should filter by model - Camry', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          model: 'Camry',
        });
        expect(result).toHaveLength(1);
        expect(result[0].model).toBe('Camry');
      });

      it('should return all vehicles when model is "all"', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          model: 'all',
        });
        expect(result).toHaveLength(3);
      });
    });

    describe('Year filter', () => {
      it('should filter by yearMin', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          yearMin: 2020,
        });
        expect(result).toHaveLength(2);
        expect(result.every((v) => v.year >= 2020)).toBe(true);
      });

      it('should filter by yearMax', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          yearMax: 2019,
        });
        expect(result).toHaveLength(1);
        expect(result[0].year).toBe(2018);
      });

      it('should filter by year range', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          yearMin: 2019,
          yearMax: 2021,
        });
        expect(result).toHaveLength(2);
        expect(result.every((v) => v.year >= 2019 && v.year <= 2021)).toBe(
          true
        );
      });
    });

    describe('Price filter', () => {
      it('should filter by priceMin', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          priceMin: 20000,
        });
        expect(result).toHaveLength(2);
        expect(result.every((v) => v.price >= 20000)).toBe(true);
      });

      it('should filter by priceMax', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          priceMax: 20000,
        });
        expect(result).toHaveLength(1);
        expect(result[0].price).toBe(18000);
      });

      it('should filter by price range', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          priceMin: 20000,
          priceMax: 24000,
        });
        expect(result).toHaveLength(1);
        expect(result[0].price).toBe(22000);
      });
    });

    describe('Mileage filter', () => {
      it('should filter by mileageMax', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          mileageMax: 40000,
        });
        expect(result).toHaveLength(1);
        expect(result[0].mileage).toBe(30000);
      });

      it('should include vehicles at exact mileageMax', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          mileageMax: 45000,
        });
        expect(result).toHaveLength(2);
      });
    });

    describe('Mileage rating filter', () => {
      it('should filter by mileage rating - excellent', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          mileageRating: 'excellent',
        });
        expect(result).toHaveLength(1);
        expect(result[0].mileage_rating).toBe('excellent');
      });

      it('should filter by mileage rating - good', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          mileageRating: 'good',
        });
        expect(result).toHaveLength(1);
        expect(result[0].mileage_rating).toBe('good');
      });

      it('should return all when mileage rating is "all"', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          mileageRating: 'all',
        });
        expect(result).toHaveLength(3);
      });
    });

    describe('Quality tier filter', () => {
      it('should filter top picks (score >= 80)', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          qualityTier: 'top_pick',
        });
        expect(result).toHaveLength(1);
        expect(result[0].priority_score).toBeGreaterThanOrEqual(80);
      });

      it('should filter good buys (score 65-79)', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          qualityTier: 'good_buy',
        });
        expect(result).toHaveLength(1);
        expect(result[0].priority_score).toBeGreaterThanOrEqual(65);
        expect(result[0].priority_score).toBeLessThan(80);
      });

      it('should filter caution tier (score < 65)', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          qualityTier: 'caution',
        });
        expect(result).toHaveLength(1);
        expect(result[0].priority_score).toBeLessThan(65);
      });

      it('should return all when quality tier is "all"', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          qualityTier: 'all',
        });
        expect(result).toHaveLength(3);
      });
    });

    describe('Search filter', () => {
      it('should search by VIN', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          search: '5YFBURHE5HP690324',
        });
        expect(result).toHaveLength(1);
        expect(result[0].vin).toBe('5YFBURHE5HP690324');
      });

      it('should search by partial VIN (case insensitive)', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          search: '5yfb',
        });
        expect(result).toHaveLength(1);
      });

      it('should search by make', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          search: 'toyota',
        });
        expect(result).toHaveLength(2);
      });

      it('should search by model', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          search: 'rav4',
        });
        expect(result).toHaveLength(1);
      });

      it('should search by year', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          search: '2021',
        });
        expect(result).toHaveLength(1);
        expect(result[0].year).toBe(2021);
      });

      it('should return empty array for no matches', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          search: 'nonexistent',
        });
        expect(result).toHaveLength(0);
      });

      it('should trim search input', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          search: '  RAV4  ',
        });
        expect(result).toHaveLength(1);
      });
    });

    describe('Combined filters', () => {
      it('should apply make and model filters together', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          make: 'Toyota',
          model: 'RAV4',
        });
        expect(result).toHaveLength(1);
        expect(result[0].make).toBe('Toyota');
        expect(result[0].model).toBe('RAV4');
      });

      it('should apply price and mileage filters together', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          priceMin: 20000,
          mileageMax: 50000,
        });
        expect(result).toHaveLength(2);
      });

      it('should apply all filters together', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          make: 'Toyota',
          yearMin: 2020,
          priceMax: 30000,
          qualityTier: 'top_pick',
        });
        expect(result).toHaveLength(1);
        expect(result[0].vin).toBe('5YFBURHE5HP690324');
      });

      it('should return empty array when no vehicles match all filters', () => {
        const result = FilterService.applyFilters(mockVehicles, {
          make: 'Honda',
          model: 'RAV4', // Honda doesn't make RAV4
        });
        expect(result).toHaveLength(0);
      });
    });
  });

  describe('getUniqueValues', () => {
    it('should extract unique makes', () => {
      const result = FilterService.getUniqueValues(mockVehicles);
      expect(result.makes).toEqual(['Honda', 'Toyota']);
    });

    it('should extract unique models', () => {
      const result = FilterService.getUniqueValues(mockVehicles);
      expect(result.models).toEqual(['CR-V', 'Camry', 'RAV4']);
    });

    it('should extract unique years in descending order', () => {
      const result = FilterService.getUniqueValues(mockVehicles);
      expect(result.years).toEqual([2021, 2020, 2018]);
    });

    it('should handle empty vehicle array', () => {
      const result = FilterService.getUniqueValues([]);
      expect(result.makes).toEqual([]);
      expect(result.models).toEqual([]);
      expect(result.years).toEqual([]);
    });

    it('should handle single vehicle', () => {
      const result = FilterService.getUniqueValues([mockVehicles[0]]);
      expect(result.makes).toEqual(['Toyota']);
      expect(result.models).toEqual(['RAV4']);
      expect(result.years).toEqual([2021]);
    });
  });

  describe('getActiveFilterCount', () => {
    it('should return 0 for no filters', () => {
      const count = FilterService.getActiveFilterCount({});
      expect(count).toBe(0);
    });

    it('should count make filter', () => {
      const count = FilterService.getActiveFilterCount({ make: 'Toyota' });
      expect(count).toBe(1);
    });

    it('should not count "all" values', () => {
      const count = FilterService.getActiveFilterCount({
        make: 'all',
        model: 'all',
        mileageRating: 'all',
        qualityTier: 'all',
      });
      expect(count).toBe(0);
    });

    it('should count multiple filters', () => {
      const count = FilterService.getActiveFilterCount({
        make: 'Toyota',
        yearMin: 2020,
        priceMax: 30000,
      });
      expect(count).toBe(3);
    });

    it('should count all possible filters', () => {
      const count = FilterService.getActiveFilterCount({
        make: 'Toyota',
        model: 'RAV4',
        yearMin: 2020,
        yearMax: 2024,
        priceMin: 10000,
        priceMax: 30000,
        mileageMax: 50000,
        mileageRating: 'excellent',
        qualityTier: 'top_pick',
        search: 'test',
      });
      expect(count).toBe(10);
    });

    it('should not count undefined filters', () => {
      const count = FilterService.getActiveFilterCount({
        make: 'Toyota',
        yearMin: undefined,
        priceMax: undefined,
      });
      expect(count).toBe(1);
    });

    it('should count search filter', () => {
      const count = FilterService.getActiveFilterCount({
        search: 'RAV4',
      });
      expect(count).toBe(1);
    });

    it('should not count empty search', () => {
      const count = FilterService.getActiveFilterCount({
        search: '',
      });
      expect(count).toBe(0);
    });

    it('should not count whitespace-only search', () => {
      const count = FilterService.getActiveFilterCount({
        search: '   ',
      });
      expect(count).toBe(0);
    });
  });
});
