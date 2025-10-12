// Supabase client configuration and helper functions
// This file provides database access methods for the YourToyotaPicks application

import { createClient } from '@supabase/supabase-js';
import type {
  Vehicle,
  VehicleInsert,
  VehicleUpdate,
  ListingSummary,
  SearchLog,
  SearchLogInsert,
  FilterCriteria,
  PaginatedResponse,
} from './types';
import { transformMarketcheckToListingSummary, transformMarketcheckToVehicle } from './marketcheck-adapter';

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client for browser/client-side operations
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Service role client for server-side operations (bypasses RLS)
// Use this in API routes, cron jobs, and server actions
export const getServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// ============================================================================
// HELPER FUNCTIONS - CURATED LISTINGS
// ============================================================================

/**
 * Get all listings with optional filtering and pagination
 */
export async function getListings(
  filters?: FilterCriteria
): Promise<PaginatedResponse<ListingSummary>> {
  try {
    let query = supabase
      .from('curated_listings')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.makes && filters.makes.length > 0) {
      query = query.in('make', filters.makes);
    }

    if (filters?.models && filters.models.length > 0) {
      query = query.in('model', filters.models);
    }

    if (filters?.yearMin) {
      query = query.gte('year', filters.yearMin);
    }

    if (filters?.yearMax) {
      query = query.lte('year', filters.yearMax);
    }

    if (filters?.priceMin) {
      query = query.gte('price', filters.priceMin);
    }

    if (filters?.priceMax) {
      query = query.lte('price', filters.priceMax);
    }

    if (filters?.mileageMax) {
      query = query.lte('mileage', filters.mileageMax);
    }

    if (filters?.mileageRating && filters.mileageRating.length > 0) {
      query = query.in('mileage_rating', filters.mileageRating);
    }

    if (filters?.overallRating && filters.overallRating.length > 0) {
      query = query.in('overall_rating', filters.overallRating);
    }

    if (filters?.maxOwners) {
      query = query.lte('owner_count', filters.maxOwners);
    }

    if (filters?.excludeRental) {
      query = query.eq('is_rental', false);
    }

    if (filters?.excludeFleet) {
      query = query.eq('is_fleet', false);
    }

    if (filters?.excludeRustBelt) {
      query = query.eq('is_rust_belt_state', false);
    }

    if (filters?.reviewedOnly) {
      query = query.eq('reviewed_by_user', true);
    }

    if (filters?.minUserRating) {
      query = query.gte('user_rating', filters.minUserRating);
    }

    // Sorting
    const sortBy = filters?.sortBy || 'priority';
    const sortOrder = filters?.sortOrder || 'desc';

    switch (sortBy) {
      case 'priority':
        query = query.order('priority_score', { ascending: sortOrder === 'asc' });
        query = query.order('mileage', { ascending: true }); // Secondary sort
        break;
      case 'price':
        query = query.order('price', { ascending: sortOrder === 'asc' });
        break;
      case 'mileage':
        query = query.order('mileage', { ascending: sortOrder === 'asc' });
        break;
      case 'date':
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
        break;
      case 'rating':
        query = query.order('user_rating', { ascending: sortOrder === 'asc' });
        break;
      default:
        query = query.order('priority_score', { ascending: false });
    }

    // Pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      // Silently throw connection errors (expected when Supabase not configured)
      throw error;
    }

    return {
      data: data as ListingSummary[],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      hasMore: (count || 0) > offset + limit,
    };
  } catch (error) {
    // Silently throw error for expected Supabase connection failures
    throw error;
  }
}

/**
 * Get a single listing by VIN
 */
export async function getListingByVin(vin: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('curated_listings')
      .select('*')
      .eq('vin', vin)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      // Silently throw connection errors (expected when Supabase not configured)
      throw error;
    }

    return data as Vehicle;
  } catch (error) {
    // Silently throw - expected when Supabase not configured
    throw error;
  }
}

/**
 * Get a single listing by ID
 */
export async function getListingById(id: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('curated_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching listing by ID:', error);
      throw error;
    }

    return data as Vehicle;
  } catch (error) {
    console.error('Error in getListingById:', error);
    throw error;
  }
}

/**
 * Insert a new listing (use service role client for this)
 */
export async function insertListing(listing: VehicleInsert): Promise<Vehicle> {
  try {
    const client = getServiceRoleClient();

    const { data, error } = await client
      .from('curated_listings')
      .insert(listing)
      .select()
      .single();

    if (error) {
      console.error('Error inserting listing:', error);
      throw error;
    }

    return data as Vehicle;
  } catch (error) {
    console.error('Error in insertListing:', error);
    throw error;
  }
}

/**
 * Update an existing listing
 */
export async function updateListing(
  vin: string,
  updates: VehicleUpdate
): Promise<Vehicle> {
  try {
    const client = getServiceRoleClient();

    const { data, error } = await client
      .from('curated_listings')
      .update(updates)
      .eq('vin', vin)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      throw error;
    }

    return data as Vehicle;
  } catch (error) {
    console.error('Error in updateListing:', error);
    throw error;
  }
}

