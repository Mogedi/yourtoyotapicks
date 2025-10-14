'use client';

/**
 * DashboardLayout - Smart wrapper that provides all dashboard data
 *
 * This component handles all data fetching, state management, and provides
 * data to its children via render props. This eliminates the need for
 * pages to manage complex state themselves.
 *
 * Usage:
 * ```tsx
 * <DashboardLayout>
 *   {({ vehicles, stats, isLoading }) => (
 *     <>
 *       <DashboardHeader stats={stats} />
 *       {isLoading ? <Loading /> : <VehicleGrid vehicles={vehicles} />}
 *     </>
 *   )}
 * </DashboardLayout>
 * ```
 */

import { ReactNode } from 'react';
import { useVehicleDashboard, type UseVehicleDashboardReturn } from '@/hooks/useVehicleDashboard';

export interface DashboardLayoutProps {
  children: (data: UseVehicleDashboardReturn) => ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const dashboardData = useVehicleDashboard();

  return <>{children(dashboardData)}</>;
}
