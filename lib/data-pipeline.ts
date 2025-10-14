/**
 * Data Pipeline for YourToyotaPicks
 *
 * Orchestrates the daily vehicle search pipeline:
 * 1. Fetch listings from data sources
 * 2. Apply filters
 * 3. Validate VINs
 * 4. Store curated results
 * 5. Log execution
 */

import { mockListings } from './mock-data';
import { applyFilters, DEFAULT_FILTER_CRITERIA } from './filters';
import { decodeVIN, verifyVIN } from './vin-decoder';
import { insertListing, checkVinExists, insertSearchLog } from './supabase';
import type { RawListing, VehicleInsert, SearchLogInsert } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface PipelineResult {
  success: boolean;
  stats: {
    totalFetched: number;
    afterBasicFilter: number;
    afterVinValidation: number;
    newListingsStored: number;
    duplicatesSkipped: number;
    errors: number;
  };
  errors: Array<{
    stage: string;
    message: string;
    details?: any;
  }>;
  executionTimeMs: number;
}

export interface ListingSource {
  name: string;
  fetch: () => Promise<RawListing[]>;
  cost?: number; // Cost in USD per call
}

// ============================================================================
// DATA SOURCE ADAPTERS
// ============================================================================

/**
 * Mock data source (for MVP testing)
 * Uses the mock-data.ts generator
 */
export const mockDataSource: ListingSource = {
  name: 'Mock Data Generator',
  fetch: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Convert VehicleInsert to RawListing format
    return mockListings.map((listing) => ({
      vin: listing.vin,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      price: listing.price,
      mileage: listing.mileage,
      body_type: listing.body_type,
      location: listing.current_location,
      distance: listing.distance_miles,
      dealer_name: listing.dealer_name,
      url: listing.source_url,
      images: listing.images_url,
      source: listing.source_platform,
      listing_id: listing.source_listing_id,
      // Include all other fields for filtering
      title_status: listing.title_status,
      accident_count: listing.accident_count,
      owner_count: listing.owner_count,
      is_rental: listing.is_rental,
      is_fleet: listing.is_fleet,
      has_lien: listing.has_lien,
      flood_damage: listing.flood_damage,
      state_of_origin: listing.state_of_origin,
      is_rust_belt_state: listing.is_rust_belt_state,
    }));
  },
  cost: 0, // Free
};

/**
 * Auto.dev API source (free tier: 1000 calls/month)
 * TODO: Implement when API key is available
 */
export const autoDevSource: ListingSource = {
  name: 'Auto.dev API',
  fetch: async () => {
    // TODO: Implement Auto.dev API integration
    // For now, fall back to mock data
    console.log('[Auto.dev] Not implemented, using mock data');
    return mockDataSource.fetch();
  },
  cost: 0, // Free tier
};

/**
 * Get the active data source based on environment
 */
export function getDataSource(): ListingSource {
  const source = process.env.DATA_SOURCE || 'mock';

  switch (source) {
    case 'auto.dev':
      return autoDevSource;
    case 'mock':
    default:
      return mockDataSource;
  }
}

// ============================================================================
// PIPELINE STAGES
// ============================================================================

/**
 * Stage 1: Fetch listings from API
 */
