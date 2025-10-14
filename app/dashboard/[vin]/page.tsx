import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getListingByVin, getMarketcheckListingByVin } from '@/lib/supabase';
import { mockListings } from '@/lib/mock-data';
import { VehicleDetail } from '@/components/VehicleDetail';
import type { Vehicle } from '@/lib/types';

// Dynamic params type
type Params = {
  vin: string;
};

// Error component
function VehicleNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Vehicle Not Found</h1>
        <p className="text-muted-foreground text-lg">
          The vehicle you are looking for does not exist or has been removed.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

// Main page component
export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  // Get the VIN from params
  const { vin } = await params;

  // Validate VIN format (basic check)
  if (!vin || vin.length !== 17) {
    notFound();
  }

  // Fetch vehicle data - try Marketcheck first, then legacy, then mock data
  let vehicle: Vehicle | null = null;

  // Try Marketcheck data first (case-insensitive VIN lookup)
  try {
    vehicle = await getMarketcheckListingByVin(vin);
  } catch {
    // Marketcheck query failed, will try legacy next
  }

  // If not found in Marketcheck, try legacy curated_listings table
  if (!vehicle) {
    try {
      vehicle = await getListingByVin(vin.toUpperCase());
    } catch {
      // Legacy query failed, will try mock data next
    }
  }

  // If still not found, fallback to mock data
  if (!vehicle) {
    const mockVehicle = mockListings.find(
      (listing) => listing.vin.toUpperCase() === vin.toUpperCase()
    );
    if (mockVehicle) {
      vehicle = {
        ...mockVehicle,
        id: '', // Mock data doesn't have ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_seen_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
      } as Vehicle;
    }
  }

  // If vehicle not found, show 404
  if (!vehicle) {
    return <VehicleNotFound />;
  }

  // Render vehicle detail
  return <VehicleDetail vehicle={vehicle} />;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { vin } = await params;

  // Try Marketcheck, then legacy, fallback to mock data
  let vehicle: Vehicle | null = null;

  // Try Marketcheck first
  try {
    vehicle = await getMarketcheckListingByVin(vin);
  } catch {
    // Marketcheck query failed
  }

  // If not found, try legacy
  if (!vehicle) {
    try {
      vehicle = await getListingByVin(vin);
    } catch {
      // Legacy query failed
    }
  }

  // If still not found, fallback to mock data (case-insensitive)
  if (!vehicle) {
    const mockVehicle = mockListings.find(
      (listing) => listing.vin.toUpperCase() === vin.toUpperCase()
    );
    if (mockVehicle) {
      vehicle = {
        ...mockVehicle,
        id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_seen_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
      } as Vehicle;
    }
  }

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found',
      description: 'The requested vehicle could not be found.',
    };
  }

  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} - YourToyotaPicks`,
    description: `View details for this ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${vehicle.mileage.toLocaleString()} miles, priced at $${vehicle.price.toLocaleString()}. Located in ${vehicle.current_location}.`,
    openGraph: {
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      description: `${vehicle.mileage.toLocaleString()} miles • $${vehicle.price.toLocaleString()} • ${vehicle.current_location}`,
      images: vehicle.images_url?.[0] ? [vehicle.images_url[0]] : [],
    },
  };
}

// Optional: Generate static params for static generation (if you want to pre-render some pages)
// Uncomment this if you want to use static site generation for popular vehicles
/*
export async function generateStaticParams() {
  // You could fetch the most popular/recent vehicles here
  // For now, we'll use dynamic rendering for all pages
  return [];
}
*/
