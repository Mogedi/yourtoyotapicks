// API endpoint to send email digests
// POST /api/notifications/send-digest

import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import { sendDailyDigest, sendWeeklyDigest } from '@/lib/email';
import type { Vehicle } from '@/lib/types';
import notificationSettings from '@/config/notification-settings.json';

// ============================================================================
// TYPES
// ============================================================================

interface SendDigestRequest {
  type?: 'daily' | 'weekly';
  email?: string;
  cronSecret?: string;
}

interface SendDigestResponse {
  success: boolean;
  message: string;
  data?: {
    vehicleCount: number;
    emailSent: boolean;
    messageId?: string;
  };
  error?: string;
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<SendDigestResponse>> {
  try {
    // Parse request body
    const body: SendDigestRequest = await request.json();
    const { type = 'daily', email, cronSecret } = body;

    // Verify cron secret if provided (for automated cron job calls)
    const expectedCronSecret = process.env.CRON_SECRET;
    if (cronSecret && expectedCronSecret && cronSecret !== expectedCronSecret) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid cron secret',
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Get recipient email (from request or config)
    const recipientEmail = email || notificationSettings.user_email;

    if (!recipientEmail || recipientEmail === 'your_email@example.com') {
      return NextResponse.json(
        {
          success: false,
          message: 'No recipient email configured',
          error: 'Please configure user_email in notification-settings.json or provide email in request',
        },
        { status: 400 }
      );
    }

    // Check if email notifications are enabled
    if (!notificationSettings.email_enabled) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email notifications are disabled',
          error: 'email_enabled is set to false in notification-settings.json',
        },
        { status: 400 }
      );
    }

    // Get the appropriate time range based on digest type
    const days = type === 'weekly' ? 7 : 1;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Fetch new listings from database
    const supabase = getServiceRoleClient();
    let query = supabase
      .from('curated_listings')
      .select('*')
      .gte('created_at', cutoffDate.toISOString())
      .order('priority_score', { ascending: false });

    // Apply filters from notification settings
    if (notificationSettings.min_priority_score) {
      query = query.gte('priority_score', notificationSettings.min_priority_score);
    }

    if (notificationSettings.preferences.only_high_priority) {
      query = query.gte('priority_score', 80);
    }

    if (notificationSettings.preferences.exclude_reviewed) {
      query = query.eq('reviewed_by_user', false);
    }

    const { data: vehicles, error: dbError } = await query;

    if (dbError) {
      console.error('Database error fetching listings:', dbError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch listings from database',
          error: dbError.message,
        },
        { status: 500 }
      );
    }

    // Check if we have any vehicles to send
    if (!vehicles || vehicles.length === 0) {
      // Don't send empty digests unless explicitly configured
      if (!notificationSettings.preferences.send_empty_digest) {
        return NextResponse.json({
          success: true,
          message: `No new vehicles found in the last ${days} day${days > 1 ? 's' : ''}. No email sent.`,
          data: {
            vehicleCount: 0,
            emailSent: false,
          },
        });
      }
    }

    // Limit number of vehicles if configured
    let vehiclesToSend = vehicles as Vehicle[];
    if (
      !notificationSettings.include_all_vehicles &&
      notificationSettings.max_vehicles_per_email
    ) {
      vehiclesToSend = vehiclesToSend.slice(0, notificationSettings.max_vehicles_per_email);
    }

    // Send the appropriate digest email
    let emailResult;
    if (type === 'weekly') {
      emailResult = await sendWeeklyDigest(vehiclesToSend, recipientEmail);
    } else {
      emailResult = await sendDailyDigest(vehiclesToSend, recipientEmail);
    }

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send email',
          error: emailResult.error,
          data: {
            vehicleCount: vehicles.length,
            emailSent: false,
          },
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: `${type === 'weekly' ? 'Weekly' : 'Daily'} digest sent successfully`,
      data: {
        vehicleCount: vehicles.length,
        emailSent: true,
        messageId: emailResult.messageId,
      },
    });
  } catch (error) {
    console.error('Error in send-digest API route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER (for testing/status)
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');

    if (test === 'true') {
      // Return test configuration info
      return NextResponse.json({
        success: true,
        message: 'Email digest API is ready',
        config: {
          email_enabled: notificationSettings.email_enabled,
          email_frequency: notificationSettings.email_frequency,
          recipient_email: notificationSettings.user_email,
          min_priority_score: notificationSettings.min_priority_score,
          max_vehicles_per_email: notificationSettings.max_vehicles_per_email,
          resend_configured: !!process.env.RESEND_API_KEY,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email digest API endpoint. Use POST to send digests.',
      usage: {
        method: 'POST',
        endpoint: '/api/notifications/send-digest',
        body: {
          type: 'daily | weekly (optional, defaults to daily)',
          email: 'recipient@example.com (optional, uses config if not provided)',
          cronSecret: 'your_cron_secret (optional, for automated calls)',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
