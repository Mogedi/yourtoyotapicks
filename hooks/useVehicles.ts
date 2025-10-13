'use client';

// useVehicles - Main hook for fetching vehicles with filters, sorting, and pagination
import { useState, useEffect, useCallback } from 'react';
import { queryVehicles } from '@/lib/api/vehicles/queries';
import type { VehicleQueryOptions, VehicleQueryResult } from '@/lib/types';

interface UseVehiclesOptions extends VehicleQueryOptions {
  enabled?: boolean; // Allow disabling automatic fetch
}

interface UseVehiclesReturn {
  data: VehicleQueryResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVehicles(options: UseVehiclesOptions = {}): UseVehiclesReturn {
  const [data, setData] = useState<VehicleQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { enabled = true, ...queryOptions } = options;

  const fetchVehicles = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await queryVehicles(queryOptions);
      setData(result);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, JSON.stringify(queryOptions)]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchVehicles,
  };
}
