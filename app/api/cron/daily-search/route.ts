/**
 * Daily Search Cron Job
 *
 * Vercel Cron Job that runs daily to:
 * 1. Fetch vehicle listings from data sources
 * 2. Apply filters
 * 3. Validate VINs
 * 4. Store curated results in database
 * 5. Log execution
 *
 * Security:
 * - Requires CRON_SECRET header for authentication
 * - Only accessible via Vercel Cron or manual trigger with secret
 *
 * Schedule:
 * - Runs daily at 6:00 AM (configured in vercel.json)
 * - Can be manually triggered via POST request with CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { runPipeline } from '@/lib/data-pipeline';

// ============================================================================
// SECURITY
// ============================================================================

/**
 * Verify cron secret from request headers
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Cron] CRON_SECRET environment variable not set');
    return false;
  }

  // Support both "Bearer <secret>" and direct secret
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return token === cronSecret;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * POST /api/cron/daily-search
 *
 * Executes the daily vehicle search pipeline.
 * Called by Vercel Cron or manually with CRON_SECRET.
 *
 * @example Manual trigger with curl:
 * ```bash
 * curl -X POST https://your-app.vercel.app/api/cron/daily-search \
 *   -H "Authorization: Bearer your-cron-secret"
 * ```
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ========================================================================
    // 1. SECURITY CHECK
    // ========================================================================

    console.log('[Cron] Daily search cron job triggered');

    // Verify authorization
    if (!verifyCronSecret(request)) {
      console.error('[Cron] Unauthorized: Invalid or missing CRON_SECRET');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Invalid or missing authorization header',
          message: 'This endpoint requires a valid CRON_SECRET in the Authorization header',
        },
        { status: 401 }
      );
    }

    console.log('[Cron] Authorization successful');

    // ========================================================================
    // 2. RUN PIPELINE
    // ========================================================================

    console.log('[Cron] Starting data pipeline...');
    const result = await runPipeline();

    // ========================================================================
    // 3. RETURN RESULTS
    // ========================================================================

    const executionTime = Date.now() - startTime;

    if (result.success) {
      console.log('[Cron] Pipeline completed successfully');
      console.log('[Cron] Stats:', result.stats);

      return NextResponse.json(
        {
          success: true,
          message: 'Daily search completed successfully',
          stats: result.stats,
          executionTimeMs: executionTime,
          errors: result.errors.length > 0 ? result.errors : undefined,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      console.error('[Cron] Pipeline failed');
      console.error('[Cron] Errors:', result.errors);

      return NextResponse.json(
        {
          success: false,
          message: 'Daily search completed with errors',
          stats: result.stats,
          executionTimeMs: executionTime,
          errors: result.errors,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // ========================================================================
    // 4. ERROR HANDLING
    // ========================================================================

    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[Cron] Unhandled error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: errorMessage,
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER (for status check)
// ============================================================================

/**
 * GET /api/cron/daily-search
 *
 * Returns status information about the cron job.
 * Does not run the pipeline, just returns configuration.
 */
export async function GET(request: NextRequest) {
  // Check if CRON_SECRET is configured
  const hasCronSecret = !!process.env.CRON_SECRET;
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dataSource = process.env.DATA_SOURCE || 'mock';

  return NextResponse.json({
    status: 'ready',
    message: 'Daily search cron job endpoint',
    configuration: {
      cronSecretConfigured: hasCronSecret,
      supabaseConfigured: hasSupabaseKey,
      dataSource,
      environment: process.env.NODE_ENV || 'development',
    },
    usage: {
      method: 'POST',
      authentication: 'Required: Authorization header with CRON_SECRET',
      example: 'curl -X POST /api/cron/daily-search -H "Authorization: Bearer YOUR_SECRET"',
    },
    timestamp: new Date().toISOString(),
  });
}
