// PaginationService - Handles pagination logic
import type { Vehicle, ListingSummary } from '@/lib/types';
import { PAGINATION } from '@/lib/constants';

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
  };
}

export class PaginationService {
  /**
   * Paginate an array of items
   */
  static paginate<T>(
    items: T[],
    options: PaginationOptions
  ): PaginationResult<T> {
    const { page, pageSize } = options;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Ensure page is within bounds
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const data = items.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startIndex,
        endIndex,
      },
    };
  }

  /**
   * Get page size options for dropdown
   */
  static getPageSizeOptions(): number[] {
    return PAGINATION.PAGE_SIZE_OPTIONS;
  }

  /**
   * Calculate page numbers to display (for pagination controls)
   */
  static getPageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = PAGINATION.MAX_VISIBLE_PAGES
  ): (number | 'ellipsis')[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let startPage = Math.max(2, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

    // Adjust if near start
    if (currentPage <= halfVisible + 1) {
      endPage = Math.min(totalPages - 1, maxVisible - 1);
    }

    // Adjust if near end
    if (currentPage >= totalPages - halfVisible) {
      startPage = Math.max(2, totalPages - maxVisible + 2);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('ellipsis');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  /**
   * Get default pagination options
   */
  static getDefaultOptions(): PaginationOptions {
    return {
      page: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    };
  }
}