/**
 * Mark a listing as reviewed by user
 */
export async function markAsReviewed(
  id: string,
  rating?: number,
  notes?: string
): Promise<void> {
  try {
    const updates: VehicleUpdate = {
      reviewed_by_user: true,
    };

    if (rating) {
      updates.user_rating = rating;
    }

    if (notes) {
      updates.user_notes = notes;
    }

    const { error } = await supabase
      .from('curated_listings')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error marking as reviewed:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markAsReviewed:', error);
    throw error;
  }
}

/**
 * Delete a listing by VIN
 */
export async function deleteListing(vin: string): Promise<void> {
  try {
    const client = getServiceRoleClient();

    const { error } = await client
      .from('curated_listings')
      .delete()
      .eq('vin', vin);

    if (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteListing:', error);
    throw error;
  }
}

/**
 * Check if a VIN already exists in the database
 */
export async function checkVinExists(vin: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('curated_listings')
      .select('vin')
      .eq('vin', vin)
      .maybeSingle();

    if (error) {
      console.error('Error checking VIN existence:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkVinExists:', error);
    throw error;
  }
}

/**
 * Get recently added listings (last N days)
 */
export async function getRecentListings(days: number = 7): Promise<Vehicle[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('curated_listings')
      .select('*')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent listings:', error);
      throw error;
    }

    return data as Vehicle[];
  } catch (error) {
    console.error('Error in getRecentListings:', error);
    throw error;
  }
}

/**
 * Get count of listings by make/model
 */
export async function getListingStats(): Promise<{
  total: number;
  byMake: Record<string, number>;
  byModel: Record<string, number>;
}> {
  try {
    const { data, error } = await supabase
      .from('curated_listings')
      .select('make, model');

    if (error) {
      console.error('Error fetching listing stats:', error);
      throw error;
    }

    const byMake: Record<string, number> = {};
    const byModel: Record<string, number> = {};

    data.forEach((listing) => {
      byMake[listing.make] = (byMake[listing.make] || 0) + 1;
      byModel[listing.model] = (byModel[listing.model] || 0) + 1;
    });

    return {
      total: data.length,
      byMake,
      byModel,
    };
  } catch (error) {
    console.error('Error in getListingStats:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS - SEARCH LOGS
// ============================================================================

/**
 * Insert a new search log entry
 */
export async function insertSearchLog(log: SearchLogInsert): Promise<SearchLog> {
  try {
    const client = getServiceRoleClient();

    const { data, error } = await client
      .from('search_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      console.error('Error inserting search log:', error);
      throw error;
    }

    return data as SearchLog;
  } catch (error) {
    console.error('Error in insertSearchLog:', error);
    throw error;
  }
}

/**
 * Get recent search logs
 */
export async function getSearchLogs(limit: number = 30): Promise<SearchLog[]> {
  try {
    const { data, error } = await supabase
      .from('search_logs')
      .select('*')
      .order('search_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching search logs:', error);
      throw error;
    }

    return data as SearchLog[];
  } catch (error) {
    console.error('Error in getSearchLogs:', error);
    throw error;
  }
}

/**
 * Get search statistics for the last N days
 */
export async function getSearchStats(days: number = 30): Promise<{
  totalSearches: number;
  totalListingsFetched: number;
  totalCuratedListings: number;
  totalApiCost: number;
  avgListingsPerDay: number;
  avgCostPerDay: number;
  avgExecutionTime: number;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('search_logs')
      .select('*')
      .gte('search_date', cutoffDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching search stats:', error);
      throw error;
    }

    const totalSearches = data.length;
    const totalListingsFetched = data.reduce(
      (sum, log) => sum + (log.total_listings_fetched || 0),
      0
    );
    const totalCuratedListings = data.reduce(
      (sum, log) => sum + (log.final_curated_count || 0),
      0
    );
    const totalApiCost = data.reduce(
      (sum, log) => sum + (log.api_cost_usd || 0),
      0
    );
    const totalExecutionTime = data.reduce(
      (sum, log) => sum + (log.execution_time_seconds || 0),
      0
    );

    return {
      totalSearches,
      totalListingsFetched,
      totalCuratedListings,
      totalApiCost,
      avgListingsPerDay: totalSearches > 0 ? totalCuratedListings / totalSearches : 0,
      avgCostPerDay: totalSearches > 0 ? totalApiCost / totalSearches : 0,
      avgExecutionTime: totalSearches > 0 ? totalExecutionTime / totalSearches : 0,
    };
  } catch (error) {
    console.error('Error in getSearchStats:', error);
    throw error;
  }
}

// ============================================================================
// MARKETCHECK LISTINGS FUNCTIONS
// ============================================================================

/**
 * Get all Marketcheck listings with optional filtering and pagination
 */
export async function getMarketcheckListings(
  filters?: FilterCriteria
): Promise<PaginatedResponse<ListingSummary>> {
  try {
    let query = supabase
      .from('marketcheck_listings')
      .select('*', { count: 'exact' });

    // Apply filters (columns are flattened in database)
    if (filters?.makes && filters.makes.length > 0) {
      query = query.in('make', filters.makes);
    }

    if (filters?.models && filters.models.length > 0) {
      query = query.in('model', filters.models);
    }

    if (filters?.yearMin) {
      query = query.gte('year', filters.yearMin);
    }

    if (filters?.yearMax) {
      query = query.lte('year', filters.yearMax);
    }

    if (filters?.priceMin) {
      query = query.gte('price', filters.priceMin);
    }

    if (filters?.priceMax) {
      query = query.lte('price', filters.priceMax);
    }

    if (filters?.mileageMax) {
      query = query.lte('miles', filters.mileageMax);
    }

    if (filters?.maxOwners === 1) {
      // Filter for single-owner only
      query = query.eq('carfax_1_owner', true);
    }

    // Pagination
    const limit = filters?.limit || 100;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      // Silently throw connection errors (expected when Supabase not configured)
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: limit,
        hasMore: false,
      };
    }

    // Transform raw Marketcheck data to ListingSummary
    const transformed = data.map(transformMarketcheckToListingSummary);

    // Client-side sorting by priority_score (since it's calculated)
    const sortBy = filters?.sortBy || 'priority';
    const sortOrder = filters?.sortOrder || 'desc';

    if (sortBy === 'priority') {
      transformed.sort((a, b) =>
        sortOrder === 'desc'
          ? b.priority_score - a.priority_score
          : a.priority_score - b.priority_score
      );
    } else if (sortBy === 'price') {
      transformed.sort((a, b) =>
        sortOrder === 'desc' ? b.price - a.price : a.price - b.price
      );
    } else if (sortBy === 'mileage') {
      transformed.sort((a, b) =>
        sortOrder === 'desc' ? b.mileage - a.mileage : a.mileage - b.mileage
      );
    }

    return {
      data: transformed,
      total: count || transformed.length,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      hasMore: (count || 0) > offset + limit,
    };
  } catch (error) {
    // Silently throw error for expected Supabase connection failures
    throw error;
  }
}