export async function fetchListingsFromAPI(): Promise<{
  listings: RawListing[];
  source: string;
  cost: number;
}> {
  const dataSource = getDataSource();

  try {
    const listings = await dataSource.fetch();

    return {
      listings,
      source: dataSource.name,
      cost: dataSource.cost || 0,
    };
  } catch (error) {
    console.error(
      `[fetchListingsFromAPI] Error fetching from ${dataSource.name}:`,
      error
    );
    throw new Error(
      `Failed to fetch listings: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Stage 2: Apply filters to listings
 */
export async function applyFiltersToListings(listings: RawListing[]): Promise<{
  passed: RawListing[];
  failed: RawListing[];
}> {
  const passed: RawListing[] = [];
  const failed: RawListing[] = [];

  for (const listing of listings) {
    const result = applyFilters(listing, DEFAULT_FILTER_CRITERIA);

    if (result.pass) {
      passed.push(listing);
    } else {
      failed.push(listing);
      console.log(
        `[Filter] Rejected ${listing.year} ${listing.make} ${listing.model} (${listing.vin}): ${result.reasons.join(', ')}`
      );
    }
  }

  return { passed, failed };
}

/**
 * Stage 3: Validate VINs using NHTSA API
 */
export async function validateVINs(listings: RawListing[]): Promise<{
  valid: RawListing[];
  invalid: RawListing[];
}> {
  const valid: RawListing[] = [];
  const invalid: RawListing[] = [];

  for (const listing of listings) {
    if (!listing.vin) {
      invalid.push(listing);
      console.log(
        `[VIN] Rejected ${listing.year} ${listing.make} ${listing.model}: Missing VIN`
      );
      continue;
    }

    try {
      // Decode VIN to verify basic info
      const vinResult = await decodeVIN(listing.vin);

      if (!vinResult.valid) {
        invalid.push(listing);
        console.log(`[VIN] Rejected ${listing.vin}: ${vinResult.errorMessage}`);
        continue;
      }

      // Verify VIN matches listing details
      const verification = await verifyVIN(
        listing.vin,
        listing.make,
        listing.model,
        listing.year
      );

      if (!verification.matches) {
        invalid.push(listing);
        console.log(
          `[VIN] Rejected ${listing.vin}: ${verification.issues.join(', ')}`
        );
        continue;
      }

      valid.push(listing);

      // Small delay to be nice to NHTSA API (250ms between requests)
      if (listings.indexOf(listing) < listings.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (error) {
      invalid.push(listing);
      console.error(`[VIN] Error validating ${listing.vin}:`, error);
    }
  }

  return { valid, invalid };
}

/**
 * Stage 4: Store new listings in database
 */
export async function storeNewListings(listings: RawListing[]): Promise<{
  stored: number;
  duplicates: number;
  errors: number;
}> {
  let stored = 0;
  let duplicates = 0;
  let errors = 0;

  for (const listing of listings) {
    try {
      // Check if VIN already exists
      const exists = await checkVinExists(listing.vin!);

      if (exists) {
        duplicates++;
        console.log(`[Store] Skipped duplicate: ${listing.vin}`);
        continue;
      }

      // Convert RawListing to VehicleInsert
      const vehicle: VehicleInsert = {
        vin: listing.vin!,
        make: listing.make as 'Toyota' | 'Honda',
        model: listing.model,
        year: listing.year,
        body_type: listing.body_type,
        price: listing.price,
        mileage: listing.mileage,
        mileage_rating: applyFilters(listing, DEFAULT_FILTER_CRITERIA)
          .mileageRating,
        title_status: listing.title_status || 'clean',
        accident_count: listing.accident_count || 0,
        owner_count: listing.owner_count || 1,
        is_rental: listing.is_rental || false,
        is_fleet: listing.is_fleet || false,
        has_lien: listing.has_lien || false,
        flood_damage: listing.flood_damage || false,
        state_of_origin: listing.state_of_origin || '',
        is_rust_belt_state: listing.is_rust_belt_state || false,
        current_location: listing.location,
        distance_miles: listing.distance || 0,
        dealer_name: listing.dealer_name,
        priority_score:
          applyFilters(listing, DEFAULT_FILTER_CRITERIA).priorityScore || 50,
        flag_rust_concern:
          applyFilters(listing, DEFAULT_FILTER_CRITERIA).isRustBeltConcern ||
          false,
        source_platform: listing.source as
          | 'Marketcheck'
          | 'Auto.dev'
          | 'Carapis',
        source_url: listing.url,
        source_listing_id: listing.listing_id,
        images_url: listing.images,
        reviewed_by_user: false,
      };

      // Insert into database
      await insertListing(vehicle);
      stored++;
      console.log(
        `[Store] Stored: ${listing.year} ${listing.make} ${listing.model} (${listing.vin})`
      );
    } catch (error) {
      errors++;
      console.error(`[Store] Error storing ${listing.vin}:`, error);
    }
  }

  return { stored, duplicates, errors };
}

/**
 * Stage 5: Log execution to search_logs table
 */
export async function logExecution(
  stats: {
    totalFetched: number;
    afterBasicFilter: number;
    afterVinValidation: number;
    stored: number;
    errors: number;
  },
  executionTimeMs: number,
  apiCost: number,
  errorDetails?: any
): Promise<void> {
  try {
    const log: SearchLogInsert = {
      search_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      total_listings_fetched: stats.totalFetched,
      listings_after_basic_filter: stats.afterBasicFilter,
      listings_after_vin_validation: stats.afterVinValidation,
      final_curated_count: stats.stored,
      api_calls_made: stats.totalFetched > 0 ? 1 : 0,
      api_cost_usd: apiCost,
      execution_time_seconds: Math.round(executionTimeMs / 1000),
      error_count: stats.errors,
      error_details: errorDetails || null,
    };

    await insertSearchLog(log);
    console.log('[Log] Execution logged to database');
  } catch (error) {
    console.error('[Log] Error logging execution:', error);
    // Don't throw - logging errors shouldn't fail the pipeline
  }
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

/**
 * Run the complete data pipeline
 */
export async function runPipeline(): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: Array<{ stage: string; message: string; details?: any }> = [];

  let totalFetched = 0;
  let afterBasicFilter = 0;
  let afterVinValidation = 0;
  let stored = 0;
  let duplicates = 0;
  let errorCount = 0;
  let apiCost = 0;

  try {
    // Stage 1: Fetch listings
    console.log('[Pipeline] Stage 1: Fetching listings...');
    let fetchResult;
    try {
      fetchResult = await fetchListingsFromAPI();
      totalFetched = fetchResult.listings.length;
      apiCost = fetchResult.cost;
      console.log(
        `[Pipeline] Fetched ${totalFetched} listings from ${fetchResult.source}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        stage: 'fetch',
        message,
        details: error,
      });
      throw error;
    }

    // Stage 2: Apply filters
    console.log('[Pipeline] Stage 2: Applying filters...');
    let filterResult;
    try {
      filterResult = await applyFiltersToListings(fetchResult.listings);
      afterBasicFilter = filterResult.passed.length;
      console.log(
        `[Pipeline] ${afterBasicFilter} listings passed filters (${filterResult.failed.length} rejected)`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        stage: 'filter',
        message,
        details: error,
      });
      throw error;
    }

    // Stage 3: Validate VINs
    console.log('[Pipeline] Stage 3: Validating VINs...');
    let vinResult;
    try {
      // Skip VIN validation in test/development to avoid rate limiting
      if (process.env.SKIP_VIN_VALIDATION === 'true') {
        console.log(
          '[Pipeline] Skipping VIN validation (SKIP_VIN_VALIDATION=true)'
        );
        vinResult = { valid: filterResult.passed, invalid: [] };
      } else {
        vinResult = await validateVINs(filterResult.passed);
      }
      afterVinValidation = vinResult.valid.length;
      console.log(
        `[Pipeline] ${afterVinValidation} listings have valid VINs (${vinResult.invalid.length} rejected)`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        stage: 'vin_validation',
        message,
        details: error,
      });
      // Don't throw - continue with what we have
      vinResult = { valid: filterResult.passed, invalid: [] };
    }

    // Stage 4: Store new listings
    console.log('[Pipeline] Stage 4: Storing new listings...');
    let storeResult;
    try {
      storeResult = await storeNewListings(vinResult.valid);
      stored = storeResult.stored;
      duplicates = storeResult.duplicates;
      errorCount = storeResult.errors;
      console.log(
        `[Pipeline] Stored ${stored} new listings (${duplicates} duplicates, ${errorCount} errors)`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        stage: 'store',
        message,
        details: error,
      });
      throw error;
    }

    // Stage 5: Log execution
    const executionTimeMs = Date.now() - startTime;
    console.log('[Pipeline] Stage 5: Logging execution...');
    try {
      await logExecution(
        {
          totalFetched,
          afterBasicFilter,
          afterVinValidation,
          stored,
          errors: errorCount,
        },
        executionTimeMs,
        apiCost,
        errors.length > 0 ? { errors } : undefined
      );
    } catch (error) {
      console.error('[Pipeline] Error logging execution:', error);
      // Don't throw - logging errors shouldn't fail the pipeline
    }

    return {
      success: true,
      stats: {
        totalFetched,
        afterBasicFilter,
        afterVinValidation,
        newListingsStored: stored,
        duplicatesSkipped: duplicates,
        errors: errorCount,
      },
      errors,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    const executionTimeMs = Date.now() - startTime;

    // Log failed execution
    try {
      await logExecution(
        {
          totalFetched,
          afterBasicFilter,
          afterVinValidation,
          stored,
          errors: errorCount + 1,
        },
        executionTimeMs,
        apiCost,
        {
          fatal: true,
          errors: [
            ...errors,
            {
              stage: 'pipeline',
              message: error instanceof Error ? error.message : 'Unknown error',
              details: error,
            },
          ],
        }
      );
    } catch (logError) {
      console.error('[Pipeline] Error logging failed execution:', logError);
    }

    return {
      success: false,
      stats: {
        totalFetched,
        afterBasicFilter,
        afterVinValidation,
        newListingsStored: stored,
        duplicatesSkipped: duplicates,
        errors: errorCount + 1,
      },
      errors: [
        ...errors,
        {
          stage: 'pipeline',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
      ],
      executionTimeMs: Date.now() - startTime,
    };
  }
}
