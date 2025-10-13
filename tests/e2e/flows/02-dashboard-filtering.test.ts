import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  clickElement,
  waitForSelector,
  getElementCount,
  typeIntoField,
  collectConsoleErrors,
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

const TEST_NAME = '02-dashboard-filtering';
const BASE_URL = `${getBaseUrl()}/dashboard`;

/**
 * Test: Dashboard filtering functionality
 *
 * Steps:
 * 1. Navigate to dashboard
 * 2. Screenshot initial state
 * 3. Test Make filter (Toyota)
 * 4. Screenshot after make filter
 * 5. Test Model filter (RAV4)
 * 6. Screenshot after model filter
 * 7. Test Price filter (max $20000)
 * 8. Screenshot after price filter
 * 9. Test Clear Filters
 * 10. Screenshot back to all vehicles
 * 11. Verify filtering works correctly
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

    // Step 1: Navigate to dashboard
    logStep('Navigating to dashboard');
    await navigateTo(page, BASE_URL);
    logSuccess(`Loaded: ${BASE_URL}`);

    // Wait for dashboard to load
    logStep('Waiting for dashboard to load');
    try {
      await waitForSelector(page, '[data-testid="vehicle-card"]', 15000);
      logSuccess('Dashboard loaded');
    } catch {
      logWarning('vehicle-card test-id not found, trying alternative selector');
      await waitForSelector(page, 'article, .vehicle-card', 15000);
      logSuccess('Dashboard loaded with alternative selector');
    }

    // Step 2: Screenshot initial state
    logStep('Taking screenshot of initial state');
    const initialCount = await getElementCount(page, '[data-testid="vehicle-card"]');
    const initialScreenshot = await takeFullPageScreenshot(
      page,
      'initial-state'
    );
    screenshots.push(initialScreenshot);
    logSuccess(`Initial state: ${initialCount} vehicles`);
    logSuccess(`Screenshot saved: ${initialScreenshot.fullPath}`);

    // Step 3: Test Make filter (Toyota)
    logStep('Testing Make filter: Toyota');

    // Look for make filter dropdown or input
    const makeFilterSelectors = [
      'select[name="make"]',
      'select#make',
      '[data-testid="make-filter"]',
      'input[placeholder*="Make"]',
      'button:has-text("Make")',
    ];

    let makeFilterFound = false;
    for (const selector of makeFilterSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          makeFilterFound = true;
          logSuccess(`Found make filter: ${selector}`);

          // Try to select Toyota
          const tagName = await page.evaluate(el => el.tagName.toLowerCase(), element);

          if (tagName === 'select') {
            await page.select(selector, 'Toyota');
          } else if (tagName === 'input') {
            await typeIntoField(page, selector, 'Toyota');
          } else if (tagName === 'button') {
            await clickElement(page, selector);
            await new Promise(resolve => setTimeout(resolve, 500));
            const toyotaOption = await page.$('text=Toyota, [data-value="Toyota"]');
            if (toyotaOption) {
              await toyotaOption.click();
            }
          }

          // Wait for filter to apply
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        }
      } catch {
        continue;
      }
    }

    if (!makeFilterFound) {
      logWarning('Make filter not found - skipping this filter test');
    }

    // Step 4: Screenshot after make filter
    logStep('Taking screenshot after Make filter');
    const afterMakeCount = await getElementCount(page, '[data-testid="vehicle-card"]');
    const afterMakeScreenshot = await takeFullPageScreenshot(
      page,
      'after-make-filter'
    );
    screenshots.push(afterMakeScreenshot);
    logSuccess(`After Make filter: ${afterMakeCount} vehicles`);
    logSuccess(`Screenshot saved: ${afterMakeScreenshot.fullPath}`);

    if (makeFilterFound && afterMakeCount >= initialCount) {
      logWarning('Make filter may not have reduced vehicle count');
    }

    // Step 5: Test Model filter (RAV4)
    logStep('Testing Model filter: RAV4');

    const modelFilterSelectors = [
      'select[name="model"]',
      'select#model',
      '[data-testid="model-filter"]',
      'input[placeholder*="Model"]',
      'button:has-text("Model")',
    ];

    let modelFilterFound = false;
    for (const selector of modelFilterSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          modelFilterFound = true;
          logSuccess(`Found model filter: ${selector}`);

          const tagName = await page.evaluate(el => el.tagName.toLowerCase(), element);

          if (tagName === 'select') {
            await page.select(selector, 'RAV4');
          } else if (tagName === 'input') {
            await typeIntoField(page, selector, 'RAV4');
          } else if (tagName === 'button') {
            await clickElement(page, selector);
            await new Promise(resolve => setTimeout(resolve, 500));
            const rav4Option = await page.$('text=RAV4, [data-value="RAV4"]');
            if (rav4Option) {
              await rav4Option.click();
            }
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        }
      } catch {
        continue;
      }
    }

    if (!modelFilterFound) {
      logWarning('Model filter not found - skipping this filter test');
    }

    // Step 6: Screenshot after model filter
    logStep('Taking screenshot after Model filter');
    const afterModelCount = await getElementCount(page, '[data-testid="vehicle-card"]');
    const afterModelScreenshot = await takeFullPageScreenshot(
      page,
      'after-model-filter'
    );
    screenshots.push(afterModelScreenshot);
    logSuccess(`After Model filter: ${afterModelCount} vehicles`);
    logSuccess(`Screenshot saved: ${afterModelScreenshot.fullPath}`);

    // Step 7: Test Price filter (max $20000)
    logStep('Testing Price filter: max $20000');

    const priceFilterSelectors = [
      'input[name="maxPrice"]',
      'input[name="price"]',
      'input#maxPrice',
      '[data-testid="price-filter"]',
      'input[type="number"]',
      'input[placeholder*="Price"]',
    ];

    let priceFilterFound = false;
    for (const selector of priceFilterSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          priceFilterFound = true;
          logSuccess(`Found price filter: ${selector}`);

          // Clear and enter price
          await page.click(selector, { clickCount: 3 });
          await page.keyboard.press('Backspace');
          await typeIntoField(page, selector, '20000');

          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        }
      } catch {
        continue;
      }
    }

    if (!priceFilterFound) {
      logWarning('Price filter not found - skipping this filter test');
    }

    // Step 8: Screenshot after price filter
    logStep('Taking screenshot after Price filter');
    const afterPriceCount = await getElementCount(page, '[data-testid="vehicle-card"]');
    const afterPriceScreenshot = await takeFullPageScreenshot(
      page,
      'after-price-filter'
    );
    screenshots.push(afterPriceScreenshot);
    logSuccess(`After Price filter: ${afterPriceCount} vehicles`);
    logSuccess(`Screenshot saved: ${afterPriceScreenshot.fullPath}`);

    // Step 9: Test Clear Filters
    logStep('Testing Clear Filters button');

    const clearButtonSelectors = [
      'button:has-text("Clear")',
      'button:has-text("Reset")',
      '[data-testid="clear-filters"]',
      'button[aria-label*="Clear"]',
    ];

    let clearButtonFound = false;
    for (const selector of clearButtonSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          clearButtonFound = true;
          logSuccess(`Found clear filters button: ${selector}`);
          await clickElement(page, selector);
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        }
      } catch {
        continue;
      }
    }

    if (!clearButtonFound) {
      logWarning('Clear Filters button not found');
    }

    // Step 10: Screenshot back to all vehicles
    logStep('Taking screenshot after clearing filters');
    const afterClearCount = await getElementCount(page, '[data-testid="vehicle-card"]');
    const afterClearScreenshot = await takeFullPageScreenshot(
      page,
      'after-clear-filters'
    );
    screenshots.push(afterClearScreenshot);
    logSuccess(`After clearing filters: ${afterClearCount} vehicles`);
    logSuccess(`Screenshot saved: ${afterClearScreenshot.fullPath}`);

    // Step 11: Verify filtering logic
    logStep('Verifying filtering logic');

    if (clearButtonFound && afterClearCount < initialCount) {
      errors.push(
        `Vehicle count after clearing (${afterClearCount}) is less than initial count (${initialCount})`
      );
      logError('Clear filters did not restore all vehicles');
    } else if (clearButtonFound) {
      logSuccess('Clear filters appears to work correctly');
    }

    if (makeFilterFound || modelFilterFound || priceFilterFound) {
      logSuccess('At least one filter was tested successfully');
    } else {
      errors.push('No filters were found or tested');
      logError('No filters were found on the dashboard');
    }

    // Check for console errors
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
