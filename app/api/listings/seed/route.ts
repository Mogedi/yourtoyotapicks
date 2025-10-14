// API endpoint to seed database with mock data
// POST /api/listings/seed
// Only allowed in development mode for testing purposes

import { NextRequest, NextResponse } from 'next/server';
import { mockListings, mockDataStats } from '@/lib/data/mock-data';
import { getServiceRoleClient } from '@/lib/database/supabase';

// Force dynamic route (don't pre-render at build time)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SeedResponse {
  success: boolean;
  message: string;
  stats?: {
    inserted: number;
    cleared: boolean;
    mockDataStats: typeof mockDataStats;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json<SeedResponse>(
      {
        success: false,
        message: 'Seed endpoint is only available in development mode',
        error: 'Not allowed in production',
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const clearExisting = body.clearExisting !== false; // Default to true

    // Check if environment variables are available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json<SeedResponse>(
        {
          success: false,
          message: 'Missing Supabase environment variables',
          error: 'SUPABASE_SERVICE_ROLE_KEY is not set',
        },
        { status: 500 }
      );
    }

    const client = getServiceRoleClient();

    // Clear existing data if requested
    if (clearExisting) {
      const { error: deleteError } = await client
        .from('curated_listings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using dummy condition)

      if (deleteError) {
        console.error('Error clearing existing listings:', deleteError);
        return NextResponse.json<SeedResponse>(
          {
            success: false,
            message: 'Failed to clear existing listings',
            error: deleteError.message,
          },
          { status: 500 }
        );
      }
    }

    // Insert mock data
    const { data, error } = await client
      .from('curated_listings')
      .insert(mockListings)
      .select();

    if (error) {
      console.error('Error inserting mock listings:', error);
      return NextResponse.json<SeedResponse>(
        {
          success: false,
          message: 'Failed to insert mock listings',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<SeedResponse>(
      {
        success: true,
        message: `Successfully seeded ${data.length} listings`,
        stats: {
          inserted: data.length,
          cleared: clearExisting,
          mockDataStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in seed endpoint:', error);
    return NextResponse.json<SeedResponse>(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check seed status and stats
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json<SeedResponse>(
      {
        success: false,
        message: 'Seed endpoint is only available in development mode',
        error: 'Not allowed in production',
      },
      { status: 403 }
    );
  }

  try {
    // Check if environment variables are available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json<SeedResponse>(
        {
          success: false,
          message: 'Missing Supabase environment variables',
          error: 'SUPABASE_SERVICE_ROLE_KEY is not set',
        },
        { status: 500 }
      );
    }

    const client = getServiceRoleClient();

    // Get current listing count
    const { count, error } = await client
      .from('curated_listings')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Seed endpoint is available',
        stats: {
          currentListings: count || 0,
          availableMockData: mockListings.length,
          mockDataStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in seed status check:', error);
    return NextResponse.json<SeedResponse>(
      {
        success: false,
        message: 'Failed to check seed status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
