/**
 * VehicleCard Quick Start Guide
 *
 * Copy and paste these examples to get started quickly!
 */

"use client";

import { VehicleCard } from "./VehicleCard";
import type { ListingSummary } from "@/lib/types";
import { useState, useEffect } from "react";

// ============================================================================
// QUICK START #1: Display a Single Vehicle
// ============================================================================

export function SingleVehicleExample() {
  const vehicle: ListingSummary = {
    id: "1",
    vin: "4T1BF1FK9HU123456",
    make: "Toyota",
    model: "RAV4 XLE",
    year: 2018,
    price: 16500,
    mileage: 45000,
    mileage_rating: "excellent",
    priority_score: 92,
    current_location: "Silver Spring, MD",
    distance_miles: 12,
    owner_count: 1,
    flag_rust_concern: false,
    images_url: ["https://example.com/image.jpg"],
    source_url: "https://example.com",
    created_at: new Date().toISOString(),
    reviewed_by_user: false,
  };

  return <VehicleCard vehicle={vehicle} />;
}

// ============================================================================
// QUICK START #2: Display Multiple Vehicles in a Grid
// ============================================================================

export function VehicleGridExample({ vehicles }: { vehicles: ListingSummary[] }) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Available Vehicles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// QUICK START #3: Dashboard Page with Vehicles
// ============================================================================

export function DashboardPage() {
  // In a real app, fetch this from your API
  const vehicles: ListingSummary[] = [
    /* your vehicles here */
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Toyota Picks</h1>
          <p className="text-muted-foreground mt-2">
            Found {vehicles.length} matching vehicles in your area
          </p>
        </div>

        {/* Vehicle Grid */}
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No vehicles found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// QUICK START #4: Featured Vehicles Section
// ============================================================================

export function FeaturedVehiclesSection({
  vehicles,
}: {
  vehicles: ListingSummary[];
}) {
  // Show only high priority vehicles
  const featuredVehicles = vehicles
    .filter((v) => v.priority_score >= 80)
    .slice(0, 4);

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">Featured Picks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              className="border-primary/20"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// QUICK START #5: Server Component with Data Fetching (Next.js)
// ============================================================================

// app/dashboard/page.tsx
export async function DashboardServerComponent() {
  // Fetch vehicles from your API or database
  const response = await fetch("https://api.example.com/vehicles", {
    cache: "no-store", // or 'force-cache' for static
  });
  const vehicles: ListingSummary[] = await response.json();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// QUICK START #6: With Loading State
// ============================================================================

export function VehicleListWithLoading() {
  const [vehicles, setVehicles] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const response = await fetch("/api/vehicles");
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card shadow animate-pulse"
          >
            <div className="h-48 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

// ============================================================================
// QUICK START #7: Filtered Vehicle List
// ============================================================================

export function FilteredVehicleList({
  initialVehicles,
}: {
  initialVehicles: ListingSummary[];
}) {
  const [filter, setFilter] = useState<"all" | "high-priority" | "no-concerns">(
    "all"
  );

  const filteredVehicles = initialVehicles.filter((vehicle) => {
    if (filter === "high-priority") {
      return vehicle.priority_score >= 80;
    }
    if (filter === "no-concerns") {
      return !vehicle.flag_rust_concern;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all" ? "bg-primary text-white" : "bg-muted"
          }`}
        >
          All ({initialVehicles.length})
        </button>
        <button
          onClick={() => setFilter("high-priority")}
          className={`px-4 py-2 rounded ${
            filter === "high-priority" ? "bg-primary text-white" : "bg-muted"
          }`}
        >
          High Priority
        </button>
        <button
          onClick={() => setFilter("no-concerns")}
          className={`px-4 py-2 rounded ${
            filter === "no-concerns" ? "bg-primary text-white" : "bg-muted"
          }`}
        >
          No Concerns
        </button>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No vehicles match the selected filter
        </div>
      )}
    </div>
  );
}

// ============================================================================
// QUICK START #8: Responsive Layouts
// ============================================================================

// 1-Column Layout (Mobile/List View)
export function ListLayout({ vehicles }: { vehicles: ListingSummary[] }) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

// 2-Column Layout (Tablet)
export function TabletLayout({ vehicles }: { vehicles: ListingSummary[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

// 4-Column Layout (Desktop)
export function DesktopLayout({ vehicles }: { vehicles: ListingSummary[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

// ============================================================================
// QUICK START #9: Custom Styling Examples
// ============================================================================

export function CustomStyledCards({ vehicle }: { vehicle: ListingSummary }) {
  return (
    <div className="space-y-4">
      {/* Featured/Highlighted Card */}
      <VehicleCard
        vehicle={vehicle}
        className="border-2 border-primary shadow-xl"
      />

      {/* Compact Card */}
      <VehicleCard vehicle={vehicle} className="max-w-sm" />

      {/* Full Width Card */}
      <VehicleCard vehicle={vehicle} className="w-full" />

      {/* With Custom Background */}
      <VehicleCard vehicle={vehicle} className="bg-accent/5" />
    </div>
  );
}

// ============================================================================
// QUICK START #10: API Route Handler (Next.js)
// ============================================================================

// app/api/vehicles/route.ts
/*
import { NextResponse } from "next/server";
import type { ListingSummary } from "@/lib/types";

export async function GET() {
  try {
    // Fetch from your database
    const vehicles: ListingSummary[] = await fetchVehiclesFromDB();

    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// PRO TIPS
// ============================================================================

/*
1. RESPONSIVE GRID:
   Use: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
   This creates a responsive grid that adapts to screen size

2. CUSTOM STYLING:
   Pass className prop to override or extend default styles:
   <VehicleCard vehicle={vehicle} className="border-2 border-primary" />

3. FILTERING:
   Filter vehicles before passing to map():
   vehicles.filter(v => v.priority_score >= 80).map(...)

4. SORTING:
   Sort vehicles by any property:
   vehicles.sort((a, b) => b.priority_score - a.priority_score)

5. PERFORMANCE:
   For large lists, consider:
   - Pagination
   - Virtual scrolling
   - React.memo on VehicleCard
   - Lazy loading images

6. ACCESSIBILITY:
   Component is accessible by default, but ensure:
   - Parent containers have proper ARIA labels
   - Filter controls are keyboard navigable
   - Focus states are visible

7. DARK MODE:
   Component automatically adapts to dark mode via Tailwind classes

8. TESTING:
   Use the example data from VehicleCard.example.tsx for testing

9. CUSTOMIZATION:
   Adjust priority threshold in VehicleCard.tsx:
   const isHighPriority = (score: number) => score >= 85;

10. INTEGRATION:
    Component works with both Vehicle and ListingSummary types,
    so you can use it anywhere in your app!
*/
