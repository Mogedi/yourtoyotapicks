// TableRow - Reusable table row component with hover effects
import { cn } from '@/lib/utils';

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function TableRow({
  children,
  className,
  onClick,
  selected = false,
}: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-gray-200 transition-all duration-200',
        'hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5',
        'active:translate-y-0',
        onClick && 'cursor-pointer',
        selected && 'bg-blue-50 hover:bg-blue-100',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  onClick?: (e: React.MouseEvent) => void;
}

export function TableCell({
  children,
  className,
  align = 'left',
  onClick,
}: TableCellProps) {
  return (
    <td
      className={cn(
        'px-6 py-4 text-sm text-gray-900',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      onClick={onClick}
    >
      {children}
    </td>
  );
}
