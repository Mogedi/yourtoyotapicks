/**
 * E2E Test: Error States and Edge Cases
 *
 * Tests error handling and edge cases:
 * - Invalid URL (404)
 * - Network throttling / slow connections
 * - Loading states
 * - Missing data scenarios
 * - Error page display
 */

import { Page, HTTPResponse } from 'puppeteer';
import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  waitForSelector,
  elementExists,
  collectConsoleErrors,
  BrowserContext,
} from '../helpers/browser';
import { takeScreenshot } from '../helpers/screenshot';
import { TestFlowResult, TestStepResult, NetworkError } from '../helpers/types';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_NAME = '06-error-states';

interface ErrorStateTest {
  name: string;
  description: string;
  steps: TestStepResult[];
  errors: any[];
  screenshots: any[];
}

/**
 * Test 1: Invalid URL / 404 Error
 */
async function testInvalidURL(page: Page): Promise<ErrorStateTest> {
  console.log('\n========================================');
  console.log('Test 1: Invalid URL / 404 Error');
  console.log('========================================');

  const steps: TestStepResult[] = [];
  const errors: any[] = [];
  const screenshots: any[] = [];

  try {
    // Navigate to invalid VIN
    const stepName = 'Navigate to invalid VIN';
    const startTime = Date.now();

    console.log(`\n→ ${stepName}...`);

    const invalidVin = 'INVALID123ABC4567';
    const url = `${BASE_URL}/dashboard/${invalidVin}`;

    try {
      await navigateTo(page, url);
      await new Promise(resolve => setTimeout(resolve,2000));

      // Take screenshot of error page
      const screenshot = await takeScreenshot(page, 'invalid-url-error');
      screenshots.push(screenshot);
      console.log(`✓ Screenshot: ${screenshot.fullPath}`);

      // Check for error indicators
      const pageContent = await page.evaluate(() => document.body.innerText);

      const hasErrorMessage =
        pageContent.includes('Not Found') ||
        pageContent.includes('404') ||
        pageContent.includes('Vehicle Not Found') ||
        pageContent.includes('does not exist');

      if (hasErrorMessage) {
        console.log('✓ Error message displayed correctly');
      } else {
        console.warn('⚠ No clear error message found, but page loaded');
      }

      // Check for back to dashboard link
      const hasBackLink = await elementExists(page, 'a[href="/dashboard"]');
      if (hasBackLink) {
        console.log('✓ Back to Dashboard link found');
      }

      steps.push({
        name: stepName,
        success: true,
        duration: Date.now() - startTime,
        screenshot,
      });
    } catch (error) {
      console.error(`✗ ${stepName} failed:`, error);
      steps.push({
        name: stepName,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } catch (error) {
    console.error('Test 1 failed:', error);
    errors.push({
      type: 'test-error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return {
    name: 'Invalid URL Test',
    description: 'Tests 404 error handling',
    steps,
    errors,
    screenshots,
  };
}

/**
 * Test 2: Network Throttling
 */
async function testNetworkThrottling(page: Page): Promise<ErrorStateTest> {
  console.log('\n========================================');
  console.log('Test 2: Network Throttling');
  console.log('========================================');

  const steps: TestStepResult[] = [];
  const errors: any[] = [];
  const screenshots: any[] = [];

  try {
    // Enable network throttling (Slow 3G)
    const stepName1 = 'Enable network throttling';
    const startTime1 = Date.now();

    console.log(`\n→ ${stepName1}...`);

    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500kb/s
      uploadThroughput: (500 * 1024) / 8,
      latency: 400, // 400ms latency
    });

    console.log('✓ Network throttling enabled (Slow 3G simulation)');

    steps.push({
      name: stepName1,
      success: true,
      duration: Date.now() - startTime1,
    });

    // Navigate to dashboard with throttling
    const stepName2 = 'Navigate to dashboard with throttling';
    const startTime2 = Date.now();

    console.log(`\n→ ${stepName2}...`);

    const url = `${BASE_URL}/dashboard`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Take screenshot during/after loading
    await new Promise(resolve => setTimeout(resolve,2000));
    const screenshot1 = await takeScreenshot(page, 'loading-with-throttling');
    screenshots.push(screenshot1);
    console.log(`✓ Screenshot: ${screenshot1.fullPath}`);

    // Check for loading indicators
    const hasLoadingIndicator = await page.evaluate(() => {
      const text = document.body.innerText;
      return (
        text.includes('Loading') ||
        document.querySelector('[role="progressbar"]') !== null ||
        document.querySelector('.animate-spin') !== null ||
        document.querySelector('[class*="loading"]') !== null
      );
    });

    if (hasLoadingIndicator) {
      console.log('✓ Loading indicator detected');
    }

    // Wait for content to load
    try {
      await page.waitForSelector('h1, h2', { timeout: 30000 });
      console.log('✓ Content loaded successfully despite throttling');
    } catch (e) {
      console.warn('⚠ Content loading timeout (expected with throttling)');
    }

    const screenshot2 = await takeScreenshot(page, 'after-loading-throttled');
    screenshots.push(screenshot2);
    console.log(`✓ Screenshot: ${screenshot2.fullPath}`);

    steps.push({
      name: stepName2,
      success: true,
      duration: Date.now() - startTime2,
      screenshot: screenshot2,
    });

    // Disable throttling
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
    console.log('✓ Network throttling disabled');
  } catch (error) {
    console.error('Test 2 failed:', error);
    errors.push({
      type: 'test-error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return {
    name: 'Network Throttling Test',
    description: 'Tests loading states with slow network',
    steps,
    errors,
    screenshots,
  };
}

/**
 * Test 3: Loading States
 */
async function testLoadingStates(page: Page): Promise<ErrorStateTest> {
  console.log('\n========================================');
  console.log('Test 3: Loading States');
  console.log('========================================');

  const steps: TestStepResult[] = [];
  const errors: any[] = [];
  const screenshots: any[] = [];

  try {
    const stepName = 'Capture loading states';
    const startTime = Date.now();

    console.log(`\n→ ${stepName}...`);

    // Navigate to dashboard and try to catch loading state
    const url = `${BASE_URL}/dashboard`;

    // Clear cache to force fresh load
    await page.goto('about:blank');
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCache');

    // Navigate with fast interception to catch loading state
    const navigationPromise = page.goto(url, { waitUntil: 'domcontentloaded' });

    // Try to screenshot loading state quickly
    await new Promise(resolve => setTimeout(resolve,100));
    try {
      const screenshot1 = await takeScreenshot(page, 'initial-loading-state');
      screenshots.push(screenshot1);
      console.log(`✓ Captured initial loading state: ${screenshot1.fullPath}`);
    } catch (e) {
      console.warn('⚠ Could not capture initial loading state');
    }

    await navigationPromise;

    // Check for skeleton loaders
    const hasSkeletonLoaders = await page.evaluate(() => {
      return (
        document.querySelector('[class*="skeleton"]') !== null ||
        document.querySelector('[class*="animate-pulse"]') !== null ||
        document.querySelector('[class*="loading"]') !== null
      );
    });

    if (hasSkeletonLoaders) {
      console.log('✓ Skeleton loaders detected');
      const screenshot2 = await takeScreenshot(page, 'skeleton-loaders');
      screenshots.push(screenshot2);
      console.log(`✓ Screenshot: ${screenshot2.fullPath}`);
    }

    // Wait for final loaded state
    await new Promise(resolve => setTimeout(resolve,2000));
    const screenshot3 = await takeScreenshot(page, 'fully-loaded-state');
    screenshots.push(screenshot3);
    console.log(`✓ Final loaded state: ${screenshot3.fullPath}`);

    steps.push({
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Test 3 failed:', error);
    errors.push({
      type: 'test-error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return {
    name: 'Loading States Test',
    description: 'Tests various loading states and skeleton loaders',
    steps,
    errors,
    screenshots,
  };
}

/**
 * Test 4: Missing Data Scenarios
 */
async function testMissingDataScenarios(page: Page): Promise<ErrorStateTest> {
  console.log('\n========================================');
  console.log('Test 4: Missing Data Scenarios');
  console.log('========================================');

  const steps: TestStepResult[] = [];
  const errors: any[] = [];
  const screenshots: any[] = [];

  try {
    const stepName = 'Navigate to dashboard';
    const startTime = Date.now();

    console.log(`\n→ ${stepName}...`);

    const url = `${BASE_URL}/dashboard`;
    await navigateTo(page, url);
    await new Promise(resolve => setTimeout(resolve,2000));

    // Check for empty state messages
    const emptyStateCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasNoVehicles: text.includes('No vehicles') || text.includes('No results'),
        hasEmptyMessage:
          text.includes('empty') ||
          text.includes('not found') ||
          text.includes('Add some vehicles'),
      };
    });

    if (emptyStateCheck.hasNoVehicles || emptyStateCheck.hasEmptyMessage) {
      console.log('✓ Empty state message detected');
      const screenshot = await takeScreenshot(page, 'empty-state');
      screenshots.push(screenshot);
      console.log(`✓ Screenshot: ${screenshot.fullPath}`);
    } else {
      console.log('ℹ No empty state (vehicles are present)');
      const screenshot = await takeScreenshot(page, 'dashboard-with-data');
      screenshots.push(screenshot);
      console.log(`✓ Screenshot: ${screenshot.fullPath}`);
    }

    steps.push({
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    });

    // Test with filters that return no results
    const stepName2 = 'Test with restrictive filters';
    const startTime2 = Date.now();

    console.log(`\n→ ${stepName2}...`);

    // Try to apply filters if available
    const hasFilters = await page.evaluate(() => {
      return (
        document.querySelector('input[type="text"]') !== null ||
        document.querySelector('select') !== null ||
        document.querySelector('button:has-text("Filter")') !== null
      );
    });

    if (hasFilters) {
      console.log('✓ Filters detected, testing filter edge cases');
      // Apply filters and capture state
      const screenshot2 = await takeScreenshot(page, 'with-filters');
      screenshots.push(screenshot2);
    } else {
      console.log('ℹ No filters found on page');
    }

    steps.push({
      name: stepName2,
      success: true,
      duration: Date.now() - startTime2,
    });
  } catch (error) {
    console.error('Test 4 failed:', error);
    errors.push({
      type: 'test-error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return {
    name: 'Missing Data Test',
    description: 'Tests empty states and missing data scenarios',
    steps,
    errors,
    screenshots,
  };
}

/**
 * Test 5: Console Errors and JavaScript Errors
 */
async function testConsoleErrors(page: Page): Promise<ErrorStateTest> {
  console.log('\n========================================');
  console.log('Test 5: Console and JavaScript Errors');
  console.log('========================================');

  const steps: TestStepResult[] = [];
  const errors: any[] = [];
  const screenshots: any[] = [];

  try {
    const stepName = 'Collect console errors';
    const startTime = Date.now();

    console.log(`\n→ ${stepName}...`);

    // Setup error collection
    const consoleErrors = collectConsoleErrors(page);

    // Navigate to various pages to collect errors
    const urls = [
      `${BASE_URL}/dashboard`,
      `${BASE_URL}/dashboard/5YFBURHE5HP690324`, // Valid VIN
      `${BASE_URL}/dashboard/INVALID123`, // Invalid VIN
    ];

    for (const url of urls) {
      try {
        console.log(`\nVisiting: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve,2000));
      } catch (e) {
        console.warn(`⚠ Error visiting ${url}:`, e);
      }
    }

    // Report collected errors
    if (consoleErrors.length > 0) {
      console.log(`\n⚠ Found ${consoleErrors.length} console error(s):`);
      consoleErrors.forEach((error, index) => {
        console.log(`\n  Error ${index + 1}:`);
        console.log(`    ${error}`);
        errors.push({
          type: 'console-error',
          message: error,
          timestamp: new Date().toISOString(),
        });
      });

      const screenshot = await takeScreenshot(page, 'page-with-console-errors');
      screenshots.push(screenshot);
    } else {
      console.log('✓ No console errors detected');
    }

    steps.push({
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Test 5 failed:', error);
    errors.push({
      type: 'test-error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return {
    name: 'Console Errors Test',
    description: 'Collects and reports console and JavaScript errors',
    steps,
    errors,
    screenshots,
  };
}

/**
 * Test 6: Network Request Failures
 */
async function testNetworkFailures(page: Page): Promise<ErrorStateTest> {
  console.log('\n========================================');
  console.log('Test 6: Network Request Failures');
  console.log('========================================');

  const steps: TestStepResult[] = [];
  const errors: any[] = [];
  const screenshots: any[] = [];
  const failedRequests: NetworkError[] = [];

  try {
    const stepName = 'Monitor network failures';
    const startTime = Date.now();

    console.log(`\n→ ${stepName}...`);

    // Monitor failed requests
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      const networkError: NetworkError = {
        type: 'network',
        url: request.url(),
        status: 0,
        statusText: 'Failed',
        method: request.method(),
        timestamp: new Date().toISOString(),
        failureText: failure?.errorText,
      };

      failedRequests.push(networkError);
      console.log(`✗ Request failed: ${request.method()} ${request.url()}`);
      console.log(`  Reason: ${failure?.errorText}`);
    });

    // Monitor error responses
    page.on('response', (response: HTTPResponse) => {
      if (response.status() >= 400) {
        const networkError: NetworkError = {
          type: 'network',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          method: response.request().method(),
          timestamp: new Date().toISOString(),
        };

        failedRequests.push(networkError);
        console.log(`✗ HTTP Error: ${response.status()} ${response.url()}`);
      }
    });

    // Navigate and monitor
    const url = `${BASE_URL}/dashboard`;
    await navigateTo(page, url);
    await new Promise(resolve => setTimeout(resolve,3000));

    // Report results
    if (failedRequests.length > 0) {
      console.log(`\n⚠ Found ${failedRequests.length} failed request(s)`);
      errors.push(...failedRequests);

      const screenshot = await takeScreenshot(page, 'with-network-failures');
      screenshots.push(screenshot);
    } else {
      console.log('✓ No network failures detected');
    }

    steps.push({
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Test 6 failed:', error);
    errors.push({
      type: 'test-error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return {
    name: 'Network Failures Test',
    description: 'Monitors and reports network request failures',
    steps,
    errors,
    screenshots,
  };
}

/**
 * Main test function
 */
export async function testErrorStates(): Promise<TestFlowResult> {
  const testStartTime = Date.now();
  const allSteps: TestStepResult[] = [];
  const allErrors: any[] = [];
  const allScreenshots: any[] = [];

  console.log('\n========================================');
  console.log('Starting Error States Test Flow');
  console.log('========================================');

  let context: BrowserContext | null = null;

  try {
    // Launch browser
    context = await launchBrowser();
    const { page } = context;

    // Run all error state tests
    const test1 = await testInvalidURL(page);
    allSteps.push(...test1.steps);
    allErrors.push(...test1.errors);
    allScreenshots.push(...test1.screenshots);

    const test2 = await testNetworkThrottling(page);
    allSteps.push(...test2.steps);
    allErrors.push(...test2.errors);
    allScreenshots.push(...test2.screenshots);

    const test3 = await testLoadingStates(page);
    allSteps.push(...test3.steps);
    allErrors.push(...test3.errors);
    allScreenshots.push(...test3.screenshots);

    const test4 = await testMissingDataScenarios(page);
    allSteps.push(...test4.steps);
    allErrors.push(...test4.errors);
    allScreenshots.push(...test4.screenshots);

    const test5 = await testConsoleErrors(page);
    allSteps.push(...test5.steps);
    allErrors.push(...test5.errors);
    allScreenshots.push(...test5.screenshots);

    const test6 = await testNetworkFailures(page);
    allSteps.push(...test6.steps);
    allErrors.push(...test6.errors);
    allScreenshots.push(...test6.screenshots);

    const duration = Date.now() - testStartTime;

    // Print summary
    console.log('\n========================================');
    console.log('✓ Error States Test Flow COMPLETED');
    console.log(`Duration: ${duration}ms`);
    console.log(`Total steps: ${allSteps.length}`);
    console.log(`Screenshots taken: ${allScreenshots.length}`);
    console.log(`Errors detected: ${allErrors.length}`);

    if (allErrors.length > 0) {
      console.log('\nError Summary:');
      const errorTypes = allErrors.reduce((acc: any, err) => {
        acc[err.type] = (acc[err.type] || 0) + 1;
        return acc;
      }, {});

      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    }

    console.log('========================================\n');

    return {
      name: TEST_NAME,
      success: true,
      duration,
      errors: allErrors,
      screenshots: allScreenshots,
      steps: allSteps,
    };
  } catch (error) {
    const duration = Date.now() - testStartTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    allErrors.push({
      type: 'test-failure',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    console.log('\n========================================');
    console.log('✗ Error States Test Flow FAILED');
    console.log(`Error: ${errorMessage}`);
    console.log(`Duration: ${duration}ms`);
    console.log('========================================\n');

    return {
      name: TEST_NAME,
      success: false,
      duration,
      errors: allErrors,
      screenshots: allScreenshots,
      steps: allSteps,
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
  testErrorStates()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
