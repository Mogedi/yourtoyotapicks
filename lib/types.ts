// TypeScript type definitions for YourToyotaPicks
// These types match the database schema and API responses

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type MileageRating = 'excellent' | 'good' | 'acceptable';
export type OverallRating = 'high' | 'medium' | 'low';
export type TitleStatus = 'clean';
export type SourcePlatform = 'Marketcheck' | 'Auto.dev' | 'Carapis';
export type Make = 'Toyota' | 'Honda';
export type QualityTier = 'top_pick' | 'good_buy' | 'caution';

// Main vehicle/listing interface matching curated_listings table
export interface Vehicle {
  id: string;

  // Vehicle Info
  vin: string;
  make: Make;
  model: string;
  year: number;
  body_type?: string;

  // Pricing & Mileage
  price: number;
  mileage: number;
  age_in_years?: number; // Generated column
  mileage_per_year?: number; // Generated column
  mileage_rating?: MileageRating;

  // Title & History
  title_status: TitleStatus;
  accident_count: number;
  owner_count: number;
  is_rental: boolean;
  is_fleet: boolean;
  has_lien: boolean;
  flood_damage: boolean;

  // Location
  state_of_origin: string;
  is_rust_belt_state: boolean;
  current_location: string;
  distance_miles: number;
  dealer_name?: string;

  // Priority & Scoring
  priority_score: number;
  flag_rust_concern: boolean;
  overall_rating?: OverallRating;
  quality_tier?: QualityTier;
  ai_summary?: string;
  score_breakdown?: {
    title?: { points: number; reason: string };
    mileage?: { points: number; reason: string };
    price?: { points: number; reason: string };
    distance?: { points: number; reason: string };
    model?: { points: number; reason: string };
    condition?: { points: number; reason: string };
  };

  // Source Info
  source_platform: SourcePlatform;
  source_url: string;
  source_listing_id?: string;
  images_url?: string[]; // JSONB array

  // VIN Data
  vin_decode_data?: VINDecodeData;
  vin_history_data?: VINHistoryData;

  // User Interaction
  reviewed_by_user: boolean;
  user_rating?: number;
  user_notes?: string;

  // Timestamps
  first_seen_at: string;
  last_updated_at: string;
  created_at: string;
}

// Simplified listing type for display/cards
export interface ListingSummary {
  id: string;
  vin: string;
  make: Make;
  model: string;
  year: number;
  price: number;
  mileage: number;
  mileage_rating?: MileageRating;
  overall_rating?: OverallRating;
  priority_score: number;
  current_location: string;
  distance_miles: number;
  dealer_name?: string;
  images_url?: string[];
  source_url: string;
  created_at: string;
  owner_count: number;
  flag_rust_concern: boolean;

  // User Review fields
  reviewed_by_user: boolean;
  user_rating?: number;
  user_notes?: string;
}

// ============================================================================
// VIN API TYPES
// ============================================================================

// NHTSA vPIC API response structure
export interface VINDecodeData {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
  body_type?: string;
  engine_type?: string;
  manufacturer?: string;
  trim?: string;
  drive_type?: string;
  transmission?: string;
  fuel_type?: string;
  plant_country?: string;
  error_code?: string;
  error_text?: string;
  raw_response?: any; // Full NHTSA response
}

// VinAudit API response structure
export interface VINHistoryData {
  vin: string;
  title_status: string;
  accident_count: number;
  owner_count: number;
  is_rental: boolean;
  is_fleet: boolean;
  has_lien: boolean;
  flood_damage: boolean;
  salvage_title: boolean;
  odometer_rollback: boolean;
  theft_record: boolean;
  state_of_origin?: string;
  last_reported_odometer?: number;
  last_reported_date?: string;
  raw_response?: any; // Full VinAudit response
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

// Search criteria for filtering listings
export interface FilterCriteria {
  // Basic filters
  makes?: Make[];
  models?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;

  // Location
  radiusMiles?: number;
  latitude?: number;
  longitude?: number;

  // Quality filters
  mileageRating?: MileageRating[];
  overallRating?: OverallRating[];
  maxOwners?: number;
  maxAccidents?: number;
  excludeRental?: boolean;
  excludeFleet?: boolean;
  excludeRustBelt?: boolean;

  // User filters
  reviewedOnly?: boolean;
  minUserRating?: number;

  // Sorting
  sortBy?: 'priority' | 'price' | 'mileage' | 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';

