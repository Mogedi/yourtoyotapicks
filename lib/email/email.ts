// Email notification system using Resend
// Provides functions to send daily/weekly digests of vehicle matches

import { Resend } from 'resend';
import type { Vehicle } from '../types';
import { DailyDigestEmail } from './templates/daily-digest';
import { WeeklyDigestEmail } from './templates/weekly-digest';

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    'RESEND_API_KEY not found in environment variables. Email notifications will be disabled.'
  );
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a daily digest email with new vehicle matches
 * @param vehicles Array of vehicles to include in the digest (typically last 24 hours)
 * @param recipientEmail Email address to send to
 * @returns Result object with success status and message ID or error
 */
export async function sendDailyDigest(
  vehicles: Vehicle[],
  recipientEmail: string
): Promise<EmailResult> {
  try {
    if (!resend) {
      return {
        success: false,
        error:
          'Resend client not initialized. Please set RESEND_API_KEY environment variable.',
      };
    }

    if (vehicles.length === 0) {
      return {
        success: false,
        error: 'No vehicles provided for digest email.',
      };
    }

    // Take top 5 vehicles by priority score
    const topVehicles = vehicles
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 5);

    // Send email using React Email component
    const { data, error } = await resend.emails.send({
      from: 'YourToyotaPicks <notifications@yourtoyotapicks.com>',
      to: recipientEmail,
      subject: `Daily Vehicle Digest: ${vehicles.length} New Match${vehicles.length !== 1 ? 'es' : ''} Found`,
      react: DailyDigestEmail({
        vehicles: topVehicles,
        totalCount: vehicles.length,
      }),
    });

    if (error) {
      console.error('Error sending daily digest email:', error);
      return {
        success: false,
        error: error.message || 'Unknown error sending email',
      };
    }

    console.log(
      `Daily digest email sent successfully. Message ID: ${data?.id}`
    );
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Exception in sendDailyDigest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a weekly digest email with new vehicle matches
 * @param vehicles Array of vehicles to include in the digest (typically last 7 days)
 * @param recipientEmail Email address to send to
 * @returns Result object with success status and message ID or error
 */
export async function sendWeeklyDigest(
  vehicles: Vehicle[],
  recipientEmail: string
): Promise<EmailResult> {
  try {
    if (!resend) {
      return {
        success: false,
        error:
          'Resend client not initialized. Please set RESEND_API_KEY environment variable.',
      };
    }

    if (vehicles.length === 0) {
      return {
        success: false,
        error: 'No vehicles provided for digest email.',
      };
    }

    // Take top 5 vehicles by priority score
    const topVehicles = vehicles
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 5);

    // Send email using React Email component
    const { data, error } = await resend.emails.send({
      from: 'YourToyotaPicks <notifications@yourtoyotapicks.com>',
      to: recipientEmail,
      subject: `Weekly Vehicle Digest: ${vehicles.length} New Match${vehicles.length !== 1 ? 'es' : ''} This Week`,
      react: WeeklyDigestEmail({
        vehicles: topVehicles,
        totalCount: vehicles.length,
      }),
    });

    if (error) {
      console.error('Error sending weekly digest email:', error);
      return {
        success: false,
        error: error.message || 'Unknown error sending email',
      };
    }

    console.log(
      `Weekly digest email sent successfully. Message ID: ${data?.id}`
    );
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Exception in sendWeeklyDigest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a test email to verify Resend configuration
 * @param recipientEmail Email address to send test to
 * @returns Result object with success status
 */
export async function sendTestEmail(
  recipientEmail: string
): Promise<EmailResult> {
  try {
    if (!resend) {
      return {
        success: false,
        error:
          'Resend client not initialized. Please set RESEND_API_KEY environment variable.',
      };
    }

    const { data, error } = await resend.emails.send({
      from: 'YourToyotaPicks <notifications@yourtoyotapicks.com>',
      to: recipientEmail,
      subject: 'Test Email from YourToyotaPicks',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">YourToyotaPicks Test Email</h1>
              <p>This is a test email to verify your Resend configuration is working correctly.</p>
              <p>If you received this email, your email notification system is set up properly!</p>
              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                YourToyotaPicks - Your automated vehicle matching service
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Unknown error sending email',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency for display in emails
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format mileage for display in emails
 */
export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage) + ' mi';
}

/**
 * Get badge color for priority score
 */
export function getPriorityBadgeColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  return '#ef4444'; // red
}

/**
 * Get badge text for priority score
 */
export function getPriorityBadgeText(score: number): string {
  if (score >= 80) return 'High Priority';
  if (score >= 60) return 'Medium Priority';
  return 'Low Priority';
}

/**
 * Check if email notifications are enabled
 */
export function isEmailEnabled(): boolean {
  return !!resend;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
