import { NextRequest, NextResponse } from 'next/server';
import { decodeVIN, verifyVIN } from '@/lib/utils/vin-decoder';

export const runtime = 'edge';

/**
 * API Route: GET /api/vin-check/[vin]
 * Decode a VIN using the NHTSA API
 *
 * Query Parameters:
 * - verify: Optional. If provided with make, model, year, will verify against VIN
 *
 * Examples:
 * - /api/vin-check/5YFBURHE5HP123456
 * - /api/vin-check/5YFBURHE5HP123456?make=Toyota&model=RAV4&year=2018
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vin: string }> }
) {
  try {
    const { vin } = await params;
    const { searchParams } = new URL(request.url);

    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');

    // If verification parameters provided, verify the VIN
    if (make && model && year) {
      const yearNum = parseInt(year, 10);

      if (isNaN(yearNum)) {
        return NextResponse.json(
          { error: 'Invalid year parameter' },
          { status: 400 }
        );
      }

      const verification = await verifyVIN(vin, make, model, yearNum);

      return NextResponse.json({
        vin,
        verification: {
          matches: verification.matches,
          issues: verification.issues,
        },
        decoded: verification.decoded,
      });
    }

    // Otherwise, just decode the VIN
    const decoded = await decodeVIN(vin);

    return NextResponse.json(decoded);
  } catch (error) {
    console.error('Error in VIN check API:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
