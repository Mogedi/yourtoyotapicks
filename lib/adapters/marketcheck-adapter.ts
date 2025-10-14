/**
 * Marketcheck Data Adapter
 *
 * Transforms Marketcheck database schema to application types.
 * Handles field mapping, null values, and derived calculations.
 */

import type { ListingSummary, Vehicle, MileageRating } from '../types';

/**
 * Marketcheck raw data type (from database - flattened columns)
 */
export interface MarketcheckRawListing {
  id: string;
  vin: string;
  heading: string;
  price: number;
  miles: number;
  msrp?: number;
  carfax_1_owner: boolean;
  carfax_clean_title: boolean;
  dom?: number;
  dom_active?: number;
  dom_180?: number;
  vdp_url?: string;

  // Flattened build fields
  year: number;
  make: string;
  model: string;
  trim?: string;
  body_type?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type?: string;
  engine?: string;
  engine_size?: number;
  city_mpg?: number;
  highway_mpg?: number;

  // Flattened dealer fields
  dealer_name?: string;
  dealer_city?: string;
  dealer_state?: string;
  dealer_type?: string;
  dealer_latitude?: number;
  dealer_longitude?: number;

  // Photo links (JSONB in database)
  photo_links?: string[] | any;

  dist?: number;
  first_seen_at_date?: string;
  created_at?: string;
  [key: string]: any;
}

/**
 * Calculate mileage rating based on miles per year
 */
export function calculateMileageRating(
  miles: number,
  year: number
): MileageRating {
  const currentYear = new Date().getFullYear();
  const age = Math.max(currentYear - year, 1); // Avoid division by zero
  const milesPerYear = miles / age;

  if (milesPerYear < 10000) {
    return 'excellent';
  } else if (milesPerYear < 15000) {
    return 'good';
  } else {
    return 'acceptable';
  }
}

/**
 * Calculate preliminary priority score
 * (Will be replaced by full scoring algorithm in Phase 6)
 */
function calculatePreliminaryScore(raw: MarketcheckRawListing): number {
  let score = 50; // Base score

  // Single owner bonus
  if (raw.carfax_1_owner === true) {
    score += 20;
  }

  // Clean title bonus
  if (raw.carfax_clean_title === true) {
    score += 10;
  }

  // Low mileage bonus
  const currentYear = new Date().getFullYear();
  const age = Math.max(currentYear - raw.year, 1);
  const milesPerYear = raw.miles / age;
  if (milesPerYear < 10000) {
    score += 15;
  } else if (milesPerYear < 12000) {
    score += 10;
  }

  // Recent listing bonus
  if (raw.dom_active && raw.dom_active < 14) {
    score += 10;
  }

  // Model preference
  const model = raw.model?.toLowerCase() || '';
  if (model.includes('rav4') || model.includes('cr-v')) {
    score += 10;
  } else if (model.includes('camry') || model.includes('accord')) {
    score += 5;
  }

  return score;
}

/**
 * Transform Marketcheck listing to ListingSummary
 */
export function transformMarketcheckToListingSummary(
  raw: MarketcheckRawListing
): ListingSummary {
  // Calculate location string from dealer info (flattened columns)
  const location =
    raw.dealer_city && raw.dealer_state
      ? `${raw.dealer_city}, ${raw.dealer_state}`
      : 'Location not available';

  // Get photo links (JSONB column)
  let images: string[] = [];
  if (raw.photo_links) {
    if (Array.isArray(raw.photo_links)) {
      images = raw.photo_links;
    } else if (typeof raw.photo_links === 'string') {
      try {
        images = JSON.parse(raw.photo_links);
      } catch {
        images = [];
      }
    }
  }

  // Determine owner count from boolean
  const ownerCount = raw.carfax_1_owner === true ? 1 : 2;

  // Calculate mileage rating
  const mileageRating = calculateMileageRating(raw.miles, raw.year);

  // Calculate priority score
  const priorityScore = calculatePreliminaryScore(raw);

  return {
    id: raw.id,
    vin: raw.vin,
    make: raw.make as any, // Type assertion - API returns Toyota/Honda
    model: raw.model,
    year: raw.year,
    price: raw.price,
    mileage: raw.miles, // Field name mapping: miles → mileage
    mileage_rating: mileageRating,
    priority_score: priorityScore,
    current_location: location,
    distance_miles: raw.dist || 0,
    dealer_name: raw.dealer_name || 'Dealer not listed',
    images_url: images,
    source_url: raw.vdp_url || '',
    created_at: raw.first_seen_at_date || new Date().toISOString(),
    owner_count: ownerCount,
    flag_rust_concern: false, // Would need rust belt state logic
    reviewed_by_user: false, // User review data not in Marketcheck
    user_rating: undefined,
    user_notes: undefined,
  };
}

