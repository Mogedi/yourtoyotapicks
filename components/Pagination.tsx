'use client';

// Pagination - Reusable pagination component with page numbers
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaginationService } from '@/lib/services/pagination-service';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const pageNumbers = PaginationService.getPageNumbers(currentPage, totalPages);
  const pageSizeOptions = PaginationService.getPageSizeOptions();

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white',
        className
      )}
    >
      {/* Results info */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </p>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) =>
            pageNum === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-10"
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
