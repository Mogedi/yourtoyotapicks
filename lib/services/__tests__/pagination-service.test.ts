import { PaginationService } from '../pagination-service';

describe('PaginationService', () => {
  // Create mock data for testing
  const createMockData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    }));
  };

  describe('paginate', () => {
    describe('Basic pagination', () => {
      it('should paginate array correctly - page 1', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 1,
          pageSize: 25,
        });

        expect(result.data).toHaveLength(25);
        expect(result.data[0].id).toBe(1);
        expect(result.data[24].id).toBe(25);
      });

      it('should paginate array correctly - page 2', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 2,
          pageSize: 25,
        });

        expect(result.data).toHaveLength(25);
        expect(result.data[0].id).toBe(26);
        expect(result.data[24].id).toBe(50);
      });

      it('should paginate array correctly - last page', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 4,
          pageSize: 25,
        });

        expect(result.data).toHaveLength(25);
        expect(result.data[0].id).toBe(76);
        expect(result.data[24].id).toBe(100);
      });

      it('should handle partial last page', () => {
        const items = createMockData(47);
        const result = PaginationService.paginate(items, {
          page: 2,
          pageSize: 25,
        });

        expect(result.data).toHaveLength(22);
        expect(result.data[0].id).toBe(26);
        expect(result.data[21].id).toBe(47);
      });
    });

    describe('Pagination metadata', () => {
      it('should calculate pagination metadata correctly', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 2,
          pageSize: 25,
        });

        expect(result.pagination.currentPage).toBe(2);
        expect(result.pagination.pageSize).toBe(25);
        expect(result.pagination.totalItems).toBe(100);
        expect(result.pagination.totalPages).toBe(4);
        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPreviousPage).toBe(true);
        expect(result.pagination.startIndex).toBe(25);
        expect(result.pagination.endIndex).toBe(50);
      });

      it('should set hasNextPage to false on last page', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 4,
          pageSize: 25,
        });

        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPreviousPage).toBe(true);
      });

      it('should set hasPreviousPage to false on first page', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 1,
          pageSize: 25,
        });

        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPreviousPage).toBe(false);
      });

      it('should set both flags to false when only one page', () => {
        const items = createMockData(10);
        const result = PaginationService.paginate(items, {
          page: 1,
          pageSize: 25,
        });

        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPreviousPage).toBe(false);
        expect(result.pagination.totalPages).toBe(1);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty array', () => {
        const result = PaginationService.paginate([], {
          page: 1,
          pageSize: 25,
        });

        expect(result.data).toEqual([]);
        expect(result.pagination.totalItems).toBe(0);
        expect(result.pagination.totalPages).toBe(0);
        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPreviousPage).toBe(false);
      });

      it('should handle page number beyond total pages (clamp to last page)', () => {
        const items = createMockData(50);
        const result = PaginationService.paginate(items, {
          page: 100,
          pageSize: 25,
        });

        expect(result.pagination.currentPage).toBe(2); // Clamped to last page
        expect(result.data).toHaveLength(25);
        expect(result.data[0].id).toBe(26);
      });

      it('should handle page number less than 1 (clamp to page 1)', () => {
        const items = createMockData(50);
        const result = PaginationService.paginate(items, {
          page: 0,
          pageSize: 25,
        });

        expect(result.pagination.currentPage).toBe(1); // Clamped to page 1
        expect(result.data).toHaveLength(25);
        expect(result.data[0].id).toBe(1);
      });

      it('should handle negative page number', () => {
        const items = createMockData(50);
        const result = PaginationService.paginate(items, {
          page: -5,
          pageSize: 25,
        });

        expect(result.pagination.currentPage).toBe(1);
        expect(result.data[0].id).toBe(1);
      });

      it('should handle single item', () => {
        const items = createMockData(1);
        const result = PaginationService.paginate(items, {
          page: 1,
          pageSize: 25,
        });

        expect(result.data).toHaveLength(1);
        expect(result.pagination.totalPages).toBe(1);
      });

      it('should handle page size larger than total items', () => {
        const items = createMockData(10);
        const result = PaginationService.paginate(items, {
          page: 1,
          pageSize: 100,
        });

        expect(result.data).toHaveLength(10);
        expect(result.pagination.totalPages).toBe(1);
      });

      it('should handle page size of 1', () => {
        const items = createMockData(10);
        const result = PaginationService.paginate(items, {
          page: 5,
          pageSize: 1,
        });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe(5);
        expect(result.pagination.totalPages).toBe(10);
      });
    });

    describe('Different page sizes', () => {
      it('should handle pageSize = 10', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 3,
          pageSize: 10,
        });

        expect(result.data).toHaveLength(10);
        expect(result.data[0].id).toBe(21);
        expect(result.pagination.totalPages).toBe(10);
      });

      it('should handle pageSize = 50', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 1,
          pageSize: 50,
        });

        expect(result.data).toHaveLength(50);
        expect(result.pagination.totalPages).toBe(2);
      });

      it('should handle pageSize = 100', () => {
        const items = createMockData(100);
        const result = PaginationService.paginate(items, {
          page: 1,
          pageSize: 100,
        });

        expect(result.data).toHaveLength(100);
        expect(result.pagination.totalPages).toBe(1);
      });
    });
  });

  describe('getPageSizeOptions', () => {
    it('should return standard page size options', () => {
      const options = PaginationService.getPageSizeOptions();
      expect(options).toEqual([10, 25, 50, 100]);
    });
  });

  describe('getPageNumbers', () => {
    describe('Small total pages (less than maxVisible)', () => {
      it('should return all pages when totalPages <= maxVisible', () => {
        const result = PaginationService.getPageNumbers(1, 5, 5);
        expect(result).toEqual([1, 2, 3, 4, 5]);
      });

      it('should return all pages when totalPages < maxVisible', () => {
        const result = PaginationService.getPageNumbers(1, 3, 5);
        expect(result).toEqual([1, 2, 3]);
      });
    });

    describe('Large total pages with ellipsis', () => {
      it('should show ellipsis when on first page', () => {
        const result = PaginationService.getPageNumbers(1, 10, 5);
        // [1, 2, 3, 4, ..., 10]
        expect(result).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
      });

      it('should show ellipsis when on last page', () => {
        const result = PaginationService.getPageNumbers(10, 10, 5);
        // [1, ..., 7, 8, 9, 10]
        expect(result).toEqual([1, 'ellipsis', 7, 8, 9, 10]);
      });

      it('should show ellipsis on both sides when in middle', () => {
        const result = PaginationService.getPageNumbers(5, 10, 5);
        // Actual result: [1, ..., 3, 4, 5, 6, 7, ..., 10]
        expect(result).toEqual([
          1,
          'ellipsis',
          3,
          4,
          5,
          6,
          7,
          'ellipsis',
          10,
        ]);
      });
    });

    describe('Edge cases', () => {
      it('should handle single page', () => {
        const result = PaginationService.getPageNumbers(1, 1, 5);
        expect(result).toEqual([1]);
      });

      it('should handle two pages', () => {
        const result = PaginationService.getPageNumbers(1, 2, 5);
        expect(result).toEqual([1, 2]);
      });

      it('should handle currentPage at start', () => {
        const result = PaginationService.getPageNumbers(1, 20, 5);
        expect(result).toContain(1);
        expect(result[result.length - 1]).toBe(20);
      });

      it('should handle currentPage at end', () => {
        const result = PaginationService.getPageNumbers(20, 20, 5);
        expect(result[0]).toBe(1);
        expect(result).toContain(20);
      });
    });

    describe('Custom maxVisible', () => {
      it('should respect custom maxVisible = 3', () => {
        const result = PaginationService.getPageNumbers(5, 10, 3);
        expect(result.filter((p) => typeof p === 'number')).toHaveLength(5); // 1, 4, 5, 6, 10
      });

      it('should respect custom maxVisible = 7', () => {
        const result = PaginationService.getPageNumbers(5, 20, 7);
        expect(result[0]).toBe(1);
        expect(result[result.length - 1]).toBe(20);
      });
    });

    describe('Boundary transitions', () => {
      it('should transition from start to middle correctly', () => {
        // Page 1: [1, 2, 3, 4, ..., 10]
        const page1 = PaginationService.getPageNumbers(1, 10, 5);
        expect(page1).toEqual([1, 2, 3, 4, 'ellipsis', 10]);

        // Page 3: [1, 2, 3, 4, 5, ..., 10]
        const page3 = PaginationService.getPageNumbers(3, 10, 5);
        expect(page3[0]).toBe(1);
        expect(page3[page3.length - 1]).toBe(10);
      });

      it('should transition from middle to end correctly', () => {
        // Page 8: [1, ..., 7, 8, 9, 10]
        const page8 = PaginationService.getPageNumbers(8, 10, 5);
        expect(page8).toEqual([1, 'ellipsis', 7, 8, 9, 10]);

        // Page 10: [1, ..., 7, 8, 9, 10]
        const page10 = PaginationService.getPageNumbers(10, 10, 5);
        expect(page10).toEqual([1, 'ellipsis', 7, 8, 9, 10]);
      });
    });
  });

  describe('getDefaultOptions', () => {
    it('should return default pagination options', () => {
      const options = PaginationService.getDefaultOptions();
      expect(options).toEqual({
        page: 1,
        pageSize: 25,
      });
    });
  });
});
