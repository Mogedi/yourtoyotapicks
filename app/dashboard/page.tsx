'use client';

// Dashboard V2 - Table View Page
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCards } from '@/components/StatCards';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { VehicleTableView } from '@/components/VehicleTableView';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { BulkActionBar } from '@/components/BulkActionBar';
import { useVehicles } from '@/hooks/useVehicles';
import { useVehicleFilters } from '@/hooks/useVehicleFilters';
import { useVehicleSort } from '@/hooks/useVehicleSort';
import { usePagination } from '@/hooks/usePagination';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { FilterService } from '@/lib/services/filter-service';

export default function TableViewPage() {
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useVehicleFilters();
  const { sort, toggleSort } = useVehicleSort();
  const { page, pageSize, goToPage, setPageSize } = usePagination();

  // Build query options
  const queryOptions = useMemo(
    () => ({
      // Filters
      make: filters.make !== 'all' ? filters.make : undefined,
      model: filters.model !== 'all' ? filters.model : undefined,
      yearMin: filters.yearMin ? parseInt(filters.yearMin) : undefined,
      yearMax: filters.yearMax ? parseInt(filters.yearMax) : undefined,
      priceMin: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
      priceMax: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
      mileageMax: filters.mileageMax ? parseInt(filters.mileageMax) : undefined,
      mileageRating: filters.mileageRating,
      reviewStatus: filters.reviewStatus,
      search: filters.search,
      // Sorting
      sortField: sort.field,
      sortOrder: sort.order,
      // Pagination
      page,
      pageSize,
    }),
    [filters, sort, page, pageSize]
  );

  // Fetch vehicles
  const { data, isLoading, error } = useVehicles(queryOptions);

  // Multi-select for bulk actions
  const {
    selectedItems,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    allSelected,
    selectedKeys,
  } = useMultiSelect(data?.data ?? [], (vehicle) => vehicle.id);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    if (!data?.data) return { makes: [], models: [], years: [] };
    return FilterService.getUniqueValues(data.data);
  }, [data?.data]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              {data?.pagination.totalItems ?? 0} vehicles found
              {hasActiveFilters && ` (${data?.filters.activeCount ?? 0} filters active)`}
            </p>
          </div>

          {/* View Toggle - Hidden for now */}
          {/* <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Card View
              </Button>
            </Link>
            <Button size="sm" variant="default">
              <LayoutList className="h-4 w-4 mr-2" />
              Table View
            </Button>
          </div> */}
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Filters */}
        <FilterSidebar
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          makes={filterOptions.makes}
          models={filterOptions.models}
          years={filterOptions.years}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stat Cards */}
            <StatCards vehicles={data?.data ?? []} className="mb-6" />

            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                value={filters.search}
                onChange={(value) => updateFilter('search', value)}
              />
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-gray-600">Loading vehicles...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && data && data.data.length === 0 && (
              <EmptyState
                message="No vehicles found"
                description="Try adjusting your filters or search criteria to see more results."
                onClearFilters={hasActiveFilters ? clearFilters : undefined}
                showClearButton={hasActiveFilters}
              />
            )}

            {/* Table View */}
            {!isLoading && !error && data && data.data.length > 0 && (
              <>
                <VehicleTableView
                  vehicles={data.data}
                  sortField={sort.field}
                  sortOrder={sort.order}
                  onSort={toggleSort}
                  selectedVehicles={selectedKeys}
                  onToggleSelect={toggleItem}
                  onToggleSelectAll={toggleAll}
                  allSelected={allSelected}
                  className="mb-6"
                />

                {/* Pagination */}
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  pageSize={data.pagination.pageSize}
                  totalItems={data.pagination.totalItems}
                  onPageChange={goToPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </motion.div>
        </main>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedVehicles={selectedItems}
        onClearSelection={clearSelection}
        onMarkReviewed={() => {
          // TODO: Implement mark as reviewed
          console.log('Mark as reviewed:', selectedItems);
          clearSelection();
        }}
        onExport={() => {
          // TODO: Implement export
          console.log('Export:', selectedItems);
        }}
        onDelete={() => {
          // TODO: Implement delete
          console.log('Delete:', selectedItems);
          clearSelection();
        }}
      />
    </div>
  );
}
