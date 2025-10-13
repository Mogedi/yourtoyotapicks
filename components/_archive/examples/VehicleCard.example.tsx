/**
 * VehicleCard Component - Example Usage
 *
 * This file demonstrates how to use the VehicleCard component
 * with various vehicle configurations and scenarios.
 */

import { VehicleCard } from "./VehicleCard";
import type { Vehicle, ListingSummary } from "@/lib/types";

// ============================================================================
// EXAMPLE 1: High Priority Vehicle with Excellent Mileage
// ============================================================================

const highPriorityVehicle: ListingSummary = {
  id: "1",
  vin: "4T1BF1FK9HU123456",
  make: "Toyota",
  model: "RAV4 XLE",
  year: 2018,
  price: 16500,
  mileage: 45000,
  mileage_rating: "excellent",
  overall_rating: "high",
  priority_score: 92,
  current_location: "Silver Spring, MD",
  distance_miles: 12,
  dealer_name: "AutoNation Toyota",
  images_url: [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
  ],
  source_url: "https://example.com/listing",
  created_at: "2025-01-15T10:00:00Z",
  owner_count: 1,
  flag_rust_concern: false,
  reviewed_by_user: false,
  user_rating: 5,
};

// ============================================================================
// EXAMPLE 2: Good Deal with Rust Belt Concern
// ============================================================================

const rustBeltVehicle: ListingSummary = {
  id: "2",
  vin: "1HGBH41JXMN123456",
  make: "Honda",
  model: "Civic LX",
  year: 2019,
  price: 14200,
  mileage: 62000,
  mileage_rating: "good",
  overall_rating: "medium",
  priority_score: 75,
  current_location: "Baltimore, MD",
  distance_miles: 28,
  dealer_name: "CarMax Baltimore",
  images_url: [
    "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
  ],
  source_url: "https://example.com/listing",
  created_at: "2025-01-14T15:30:00Z",
  owner_count: 2,
  flag_rust_concern: true,
  reviewed_by_user: true,
  user_rating: 3,
  user_notes: "Good price but concerned about rust. Need to inspect in person.",
};

// ============================================================================
// EXAMPLE 3: No Image Vehicle (Shows Placeholder)
// ============================================================================

const noImageVehicle: ListingSummary = {
  id: "3",
  vin: "5YFBURHE8HP123456",
  make: "Toyota",
  model: "Corolla LE",
  year: 2020,
  price: 15800,
  mileage: 38000,
  mileage_rating: "excellent",
  overall_rating: "high",
  priority_score: 88,
  current_location: "Rockville, MD",
  distance_miles: 8,
  dealer_name: undefined,
  images_url: [],
  source_url: "https://example.com/listing",
  created_at: "2025-01-16T09:15:00Z",
  owner_count: 1,
  flag_rust_concern: false,
  reviewed_by_user: false,
};

// ============================================================================
// EXAMPLE 4: Higher Mileage Vehicle (Acceptable Rating)
// ============================================================================

const acceptableMileageVehicle: ListingSummary = {
  id: "4",
  vin: "2T3BFREV1HW123456",
  make: "Toyota",
  model: "RAV4 Adventure",
  year: 2017,
  price: 18900,
  mileage: 95000,
  mileage_rating: "acceptable",
  overall_rating: "medium",
  priority_score: 68,
  current_location: "Bethesda, MD",
  distance_miles: 15,
  dealer_name: "Fitzgerald Auto Mall",
  images_url: [
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
  ],
  source_url: "https://example.com/listing",
  created_at: "2025-01-13T12:00:00Z",
  owner_count: 3,
  flag_rust_concern: false,
  reviewed_by_user: false,
};

// ============================================================================
// EXAMPLE USAGE IN A GRID LAYOUT
// ============================================================================

export function VehicleCardExamples() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">VehicleCard Examples</h1>

      {/* Grid Layout - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Example 1: High Priority */}
        <VehicleCard vehicle={highPriorityVehicle} />

        {/* Example 2: Rust Belt Concern */}
        <VehicleCard vehicle={rustBeltVehicle} />

        {/* Example 3: No Image */}
        <VehicleCard vehicle={noImageVehicle} />

        {/* Example 4: Acceptable Mileage */}
        <VehicleCard vehicle={acceptableMileageVehicle} />
      </div>

      {/* Single Card with Custom Styling */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Custom Styled Card</h2>
        <div className="max-w-sm">
          <VehicleCard
            vehicle={highPriorityVehicle}
            className="border-2 border-primary"
          />
        </div>
      </div>

      {/* List Layout */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">List Layout</h2>
        <div className="space-y-4 max-w-2xl">
          <VehicleCard vehicle={highPriorityVehicle} />
          <VehicleCard vehicle={rustBeltVehicle} />
          <VehicleCard vehicle={noImageVehicle} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE IN A DASHBOARD PAGE
// ============================================================================

export function DashboardExample() {
  // Example: Fetching vehicles from an API
  const vehicles: ListingSummary[] = [
    highPriorityVehicle,
    rustBeltVehicle,
    noImageVehicle,
    acceptableMileageVehicle,
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Vehicle Picks</h1>
        <p className="text-muted-foreground mt-2">
          Found {vehicles.length} matching vehicles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// USAGE WITH LOADING STATES
// ============================================================================

export function VehicleCardWithLoading({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-700" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return <VehicleCard vehicle={highPriorityVehicle} />;
}

export default VehicleCardExamples;
