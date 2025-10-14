'use client';

// FilterSidebar - Collapsible sidebar with all filter controls
import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { FilterState } from '@/hooks/useVehicleFilters';
import { cn } from '@/lib/utils';
import { FilterService, type FilterOptions } from '@/lib/services/filter-service';
import { QUALITY_TIER, SEARCH_CRITERIA } from '@/lib/constants';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  onClearFilters: () => void;
  makes: string[];
  models: string[];
  years: number[];
  className?: string;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  makes,
  models,
  years,
  className,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    vehicle: true,
    price: true,
    mileage: true,
    quality: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Convert FilterState to FilterOptions for FilterService
  const filterOptions: FilterOptions = {
    make: filters.make !== 'all' ? filters.make : undefined,
    model: filters.model !== 'all' ? filters.model : undefined,
    yearMin: filters.yearMin !== '' ? parseInt(filters.yearMin) : undefined,
    yearMax: filters.yearMax !== '' ? parseInt(filters.yearMax) : undefined,
    priceMin: filters.priceMin !== '' ? parseFloat(filters.priceMin) : undefined,
    priceMax: filters.priceMax !== '' ? parseFloat(filters.priceMax) : undefined,
    mileageMax: filters.mileageMax !== '' ? parseInt(filters.mileageMax) : undefined,
    mileageRating: filters.mileageRating !== 'all' ? filters.mileageRating : undefined,
    qualityTier: filters.qualityTier !== 'all' ? filters.qualityTier : undefined,
  };

  // Use FilterService to check for active filters
  const hasActiveFilters = FilterService.getActiveFilterCount(filterOptions) > 0;

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-gray-200 overflow-y-auto',
        className
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Vehicle Section */}
        <FilterSection
          title="Vehicle"
          expanded={expandedSections.vehicle}
          onToggle={() => toggleSection('vehicle')}
        >
          <div className="space-y-4">
            {/* Make */}
            <div>
              <Label htmlFor="filter-make">Make</Label>
              <Select
                value={filters.make}
                onValueChange={(value) => onFilterChange('make', value)}
              >
                <SelectTrigger id="filter-make">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {makes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model */}
            <div>
              <Label htmlFor="filter-model">Model</Label>
              <Select
                value={filters.model}
                onValueChange={(value) => onFilterChange('model', value)}
              >
                <SelectTrigger id="filter-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="filter-year-min">Min Year</Label>
                <Input
                  id="filter-year-min"
                  type="number"
                  value={filters.yearMin}
                  onChange={(e) => onFilterChange('yearMin', e.target.value)}
                  placeholder="2015"
                />
              </div>
              <div>
                <Label htmlFor="filter-year-max">Max Year</Label>
                <Input
                  id="filter-year-max"
                  type="number"
                  value={filters.yearMax}
                  onChange={(e) => onFilterChange('yearMax', e.target.value)}
                  placeholder="2024"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        <Separator className="my-6" />

        {/* Price Section */}
        <FilterSection
          title="Price"
          expanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="filter-price-min">Min ($)</Label>
                <Input
                  id="filter-price-min"
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => onFilterChange('priceMin', e.target.value)}
                  placeholder={String(SEARCH_CRITERIA.PRICE.MIN)}
                />
              </div>
              <div>
                <Label htmlFor="filter-price-max">Max ($)</Label>
                <Input
                  id="filter-price-max"
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => onFilterChange('priceMax', e.target.value)}
                  placeholder={String(SEARCH_CRITERIA.PRICE.MAX)}
                />
              </div>
            </div>
          </div>
        </FilterSection>

        <Separator className="my-6" />

        {/* Mileage Section */}
        <FilterSection
          title="Mileage"
          expanded={expandedSections.mileage}
          onToggle={() => toggleSection('mileage')}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-mileage-max">Max Mileage</Label>
              <Input
                id="filter-mileage-max"
                type="number"
                value={filters.mileageMax}
                onChange={(e) => onFilterChange('mileageMax', e.target.value)}
                placeholder={String(SEARCH_CRITERIA.MILEAGE.MAX)}
              />
            </div>

            <div>
              <Label htmlFor="filter-mileage-rating">Mileage Rating</Label>
              <Select
                value={filters.mileageRating}
                onValueChange={(value: any) =>
                  onFilterChange('mileageRating', value)
                }
              >
                <SelectTrigger id="filter-mileage-rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterSection>

        <Separator className="my-6" />

        {/* Quality Tier Section */}
        <FilterSection
          title="Quality Tier"
          expanded={expandedSections.quality}
          onToggle={() => toggleSection('quality')}
        >
          <div>
            <Label htmlFor="filter-quality-tier">Tier</Label>
            <Select
              value={filters.qualityTier}
              onValueChange={(value: any) =>
                onFilterChange('qualityTier', value)
              }
            >
              <SelectTrigger id="filter-quality-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="top_pick">
                  🟩 {QUALITY_TIER.TOP_PICK.LABEL} ({QUALITY_TIER.TOP_PICK.MIN_SCORE}+)
                </SelectItem>
                <SelectItem value="good_buy">
                  🟨 {QUALITY_TIER.GOOD_BUY.LABEL} ({QUALITY_TIER.GOOD_BUY.MIN_SCORE}-{QUALITY_TIER.GOOD_BUY.MAX_SCORE})
                </SelectItem>
                <SelectItem value="caution">
                  ⚪ {QUALITY_TIER.CAUTION.LABEL} (&lt;{QUALITY_TIER.GOOD_BUY.MIN_SCORE})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

// Helper component for collapsible sections
interface FilterSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-medium mb-3 hover:text-primary transition-colors"
      >
        {title}
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expanded && children}
    </div>
  );
}
