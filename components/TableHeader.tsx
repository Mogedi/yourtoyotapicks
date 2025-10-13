// TableHeader - Reusable table header component
import { cn } from '@/lib/utils';

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn('bg-gray-50 border-b border-gray-200', className)}>
      {children}
    </thead>
  );
}

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableHeaderCell({
  children,
  className,
  align = 'left',
}: TableHeaderCellProps) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </th>
  );
}
