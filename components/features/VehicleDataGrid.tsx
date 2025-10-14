'use client';

/**
 * VehicleDataGrid - Smart table component with built-in sorting and selection
 *
 * This is a self-contained table component that merges:
 * - VehicleTableView
 * - TableHeader/TableRow components
 * - Sorting logic
 * - Selection logic
 *
 * Benefits:
 * - Single component instead of 3+ separate ones
 * - No props drilling
 * - Easy to swap with grid/list views
 * - Handles its own interactions
 *
 * Props:
 * - vehicles: Array of vehicles to display
 * - onRowClick: Optional handler for row clicks
 * - sort/onSort: Sorting state and handler
 * - selection props: Optional for multi-select mode
 */

import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductImage } from '@/components/ProductImage';
import { QualityTierBadge } from '@/components/QualityTierBadge';
import { TableHeader, TableHeaderCell } from '@/components/TableHeader';
import { TableRow, TableCell } from '@/components/TableRow';
import { SortableColumnHeader } from '@/components/SortableColumnHeader';
import type { Vehicle } from '@/lib/types';
import type { SortField, SortOrder } from '@/lib/services/sort-service';
import { formatPrice, formatMileage } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export interface VehicleDataGridProps {
  // Data
  vehicles: Vehicle[];

  // Sorting
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;

  // Selection (optional - enables multi-select mode)
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onToggleSelect?: (vehicle: Vehicle) => void;
  onToggleSelectAll?: () => void;
  allSelected?: boolean;

  // Row interaction
  onRowClick?: (vehicle: Vehicle) => void;

  // Styling
  className?: string;
}

export function VehicleDataGrid({
  vehicles,
  sortField,
  sortOrder,
  onSort,
  selectable = false,
  selectedKeys,
  onToggleSelect,
  onToggleSelectAll,
  allSelected = false,
  onRowClick,
  className,
}: VehicleDataGridProps) {
  const router = useRouter();

  // Default row click handler - navigate to vehicle detail
  const handleRowClick = (vehicle: Vehicle) => {
    if (onRowClick) {
      onRowClick(vehicle);
    } else {
      router.push(`/dashboard/${vehicle.vin}`);
    }
  };

  return (
    <div className={cn('overflow-x-auto bg-white rounded-lg shadow', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          <tr>
            {/* Checkbox column - only if selectable */}
            {selectable && (
              <TableHeaderCell className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Select all vehicles"
                />
              </TableHeaderCell>
            )}

            {/* Image column */}
            <TableHeaderCell className="w-20">Image</TableHeaderCell>

            {/* Sortable columns */}
            <SortableColumnHeader
              field="make"
              currentSortField={sortField}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              Make & Model
            </SortableColumnHeader>

            <SortableColumnHeader
              field="year"
              currentSortField={sortField}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              Year
            </SortableColumnHeader>

            <SortableColumnHeader
              field="price"
              currentSortField={sortField}
              currentSortOrder={sortOrder}
              onSort={onSort}
              align="right"
            >
              Price
            </SortableColumnHeader>

            <SortableColumnHeader
              field="mileage"
              currentSortField={sortField}
              currentSortOrder={sortOrder}
              onSort={onSort}
              align="right"
            >
              Mileage
            </SortableColumnHeader>

            <TableHeaderCell>Location</TableHeaderCell>

            <SortableColumnHeader
              field="quality_tier"
              currentSortField={sortField}
              currentSortOrder={sortOrder}
              onSort={onSort}
              align="center"
            >
              Quality Tier
            </SortableColumnHeader>
          </tr>
        </TableHeader>

        <tbody className="divide-y divide-gray-200">
          {vehicles.map((vehicle) => {
            const isSelected = selectable && selectedKeys && selectedKeys.has(vehicle.id);

            return (
              <TableRow
                key={vehicle.id}
                selected={isSelected}
                onClick={() => handleRowClick(vehicle)}
              >
                {/* Checkbox - only if selectable */}
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect?.(vehicle)}
                      aria-label={`Select ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    />
                  </TableCell>
                )}

                {/* Vehicle Image */}
                <TableCell>
                  <ProductImage vehicle={vehicle} size="md" />
                </TableCell>

                {/* Make & Model */}
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </div>
                  {vehicle.ai_summary && (
                    <div className="text-xs text-gray-600 mt-1 max-w-[300px]">
                      {vehicle.ai_summary}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                    VIN: {vehicle.vin}
                  </div>
                </TableCell>

                {/* Year */}
                <TableCell>{vehicle.year}</TableCell>

                {/* Price */}
                <TableCell align="right" className="font-medium">
                  {formatPrice(vehicle.price)}
                </TableCell>

                {/* Mileage */}
                <TableCell align="right">
                  <div>{formatMileage(vehicle.mileage)}</div>
                  {vehicle.mileage_rating && (
                    <div className="text-xs text-gray-500 capitalize">
                      {vehicle.mileage_rating}
                    </div>
                  )}
                </TableCell>

                {/* Location */}
                <TableCell>
                  <div className="text-sm">{vehicle.current_location}</div>
                  <div className="text-xs text-gray-500">
                    {vehicle.distance_miles} mi away
                  </div>
                </TableCell>

                {/* Quality Tier */}
                <TableCell align="center">
                  <QualityTierBadge score={vehicle.priority_score} showLabel={true} size="md" />
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
