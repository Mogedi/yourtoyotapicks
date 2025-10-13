'use client';

// SortableColumnHeader - Column header with sort indicators
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { TableHeaderCell } from '@/components/TableHeader';
import type { SortField, SortOrder } from '@/lib/services/sort-service';
import { cn } from '@/lib/utils';

interface SortableColumnHeaderProps {
  field: SortField;
  currentSortField: SortField;
  currentSortOrder: SortOrder;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SortableColumnHeader({
  field,
  currentSortField,
  currentSortOrder,
  onSort,
  children,
  align = 'left',
  className,
}: SortableColumnHeaderProps) {
  const isActive = currentSortField === field;

  return (
    <TableHeaderCell align={align} className={className}>
      <button
        onClick={() => onSort(field)}
        className={cn(
          'flex items-center gap-2 hover:text-gray-900 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
          isActive && 'text-gray-900 font-semibold'
        )}
      >
        {children}
        <span className="flex items-center">
          {isActive ? (
            currentSortOrder === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )
          ) : (
            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
          )}
        </span>
      </button>
    </TableHeaderCell>
  );
}
