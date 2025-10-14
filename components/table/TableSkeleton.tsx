// TableSkeleton - Loading skeleton for table with staggered animations
import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 10 }: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 animate-in fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Checkbox */}
            <Skeleton className="h-4 w-4 rounded" />

            {/* Image */}
            <Skeleton className="h-12 w-16 rounded" />

            {/* Make & Model */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>

            {/* Year */}
            <Skeleton className="h-4 w-12" />

            {/* Price */}
            <Skeleton className="h-4 w-20" />

            {/* Mileage */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>

            {/* Priority */}
            <Skeleton className="h-6 w-12 rounded-full" />

            {/* Rating */}
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
