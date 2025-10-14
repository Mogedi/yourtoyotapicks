'use client';

/**
 * DashboardHeader - Smart header component with quality tier statistics
 *
 * Self-contained header that displays vehicle counts broken down by quality tier.
 * Uses centralized constants for all labels and thresholds.
 *
 * Props:
 * - stats: Pre-calculated statistics from useVehicleDashboard
 * - showActiveFilters: Whether to display active filter count
 */

import { QUALITY_TIER } from '@/lib/constants';
import type { DashboardStats } from '@/hooks/useVehicleDashboard';

export interface DashboardHeaderProps {
  stats: DashboardStats;
  showActiveFilters?: boolean;
  className?: string;
}

export function DashboardHeader({
  stats,
  showActiveFilters = true,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={className}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Curated Picks</h1>
        <p className="text-xs text-gray-500 mt-1">
          Best matches first • Clear explanations • 5-second clarity
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {stats.totalVehicles} vehicle{stats.totalVehicles !== 1 ? 's' : ''}
          {' '}
          ({stats.topPicks} {QUALITY_TIER.TOP_PICK.LABEL}s, {stats.goodBuys}{' '}
          {QUALITY_TIER.GOOD_BUY.LABEL}s, {stats.caution} {QUALITY_TIER.CAUTION.LABEL})
          {showActiveFilters && stats.activeFilters > 0 && (
            <> • {stats.activeFilters} filter{stats.activeFilters !== 1 ? 's' : ''} active</>
          )}
        </p>
      </div>
    </header>
  );
}
