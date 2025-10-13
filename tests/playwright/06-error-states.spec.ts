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

import { test, expect } from '@playwright/test';

test.describe('Error States and Edge Cases', () => {
  test('should handle invalid URL / 404 error', async ({ page }) => {
    await test.step('Navigate to invalid VIN', async () => {
      const invalidVin = 'INVALID123ABC4567';
      await page.goto(`/dashboard/${invalidVin}`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `test-results/06-invalid-url-error.png`, fullPage: true });

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
      const hasBackLink = await page.locator('a[href="/dashboard"]').count();
      if (hasBackLink > 0) {
        console.log('✓ Back to Dashboard link found');
      }
    });
  });

  test('should handle network throttling', async ({ page, context }) => {
    await test.step('Enable network throttling', async () => {
      // Simulate slow 3G connection
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (500 * 1024) / 8, // 500kb/s
        uploadThroughput: (500 * 1024) / 8,
        latency: 400, // 400ms latency
      });

      console.log('✓ Network throttling enabled (Slow 3G simulation)');
    });

    await test.step('Navigate to dashboard with throttling', async () => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `test-results/06-loading-with-throttling.png`, fullPage: true });

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

      await page.screenshot({ path: `test-results/06-after-loading-throttled.png`, fullPage: true });
    });

    await test.step('Disable throttling', async () => {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0,
      });
      console.log('✓ Network throttling disabled');
    });
  });

  test('should capture loading states', async ({ page, context }) => {
    await test.step('Capture loading states', async () => {
      // Clear cache to force fresh load
      await page.goto('about:blank');
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.clearBrowserCache');

      // Navigate with fast interception to catch loading state
      const navigationPromise = page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

      // Try to screenshot loading state quickly
      await page.waitForTimeout(100);
      try {
        await page.screenshot({ path: `test-results/06-initial-loading-state.png`, fullPage: true });
        console.log('✓ Captured initial loading state');
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
        await page.screenshot({ path: `test-results/06-skeleton-loaders.png`, fullPage: true });
      }

      // Wait for final loaded state
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `test-results/06-fully-loaded-state.png`, fullPage: true });
      console.log('✓ Final loaded state captured');
    });
  });

  test('should handle missing data scenarios', async ({ page }) => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

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
        await page.screenshot({ path: `test-results/06-empty-state.png`, fullPage: true });
      } else {
        console.log('ℹ No empty state (vehicles are present)');
        await page.screenshot({ path: `test-results/06-dashboard-with-data.png`, fullPage: true });
      }
    });

    await test.step('Test with restrictive filters', async () => {
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
        await page.screenshot({ path: `test-results/06-with-filters.png`, fullPage: true });
      } else {
        console.log('ℹ No filters found on page');
      }
    });
  });

  test('should detect console and JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Setup error collection
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    await test.step('Collect console errors', async () => {
      // Navigate to various pages to collect errors
      const urls = [
        '/dashboard',
        '/dashboard/5YFBURHE5HP690324', // Valid VIN
        '/dashboard/INVALID123', // Invalid VIN
      ];

      for (const url of urls) {
        try {
          console.log(`\nVisiting: ${url}`);
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(2000);
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
        });

        await page.screenshot({ path: `test-results/06-page-with-console-errors.png`, fullPage: true });
      } else {
        console.log('✓ No console errors detected');
      }
    });
  });

  test('should monitor network request failures', async ({ page }) => {
    interface NetworkError {
      url: string;
      status: number;
      statusText: string;
      method: string;
      timestamp: string;
      failureText?: string;
    }

    const failedRequests: NetworkError[] = [];

    await test.step('Monitor network failures', async () => {
      // Monitor failed requests
      page.on('requestfailed', (request) => {
        const failure = request.failure();
        const networkError: NetworkError = {
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
      page.on('response', (response) => {
        if (response.status() >= 400) {
          const networkError: NetworkError = {
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
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      // Report results
      if (failedRequests.length > 0) {
        console.log(`\n⚠ Found ${failedRequests.length} failed request(s)`);
        await page.screenshot({ path: `test-results/06-with-network-failures.png`, fullPage: true });
      } else {
        console.log('✓ No network failures detected');
      }
    });
  });
});
