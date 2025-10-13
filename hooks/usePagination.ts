'use client';

// usePagination - Manage pagination state
import { useState, useCallback } from 'react';

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
}

const DEFAULT_PAGE_SIZE = 25;

export function usePagination(
  initialPageSize: number = DEFAULT_PAGE_SIZE
): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setPageSizeState(initialPageSize);
  }, [initialPageSize]);

  return {
    page,
    pageSize,
    goToPage,
    setPageSize,
    nextPage,
    prevPage,
    reset,
  };
}