/**
 * Get a single Marketcheck listing by VIN (case-insensitive)
 */
export async function getMarketcheckListingByVin(vin: string): Promise<Vehicle | null> {
  try {
    const { data, error} = await supabase
      .from('marketcheck_listings')
      .select('*')
      .ilike('vin', vin) // Case-insensitive match
      .maybeSingle();

    if (error) {
      // Silently throw connection errors (expected when Supabase not configured)
      throw error;
    }

    if (!data) {
      return null;
    }

    // Transform to full Vehicle type
    return transformMarketcheckToVehicle(data);
  } catch (error) {
    // Silently throw - expected when Supabase not configured
    throw error;
  }
}

/**
 * Get Marketcheck dashboard stats
 */
export async function getMarketcheckStats(): Promise<{
  total: number;
  singleOwner: number;
  avgPrice: number;
  avgMileage: number;
}> {
  try {
    const { data, error } = await supabase
      .from('marketcheck_listings')
      .select('price, miles, carfax_1_owner');

    if (error) throw error;

    if (!data || data.length === 0) {
      return { total: 0, singleOwner: 0, avgPrice: 0, avgMileage: 0 };
    }

    return {
      total: data.length,
      singleOwner: data.filter(d => d.carfax_1_owner).length,
      avgPrice: data.reduce((sum, d) => sum + d.price, 0) / data.length,
      avgMileage: data.reduce((sum, d) => sum + d.miles, 0) / data.length,
    };
  } catch (error) {
    console.error('Error fetching Marketcheck stats:', error);
    return { total: 0, singleOwner: 0, avgPrice: 0, avgMileage: 0 };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('curated_listings')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  listingCount: number;
  recentListingCount: number;
  lastSearchDate?: string;
}> {
  try {
    // Check connection
    const connected = await testConnection();

    if (!connected) {
      return {
        connected: false,
        listingCount: 0,
        recentListingCount: 0,
      };
    }

    // Get total listing count
    const { count: listingCount } = await supabase
      .from('curated_listings')
      .select('*', { count: 'exact', head: true });

    // Get recent listing count (last 7 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const { count: recentListingCount } = await supabase
      .from('curated_listings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffDate.toISOString());

    // Get last search date
    const { data: lastSearch } = await supabase
      .from('search_logs')
      .select('search_date')
      .order('search_date', { ascending: false })
      .limit(1)
      .single();

    return {
      connected: true,
      listingCount: listingCount || 0,
      recentListingCount: recentListingCount || 0,
      lastSearchDate: lastSearch?.search_date,
    };
  } catch (error) {
    console.error('Error getting database health:', error);
    return {
      connected: false,
      listingCount: 0,
      recentListingCount: 0,
    };
  }
}
