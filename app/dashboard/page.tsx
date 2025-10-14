'use client';

/**
 * Dashboard - Main vehicle listing page
 *
 * Uses the new simplified architecture:
 * - DashboardLayout: Provides all data via render props
 * - VehicleDataGrid: Smart table component with sorting/selection
 * - Feature components: Self-contained, easy to swap
 *
 * Compare to the old version (226 lines):
 * - No manual hook setup (30+ lines eliminated)
 * - No manual stats calculation
 * - No props drilling
 * - Easy to swap table for grid/kanban views
 */

import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/features/DashboardLayout';
import { DashboardHeader } from '@/components/features/DashboardHeader';
import { VehicleDataGrid } from '@/components/features/VehicleDataGrid';
import { StatCards } from '@/components/StatCards';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { BulkActionBar } from '@/components/BulkActionBar';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {({
        vehicles,
        allFilteredVehicles,
        stats,
        isLoading,
        error,
        filters,
        updateFilter,
        clearFilters,
        hasActiveFilters,
        filterOptions,
        sort,
        toggleSort,
        page,
        pageSize,
        totalPages,
        totalItems,
        goToPage,
        setPageSize,
        selectedVehicles,
        selectedKeys,
        toggleSelect,
        toggleSelectAll,
        clearSelection,
        allSelected,
      }) => (
        <div className="min-h-screen bg-gray-50">
          {/* Top Header */}
          <DashboardHeader stats={stats} className="bg-white border-b border-gray-200 px-6 py-4" />

          <div className="flex">
            {/* Filters Sidebar */}
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
                <StatCards vehicles={allFilteredVehicles} className="mb-6" />

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
                {!isLoading && !error && vehicles.length === 0 && (
                  <EmptyState
                    message="No vehicles found"
                    description="Try adjusting your filters or search criteria to see more results."
                    onClearFilters={hasActiveFilters ? clearFilters : undefined}
                    showClearButton={hasActiveFilters}
                  />
                )}

                {/* Vehicle Data Grid - NEW SIMPLIFIED COMPONENT */}
                {!isLoading && !error && vehicles.length > 0 && (
                  <>
                    <VehicleDataGrid
                      vehicles={vehicles}
                      sortField={sort.field}
                      sortOrder={sort.order}
                      onSort={toggleSort}
                      selectable={true}
                      selectedKeys={selectedKeys}
                      onToggleSelect={toggleSelect}
                      onToggleSelectAll={toggleSelectAll}
                      allSelected={allSelected}
                      className="mb-6"
                    />

                    {/* Pagination */}
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={totalItems}
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
            selectedVehicles={selectedVehicles}
            onClearSelection={clearSelection}
            onExport={() => {
              console.log('Export:', selectedVehicles);
            }}
            onDelete={() => {
              console.log('Delete:', selectedVehicles);
              clearSelection();
            }}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