/**
 * Transform Marketcheck listing to full Vehicle type
 * Used for detail pages with all 77 fields
 */
export function transformMarketcheckToVehicle(
  raw: MarketcheckRawListing
): Vehicle {
  // Start with summary fields
  const summary = transformMarketcheckToListingSummary(raw);

  // Get photo links (JSONB column)
  let images: string[] = [];
  if (raw.photo_links) {
    if (Array.isArray(raw.photo_links)) {
      images = raw.photo_links;
    } else if (typeof raw.photo_links === 'string') {
      try {
        images = JSON.parse(raw.photo_links);
      } catch {
        images = [];
      }
    }
  }

  // Calculate age and miles per year
  const currentYear = new Date().getFullYear();
  const age = Math.max(currentYear - raw.year, 0);
  const milesPerYear = age > 0 ? Math.round(raw.miles / age) : raw.miles;

  return {
    id: raw.id,
    vin: raw.vin,
    make: raw.make as any, // Type assertion - API returns Toyota/Honda
    model: raw.model,
    year: raw.year,
    body_type: raw.body_type,
    price: raw.price,
    mileage: raw.miles,
    age_in_years: age,
    mileage_per_year: milesPerYear,
    mileage_rating: summary.mileage_rating,
    title_status: 'clean', // All Marketcheck cars have clean title
    accident_count: 0, // Marketcheck doesn't provide this
    owner_count: summary.owner_count,
    is_rental: false, // Marketcheck doesn't provide this
    is_fleet: false, // Marketcheck doesn't provide this
    has_lien: false, // Marketcheck doesn't provide this
    flood_damage: false, // Marketcheck doesn't provide this
    state_of_origin: raw.dealer_state || 'Unknown',
    is_rust_belt_state: false, // Would need lookup logic
    current_location: summary.current_location,
    distance_miles: summary.distance_miles,
    dealer_name: summary.dealer_name,
    priority_score: summary.priority_score,
    flag_rust_concern: false,
    source_platform: 'Marketcheck',
    source_url: raw.vdp_url || '',
    source_listing_id: raw.id,
    images_url: images,
    reviewed_by_user: false,
    first_seen_at: raw.first_seen_at_date || new Date().toISOString(),
    last_updated_at: raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || new Date().toISOString(),

    // Additional Marketcheck-specific fields stored as metadata
    // These can be used in detail pages
    vin_decode_data: {
      vin: raw.vin,
      make: raw.make,
      model: raw.model,
      year: raw.year.toString(),
      body_type: raw.body_type,
      engine_type: raw.engine,
      trim: raw.trim,
      drive_type: raw.drivetrain,
      transmission: raw.transmission,
      fuel_type: raw.fuel_type,
    },
  };
}

/**
 * Batch transform multiple listings
 */
export function transformMarketcheckListings(
  rawListings: MarketcheckRawListing[]
): ListingSummary[] {
  return rawListings.map(transformMarketcheckToListingSummary);
}

/**
 * Type guard to check if raw data is valid Marketcheck listing
 */
export function isValidMarketcheckListing(
  raw: any
): raw is MarketcheckRawListing {
  return (
    raw &&
    typeof raw.vin === 'string' &&
    typeof raw.price === 'number' &&
    typeof raw.miles === 'number' &&
    typeof raw.year === 'number' &&
    typeof raw.make === 'string' &&
    typeof raw.model === 'string'
  );
}
