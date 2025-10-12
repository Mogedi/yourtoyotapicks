// API endpoint to update vehicle review data
// PATCH /api/listings/[vin]/review
// Updates the reviewed_by_user, user_rating, and user_notes fields

import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import type { Vehicle } from '@/lib/types';

// Force dynamic route (don't pre-render at build time)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ReviewUpdateRequest {
  reviewed_by_user?: boolean;
  user_rating?: number;
  user_notes?: string;
}

interface ReviewResponse {
  success: boolean;
  message: string;
  data?: Vehicle;
  error?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ vin: string }> }
) {
  try {
    const { vin } = await params;

    if (!vin) {
      return NextResponse.json<ReviewResponse>(
        {
          success: false,
          message: 'VIN is required',
          error: 'Missing VIN parameter',
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: ReviewUpdateRequest = await request.json();

    // Validate the request body
    if (
      body.reviewed_by_user === undefined &&
      body.user_rating === undefined &&
      body.user_notes === undefined
    ) {
      return NextResponse.json<ReviewResponse>(
        {
          success: false,
          message: 'At least one field must be provided',
          error: 'No update fields provided',
        },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (body.user_rating !== undefined) {
      if (body.user_rating < 1 || body.user_rating > 5) {
        return NextResponse.json<ReviewResponse>(
          {
            success: false,
            message: 'Rating must be between 1 and 5',
            error: 'Invalid rating value',
          },
          { status: 400 }
        );
      }
    }

    // Check if environment variables are available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json<ReviewResponse>(
        {
          success: false,
          message: 'Server configuration error',
          error: 'Missing Supabase credentials',
        },
        { status: 500 }
      );
    }

    const client = getServiceRoleClient();

    // Build the update object
    const updates: Partial<Vehicle> = {};

    if (body.reviewed_by_user !== undefined) {
      updates.reviewed_by_user = body.reviewed_by_user;
    }

    if (body.user_rating !== undefined) {
      updates.user_rating = body.user_rating;
    }

    if (body.user_notes !== undefined) {
      updates.user_notes = body.user_notes;
    }

    // Update the listing in the database
    const { data, error } = await client
      .from('curated_listings')
      .update(updates)
      .eq('vin', vin)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json<ReviewResponse>(
          {
            success: false,
            message: 'Vehicle not found',
            error: `No vehicle found with VIN: ${vin}`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ReviewResponse>(
        {
          success: false,
          message: 'Failed to update review',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ReviewResponse>(
      {
        success: true,
        message: 'Review updated successfully',
        data: data as Vehicle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in review update endpoint:', error);
    return NextResponse.json<ReviewResponse>(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve review status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vin: string }> }
) {
  try {
    const { vin } = await params;

    if (!vin) {
      return NextResponse.json<ReviewResponse>(
        {
          success: false,
          message: 'VIN is required',
          error: 'Missing VIN parameter',
        },
        { status: 400 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json<ReviewResponse>(
        {
          success: false,
          message: 'Server configuration error',
          error: 'Missing Supabase credentials',
        },
        { status: 500 }
      );
    }

    const client = getServiceRoleClient();

    const { data, error } = await client
      .from('curated_listings')
      .select('vin, reviewed_by_user, user_rating, user_notes')
      .eq('vin', vin)
      .single();

    if (error) {
      console.error('Error fetching review:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json<ReviewResponse>(
          {
            success: false,
            message: 'Vehicle not found',
            error: `No vehicle found with VIN: ${vin}`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ReviewResponse>(
        {
          success: false,
          message: 'Failed to fetch review',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ReviewResponse>(
      {
        success: true,
        message: 'Review retrieved successfully',
        data: data as Vehicle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in review fetch endpoint:', error);
    return NextResponse.json<ReviewResponse>(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
