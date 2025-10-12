'use client';

import { Car } from 'lucide-react';
import { VehicleCard } from '@/components/VehicleCard';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import type { ListingSummary } from '@/lib/types';

interface VehicleListProps {
  vehicles: ListingSummary[];
  loading?: boolean;
}

/**
 * VehicleSkeleton - Loading state for vehicle cards
 */
function VehicleSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * VehicleList Component
 *
 * Displays a responsive grid of vehicle cards with loading and empty states
 *
 * @param vehicles - Array of vehicle listings to display
 * @param loading - Loading state to show skeletons
 */
export function VehicleList({ vehicles, loading = false }: VehicleListProps) {
  // Loading state - show skeleton cards
  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <VehicleSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no vehicles match filters
  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="No vehicles found"
        description="No vehicles match your current filters. Try adjusting your search criteria or clearing filters to see more results."
      />
    );
  }

  // Display vehicles in responsive grid
  return (
    <div>
      {/* Result count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}
      </div>

      {/* Vehicle grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id || vehicle.vin} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
