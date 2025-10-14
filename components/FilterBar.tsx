'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MileageRating } from '@/lib/types';
import { FilterService, type FilterOptions } from '@/lib/services/filter-service';

export interface FilterState {
  make: string;
  model: string;
  priceMin: string;
  priceMax: string;
  mileageRating: string;
  reviewStatus: string;
  sortBy: string;
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
}: FilterBarProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  // Convert FilterState to FilterOptions for FilterService
  const filterOptions: FilterOptions = {
    make: filters.make !== 'all' ? filters.make : undefined,
    model: filters.model !== 'all' ? filters.model : undefined,
    priceMin: filters.priceMin !== '' ? Number(filters.priceMin) : undefined,
    priceMax: filters.priceMax !== '' ? Number(filters.priceMax) : undefined,
    mileageRating: filters.mileageRating !== 'all' ? (filters.mileageRating as MileageRating) : undefined,
    search: filters.search !== '' ? filters.search : undefined,
  };

  // Use FilterService to count active filters
  const activeFilterCount = FilterService.getActiveFilterCount(filterOptions);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by VIN or keyword..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 flex-1">
          {/* Make */}
          <Select
            value={filters.make}
            onValueChange={(value) => updateFilter('make', value)}
          >
            <SelectTrigger data-testid="filter-make">
              <SelectValue placeholder="Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              <SelectItem value="Toyota">Toyota</SelectItem>
              <SelectItem value="Honda">Honda</SelectItem>
            </SelectContent>
          </Select>

          {/* Model */}
          <Select
            value={filters.model}
            onValueChange={(value) => updateFilter('model', value)}
          >
            <SelectTrigger data-testid="filter-model">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="RAV4">RAV4</SelectItem>
              <SelectItem value="CR-V">CR-V</SelectItem>
              <SelectItem value="C-HR">C-HR</SelectItem>
              <SelectItem value="HR-V">HR-V</SelectItem>
              <SelectItem value="Highlander">Highlander</SelectItem>
              <SelectItem value="4Runner">4Runner</SelectItem>
              <SelectItem value="Venza">Venza</SelectItem>
              <SelectItem value="Pilot">Pilot</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Min */}
          <Input
            type="number"
            placeholder="Min Price"
            value={filters.priceMin}
            onChange={(e) => updateFilter('priceMin', e.target.value)}
            min="0"
            step="1000"
          />

          {/* Price Max */}
          <Input
            type="number"
            placeholder="Max Price"
            value={filters.priceMax}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
            min="0"
            step="1000"
          />

          {/* Mileage Rating */}
          <Select
            value={filters.mileageRating}
            onValueChange={(value) => updateFilter('mileageRating', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mileage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mileage</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="acceptable">Acceptable</SelectItem>
            </SelectContent>
          </Select>

          {/* Review Status */}
          <Select
            value={filters.reviewStatus}
            onValueChange={(value) => updateFilter('reviewStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Review Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="not-reviewed">Not Reviewed</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority Score</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="mileage-asc">Mileage: Low to High</SelectItem>
              <SelectItem value="mileage-desc">Mileage: High to Low</SelectItem>
              <SelectItem value="date">Date Added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="shrink-0"
            data-testid="clear-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
