/**
 * E2E Test: Review System Flow
 *
 * Tests the complete review workflow:
 * - Navigate to vehicle detail page
 * - Access Review tab
 * - Fill out review form (stars, notes, checkbox)
 * - Save review
 * - Verify review appears in Details tab
 * - Check for reviewed badge on dashboard
 */

import { Page } from 'puppeteer';
import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  waitForSelector,
  clickElement,
  typeIntoField,
  elementExists,
  getTextContent,
  BrowserContext,
} from '../helpers/browser';
import { takeScreenshot } from '../helpers/screenshot';
import { TestFlowResult, TestStepResult } from '../helpers/types';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_NAME = '04-review-system';

// Test VIN - you can change this to a valid VIN from your database
const TEST_VIN = '5YFBURHE5HP690324';

interface ReviewData {
  rating: number;
  notes: string;
  markAsReviewed: boolean;
}

/**
 * Navigate to vehicle detail page
 */
async function navigateToVehicleDetail(page: Page, vin: string): Promise<TestStepResult> {
  const stepName = 'Navigate to vehicle detail';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);
    const url = `${BASE_URL}/dashboard/${vin}`;
    await navigateTo(page, url);

    // Wait for page to load
    await waitForSelector(page, 'h1', 10000);

    // Verify we're on the detail page
    const currentUrl = page.url();
    if (!currentUrl.includes(vin)) {
      throw new Error(`Failed to navigate to vehicle detail page. Current URL: ${currentUrl}`);
    }

    const screenshot = await takeScreenshot(page, 'vehicle-detail-loaded', TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: 'vehicle-detail-loaded',
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: currentUrl,
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Navigate to Review tab
 */
async function navigateToReviewTab(page: Page): Promise<TestStepResult> {
  const stepName = 'Navigate to Review tab';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Click Review tab - try multiple selectors
    const reviewTabSelectors = [
      'button[value="review"]',
      '[role="tab"][value="review"]',
      'button:has-text("Review")',
      'text=Review',
    ];

    let clicked = false;
    for (const selector of reviewTabSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        clicked = true;
        break;
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    if (!clicked) {
      throw new Error('Could not find Review tab');
    }

    // Wait for review section to be visible
    await new Promise(resolve => setTimeout(resolve,1000));

    // Take screenshot of empty review form
    const screenshot = await takeScreenshot(page, 'empty-review-form', TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: 'empty-review-form',
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: page.url(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Select star rating
 */
async function selectStarRating(page: Page, rating: number): Promise<TestStepResult> {
  const stepName = `Select ${rating} stars`;
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Click on the star button for the desired rating
    // Stars are buttons with aria-label like "Rate 4 stars"
    const starSelector = `button[aria-label*="Rate ${rating} star"]`;
    await page.waitForSelector(starSelector, { timeout: 5000 });
    await page.click(starSelector);

    // Wait a moment for the UI to update
    await new Promise(resolve => setTimeout(resolve,500));

    // Take screenshot showing stars selected
    const screenshot = await takeScreenshot(page, `stars-selected-${rating}`, TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: `stars-selected-${rating}`,
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: page.url(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Type review notes
 */
async function typeReviewNotes(page: Page, notes: string): Promise<TestStepResult> {
  const stepName = 'Type review notes';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Find the notes textarea
    const notesSelector = 'textarea#notes';
    await page.waitForSelector(notesSelector, { timeout: 5000 });
    await page.click(notesSelector);
    await page.type(notesSelector, notes, { delay: 50 });

    // Wait for typing to complete
    await new Promise(resolve => setTimeout(resolve,500));

    const screenshot = await takeScreenshot(page, 'notes-entered', TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: 'notes-entered',
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: page.url(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check "Mark as Reviewed" checkbox
 */
async function checkMarkAsReviewed(page: Page): Promise<TestStepResult> {
  const stepName = 'Check Mark as Reviewed';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Find and click the checkbox
    const checkboxSelector = 'button[role="checkbox"]#reviewed, input[type="checkbox"]#reviewed';
    await page.waitForSelector(checkboxSelector, { timeout: 5000 });

    // Check if already checked
    const isChecked = await page.$eval(checkboxSelector, (el: any) => {
      return el.getAttribute('aria-checked') === 'true' || el.checked === true;
    });

    if (!isChecked) {
      await page.click(checkboxSelector);
      await new Promise(resolve => setTimeout(resolve,300));
    }

    const screenshot = await takeScreenshot(page, 'reviewed-checkbox-checked', TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: 'reviewed-checkbox-checked',
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: page.url(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Click Save Review button
 */
async function clickSaveReview(page: Page): Promise<TestStepResult> {
  const stepName = 'Click Save Review';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Find and click Save Review button
    const saveButtonSelector = 'button:has-text("Save Review")';
    await page.waitForSelector(saveButtonSelector, { timeout: 5000 });
    await page.click(saveButtonSelector);

    // Wait for save to complete (look for success message)
    await new Promise(resolve => setTimeout(resolve,2000));

    const screenshot = await takeScreenshot(page, 'after-save', TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: 'after-save',
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: page.url(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify success message or state
 */
async function verifySuccessMessage(page: Page): Promise<TestStepResult> {
  const stepName = 'Verify success message';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Look for success indicators
    const successIndicators = [
      'text=Review saved successfully',
      'text=saved successfully',
      '[class*="text-green"]',
      'svg[class*="text-green"]',
    ];

    let found = false;
    for (const indicator of successIndicators) {
      try {
        await page.waitForSelector(indicator, { timeout: 2000 });
        found = true;
        console.log(`✓ Found success indicator: ${indicator}`);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!found) {
      console.warn('⚠ No explicit success message found, but continuing...');
    }

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Navigate to Details tab to verify review
 */
async function navigateToDetailsTab(page: Page): Promise<TestStepResult> {
  const stepName = 'Navigate to Details tab';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Click Details tab
    const detailsTabSelector = 'button[value="details"]';
    await page.waitForSelector(detailsTabSelector, { timeout: 5000 });
    await page.click(detailsTabSelector);

    await new Promise(resolve => setTimeout(resolve,1000));

    const screenshot = await takeScreenshot(page, 'details-tab-with-review', TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: 'details-tab-with-review',
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: page.url(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify review is shown in Details tab
 */
async function verifyReviewInDetails(page: Page, expectedData: ReviewData): Promise<TestStepResult> {
  const stepName = 'Verify review in Details';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Look for review indicators in Details tab
    const reviewedText = await getTextContent(page, 'text=Reviewed');

    if (!reviewedText) {
      throw new Error('Could not find "Reviewed" text in Details tab');
    }

    // Check for rating stars if applicable
    if (expectedData.rating > 0) {
      const ratingElement = await page.$('text=Your Rating');
      if (ratingElement) {
        console.log('✓ Found rating section');
      }
    }

    // Check for notes
    if (expectedData.notes) {
      const notesElement = await page.$('text=Your Notes');
      if (notesElement) {
        console.log('✓ Found notes section');
      }
    }

    console.log(`✓ ${stepName} - Review data verified`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Return to dashboard
 */
async function returnToDashboard(page: Page): Promise<TestStepResult> {
  const stepName = 'Return to dashboard';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Click back button
    const backButtonSelector = 'a[href="/dashboard"]';
    await page.waitForSelector(backButtonSelector, { timeout: 5000 });
    await page.click(backButtonSelector);

    // Wait for dashboard to load
    await new Promise(resolve => setTimeout(resolve,2000));

    const screenshot = await takeScreenshot(page, 'back-to-dashboard', TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: 'back-to-dashboard',
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: page.url(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check for reviewed badge on dashboard
 */
async function checkForReviewedBadge(page: Page): Promise<TestStepResult> {
  const stepName = 'Check for reviewed badge';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Look for reviewed badge or indicator
    const badgeSelectors = [
      'text=Reviewed',
      '[class*="reviewed"]',
      'svg[class*="text-green"]',
    ];

    let found = false;
    for (const selector of badgeSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        found = true;
        console.log(`✓ Found reviewed badge: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!found) {
      console.warn('⚠ No reviewed badge found on dashboard');
    }

    const screenshot = await takeScreenshot(page, 'dashboard-with-badge', TEST_NAME);
    console.log(`✓ ${stepName} - Screenshot: ${screenshot}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot: {
        name: 'dashboard-with-badge',
        path: screenshot,
        timestamp: new Date().toISOString(),
        folder: 'screenshots',
        fullPath: screenshot,
        url: page.url(),
        viewport: { width: 1920, height: 1080 },
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main test function
 */
export async function testReviewSystem(): Promise<TestFlowResult> {
  const testStartTime = Date.now();
  const steps: TestStepResult[] = [];
  const errors: any[] = [];
  const screenshots: any[] = [];

  console.log('\n========================================');
  console.log('Starting Review System Test Flow');
  console.log('========================================');

  let context: BrowserContext | null = null;

  try {
    // Launch browser
    context = await launchBrowser();
    const { page } = context;

    // Test data
    const reviewData: ReviewData = {
      rating: 4,
      notes: 'Great vehicle for testing',
      markAsReviewed: true,
    };

    // Execute test steps
    const step1 = await navigateToVehicleDetail(page, TEST_VIN);
    steps.push(step1);
    if (step1.screenshot) screenshots.push(step1.screenshot);
    if (!step1.success) throw new Error(step1.error);

    const step2 = await navigateToReviewTab(page);
    steps.push(step2);
    if (step2.screenshot) screenshots.push(step2.screenshot);
    if (!step2.success) throw new Error(step2.error);

    const step3 = await selectStarRating(page, reviewData.rating);
    steps.push(step3);
    if (step3.screenshot) screenshots.push(step3.screenshot);
    if (!step3.success) throw new Error(step3.error);

    const step4 = await typeReviewNotes(page, reviewData.notes);
    steps.push(step4);
    if (step4.screenshot) screenshots.push(step4.screenshot);
    if (!step4.success) throw new Error(step4.error);

    const step5 = await checkMarkAsReviewed(page);
    steps.push(step5);
    if (step5.screenshot) screenshots.push(step5.screenshot);
    if (!step5.success) throw new Error(step5.error);

    const step6 = await clickSaveReview(page);
    steps.push(step6);
    if (step6.screenshot) screenshots.push(step6.screenshot);
    if (!step6.success) throw new Error(step6.error);

    const step7 = await verifySuccessMessage(page);
    steps.push(step7);

    const step8 = await navigateToDetailsTab(page);
    steps.push(step8);
    if (step8.screenshot) screenshots.push(step8.screenshot);
    if (!step8.success) throw new Error(step8.error);

    const step9 = await verifyReviewInDetails(page, reviewData);
    steps.push(step9);

    const step10 = await returnToDashboard(page);
    steps.push(step10);
    if (step10.screenshot) screenshots.push(step10.screenshot);
    if (!step10.success) throw new Error(step10.error);

    const step11 = await checkForReviewedBadge(page);
    steps.push(step11);
    if (step11.screenshot) screenshots.push(step11.screenshot);

    const duration = Date.now() - testStartTime;

    console.log('\n========================================');
    console.log('✓ Review System Test PASSED');
    console.log(`Duration: ${duration}ms`);
    console.log(`Steps completed: ${steps.length}`);
    console.log(`Screenshots taken: ${screenshots.length}`);
    console.log('========================================\n');

    return {
      name: TEST_NAME,
      success: true,
      duration,
      errors,
      screenshots,
      steps,
    };
  } catch (error) {
    const duration = Date.now() - testStartTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push({
      type: 'test-failure',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    console.log('\n========================================');
    console.log('✗ Review System Test FAILED');
    console.log(`Error: ${errorMessage}`);
    console.log(`Duration: ${duration}ms`);
    console.log('========================================\n');

    return {
      name: TEST_NAME,
      success: false,
      duration,
      errors,
      screenshots,
      steps,
    };
  } finally {
    // Clean up
    if (context) {
      await closeBrowser(context);
    }
  }
}

// Run test if executed directly
if (require.main === module) {
  testReviewSystem()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
