import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  clickElement,
  waitForSelector,
  getElementCount,
  collectConsoleErrors,
  getCurrentUrl,
  takeFullPageScreenshot,
  logTestStart,
  logStep,
  logSuccess,
  logError,
  logWarning,
  logTestResult,
  createTestResult,
  getBaseUrl,
  type BrowserContext,
  type TestResult,
  type ScreenshotMetadata,
} from '../helpers';

const TEST_NAME = '01-landing-to-dashboard';
const BASE_URL = getBaseUrl();

/**
 * Test: Navigate from landing page to dashboard
 *
 * Steps:
 * 1. Navigate to landing page
 * 2. Take screenshot of landing page
 * 3. Click "View Dashboard" button
 * 4. Wait for navigation to dashboard
 * 5. Take screenshot of dashboard
 * 6. Verify 32+ vehicle cards exist
 * 7. Check for console errors
 * 8. Return test result
 */
export async function runTest(): Promise<TestResult> {
  const startTime = Date.now();
  const screenshots: ScreenshotMetadata[] = [];
  const errors: string[] = [];
  let context: BrowserContext | null = null;

  logTestStart(TEST_NAME);

  try {
    // Launch browser
    logStep('Launching browser');
    context = await launchBrowser();
    const { page } = context;

    // Collect console errors
    const consoleErrors = collectConsoleErrors(page);

    // Step 1: Navigate to landing page
    logStep('Navigating to landing page');
    await navigateTo(page, BASE_URL);
    logSuccess(`Loaded: ${BASE_URL}`);

    // Step 2: Screenshot landing page
    logStep('Taking screenshot of landing page');
    const landingScreenshot = await takeFullPageScreenshot(
      page,
      'landing-page'
    );
    screenshots.push(landingScreenshot);
    logSuccess(`Screenshot saved: ${landingScreenshot.fullPath}`);

    // Verify landing page elements
    logStep('Verifying landing page elements');
    const titleExists = await page.$('h1');
    if (!titleExists) {
      errors.push('Landing page title not found');
      logError('Landing page title not found');
    } else {
      const titleText = await page.$eval('h1', (el) => el.textContent);
      if (titleText?.includes('YourToyotaPicks')) {
        logSuccess('Landing page title verified');
      } else {
        errors.push('Landing page title text incorrect');
        logError('Landing page title text incorrect');
      }
    }

    // Step 3: Click "View Dashboard" button
    logStep('Looking for "View Dashboard" button');
    const dashboardLink = await page.$('a[href="/dashboard"]');
    if (!dashboardLink) {
      errors.push('Dashboard link not found');
      logError('Dashboard link not found');
      throw new Error('Dashboard link not found - cannot continue test');
    }
    logSuccess('Dashboard link found');

    logStep('Clicking "View Dashboard" button');
    await clickElement(page, 'a[href="/dashboard"]');
    logSuccess('Clicked dashboard link');

    // Step 4: Wait for navigation
    logStep('Waiting for navigation to dashboard');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    const currentUrl = getCurrentUrl(page);

    if (!currentUrl.includes('/dashboard')) {
      errors.push(`Navigation failed - current URL: ${currentUrl}`);
      logError(`Navigation failed - expected /dashboard, got: ${currentUrl}`);
    } else {
      logSuccess(`Navigated to dashboard: ${currentUrl}`);
    }

    // Step 5: Screenshot dashboard
    logStep('Taking screenshot of dashboard');
    const dashboardScreenshot = await takeFullPageScreenshot(
      page,
      'dashboard-loaded'
    );
    screenshots.push(dashboardScreenshot);
    logSuccess(`Screenshot saved: ${dashboardScreenshot.fullPath}`);

    // Step 6: Verify vehicle cards
    logStep('Counting vehicle cards');

    // Wait for vehicle cards to load
    try {
      await waitForSelector(page, '[data-testid="vehicle-card"]', 15000);
    } catch (error) {
      logWarning('vehicle-card test-id not found, trying alternative selectors');

      // Try alternative selectors
      const alternativeSelectors = [
        '.vehicle-card',
        'article',
        '[role="article"]',
        'div[class*="card"]',
      ];

      let found = false;
      for (const selector of alternativeSelectors) {
        try {
          await waitForSelector(page, selector, 5000);
          const count = await getElementCount(page, selector);
          if (count > 0) {
            logSuccess(`Found ${count} elements using selector: ${selector}`);
            found = true;

            if (count >= 88) {
              logSuccess(`✓ Verified: ${count} vehicle cards (≥ 88 expected with Marketcheck)`);
            } else if (count >= 32) {
              logWarning(`Found ${count} vehicle cards (expected ≥ 88, may be using mock data)`);
            } else {
              errors.push(`Only ${count} vehicle cards found (expected ≥ 88 or ≥ 32)`);
              logWarning(`Only ${count} vehicle cards found (expected ≥ 88 or ≥ 32)`);
            }
            break;
          }
        } catch {
          continue;
        }
      }

      if (!found) {
        errors.push('No vehicle cards found on dashboard');
        logError('No vehicle cards found on dashboard');
      }
    }

    const vehicleCount = await getElementCount(page, '[data-testid="vehicle-card"]');
    if (vehicleCount >= 88) {
      logSuccess(`✓ Verified: ${vehicleCount} vehicle cards (≥ 88 expected with Marketcheck data)`);
    } else if (vehicleCount >= 32) {
      logWarning(`Found ${vehicleCount} vehicle cards (expected ≥ 88 with Marketcheck, falling back to mock data)`);
    } else if (vehicleCount > 0) {
      errors.push(`Only ${vehicleCount} vehicle cards found (expected ≥ 88 with Marketcheck or ≥ 32 with mock)`);
      logWarning(`Only ${vehicleCount} vehicle cards found (expected ≥ 88 or ≥ 32)`);
    }

    // Step 7: Check for console errors
    logStep('Checking for console errors');
    if (consoleErrors.length > 0) {
      logWarning(`Found ${consoleErrors.length} console errors`);
      consoleErrors.forEach((error) => {
        errors.push(`Console error: ${error}`);
        logError(error);
      });
    } else {
      logSuccess('No console errors detected');
    }

    // Calculate duration
    const duration = Date.now() - startTime;

    // Create result
    const result = createTestResult(
      TEST_NAME,
      errors.length === 0,
      duration,
      screenshots,
      errors
    );

    logTestResult(result);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    errors.push(`Test failed with exception: ${errorMessage}`);
    logError(`Test failed: ${errorMessage}`);

    const result = createTestResult(
      TEST_NAME,
      false,
      duration,
      screenshots,
      errors
    );

    logTestResult(result);

    return result;
  } finally {
    // Cleanup
    if (context) {
      logStep('Closing browser');
      await closeBrowser(context);
      logSuccess('Browser closed');
    }
  }
}

// Allow running this test directly
if (require.main === module) {
  runTest()
    .then((result) => {
      process.exit(result.passed ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