  // Pagination
  limit?: number;
  offset?: number;
}

// Search log entry matching search_logs table
export interface SearchLog {
  id: string;
  search_date: string;
  total_listings_fetched?: number;
  listings_after_basic_filter?: number;
  listings_after_vin_validation?: number;
  listings_after_history_check?: number;
  final_curated_count?: number;
  api_calls_made?: number;
  api_cost_usd?: number;
  execution_time_seconds?: number;
  error_count: number;
  error_details?: {
    message?: string;
    stack?: string;
    [key: string]: any;
  };
  created_at: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

// Generic API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

// Model priority mapping
export interface ModelPriority {
  [model: string]: number;
}

// Search settings matching config/search-settings.json
export interface SearchSettings {
  user: {
    name: string;
    email: string;
    phone: string;
    location: {
      city: string;
      state: string;
      latitude: number;
      longitude: number;
    };
  };
  search_criteria: {
    brands: Make[];
    price_min: number;
    price_max: number;
    year_min: number;
    mileage_max: number;
    mileage_per_year_ideal: number;
    mileage_per_year_max: number;
    radius_miles: number;
    title_status: TitleStatus[];
    max_owners: number;
    max_accidents: number;
    exclude_rental: boolean;
    exclude_fleet: boolean;
    exclude_liens: boolean;
  };
  priority_models: ModelPriority;
  rust_belt_states: string[];
  notifications: {
    email_enabled: boolean;
    email_frequency: 'daily' | 'weekly' | 'on_new';
    sms_enabled: boolean;
    sms_priority_threshold: number;
  };
  api_settings: {
    primary_source: 'marketcheck' | 'auto.dev' | 'carapis';
    backup_sources: string[];
    max_api_cost_per_day: number;
  };
}

// ============================================================================
// EXTERNAL API TYPES (for data source integrations)
// ============================================================================

// Base listing from external APIs (before filtering)
export interface RawListing {
  // Basic vehicle info
  vin?: string;
  make: string;
  model: string;
  year: number;
  body_type?: string;

  // Pricing and mileage
  price: number;
  mileage: number;

  // Location
  location: string;
  distance?: number;
  state_of_origin?: string;
  is_rust_belt_state?: boolean;

  // Dealer info
  dealer_name?: string;

  // Listing metadata
  url: string;
  images?: string[];
  source: string;
  listing_id?: string;

  // Vehicle history (optional - may not be provided by all sources)
  title_status?: string;
  accident_count?: number;
  owner_count?: number;
  is_rental?: boolean;
  is_fleet?: boolean;
  has_lien?: boolean;
  flood_damage?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// For database insert operations (omit auto-generated fields)
export type VehicleInsert = Omit<
  Vehicle,
  | 'id'
  | 'age_in_years'
  | 'mileage_per_year'
  | 'created_at'
  | 'first_seen_at'
  | 'last_updated_at'
>;

// For database update operations (partial)
export type VehicleUpdate = Partial<
  Omit<
    Vehicle,
    | 'id'
    | 'vin'
    | 'age_in_years'
    | 'mileage_per_year'
    | 'created_at'
    | 'first_seen_at'
  >
>;

// For search log insert operations
export type SearchLogInsert = Omit<SearchLog, 'id' | 'created_at'>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isVehicle(obj: any): obj is Vehicle {
  return (
    typeof obj === 'object' &&
    typeof obj.vin === 'string' &&
    typeof obj.make === 'string' &&
    typeof obj.model === 'string' &&
    typeof obj.year === 'number'
  );
}

export function isMake(value: string): value is Make {
  return value === 'Toyota' || value === 'Honda';
}

export function isMileageRating(value: string): value is MileageRating {
  return value === 'excellent' || value === 'good' || value === 'acceptable';
}

export function isOverallRating(value: string): value is OverallRating {
  return value === 'high' || value === 'medium' || value === 'low';
}

export function isQualityTier(value: string): value is QualityTier {
  return value === 'top_pick' || value === 'good_buy' || value === 'caution';
}

// ============================================================================
// DASHBOARD V2 QUERY TYPES
// ============================================================================

// Query options for fetching vehicles with filters, sorting, and pagination
export interface VehicleQueryOptions {
  // Filters
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  mileageRating?: MileageRating | 'all';
  qualityTier?: QualityTier | 'all';
  search?: string;

  // Sorting
  sortField?:
    | 'priority'
    | 'quality_tier'
    | 'price'
    | 'mileage'
    | 'year'
    | 'make'
    | 'model'
    | 'date';
  sortOrder?: 'asc' | 'desc';

  // Pagination
  page?: number;
  pageSize?: number;
}

// Query result with data and metadata
export interface VehicleQueryResult {
  data: Vehicle[];
  allFilteredVehicles?: Vehicle[]; // All vehicles after filtering (before pagination)
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    activeCount: number;
  };
}
