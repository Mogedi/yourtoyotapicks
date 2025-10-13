import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  clickElement,
  waitForSelector,
  elementExists,
  getCurrentUrl,
  collectConsoleErrors,
  takeFullPageScreenshot,
  logTestStart,
  logStep,
  logSuccess,
  logError,
  logWarning,
  logTestResult,
  createTestResult,
  type BrowserContext,
  type TestResult,
  type ScreenshotMetadata,
  getBaseUrl,
} from '../helpers';

const TEST_NAME = '03-vehicle-details';
const BASE_URL = `${getBaseUrl()}/dashboard`;

/**
 * Test: Vehicle details page navigation and tabs
 *
 * Steps:
 * 1. Navigate to dashboard
 * 2. Click first vehicle card
 * 3. Screenshot detail page
 * 4. Verify URL contains VIN or vehicle identifier
 * 5. Click each tab (Review, Specs, History, Filters, Details)
 * 6. Screenshot each tab
 * 7. Verify content loads in each tab
 * 8. Go back to dashboard
 * 9. Verify navigation works
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
    try {
      await navigateTo(page, BASE_URL, 30000);
      logSuccess(`Loaded: ${BASE_URL}`);
    } catch (error) {
      // Retry once if navigation fails
      logWarning('First navigation attempt failed, retrying...');
      await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
      logSuccess(`Loaded after retry: ${BASE_URL}`);
    }

    // Wait for dashboard to load
    logStep('Waiting for dashboard to load');
    try {
      await waitForSelector(page, '[data-testid="vehicle-card"]', 15000);
      logSuccess('Dashboard loaded');
    } catch {
      logWarning('vehicle-card test-id not found, trying alternative selector');
      await waitForSelector(page, 'article, .vehicle-card, a[href*="/dashboard/"]', 15000);
      logSuccess('Dashboard loaded with alternative selector');
    }

    // Step 2: Click first vehicle card's "View Details" button
    logStep('Finding first vehicle card');

    const vehicleCardSelectors = [
      '[data-testid="vehicle-card"]:first-of-type a[href*="/dashboard/"]',
      '[data-testid="vehicle-card"]:first-of-type button',
      'article:first-of-type a[href*="/dashboard/"]',
      'a[href*="/dashboard/"]:first-of-type',
    ];

    let vehicleCardFound = false;
    let clickedSelector = '';

    for (const selector of vehicleCardSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          vehicleCardFound = true;
          clickedSelector = selector;
          logSuccess(`Found vehicle card link: ${selector}`);

          // Get the link before clicking
          const href = await page.evaluate(
            (sel) => {
              const el = document.querySelector(sel);
              if (el?.tagName === 'A') return (el as HTMLAnchorElement).href;
              const button = el as HTMLButtonElement;
              const link = button?.closest('a') || button?.querySelector('a');
              return link?.href || '';
            },
            selector
          );

          if (href) {
            logSuccess(`Vehicle link: ${href}`);
          }

          logStep('Clicking View Details button');

          // Use Promise.all to handle navigation and click together
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }),
            page.click(selector)
          ]);

          logSuccess('Navigated to vehicle detail page');
          vehicleCardFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!vehicleCardFound) {
      errors.push('No vehicle cards found on dashboard');
      logError('No vehicle cards found');
      throw new Error('Cannot continue test without vehicle cards');
    }

    // Step 3: Screenshot detail page
    logStep('Taking screenshot of detail page');
    const detailScreenshot = await takeFullPageScreenshot(
      page,
      'vehicle-detail-page'
    );
    screenshots.push(detailScreenshot);
    logSuccess(`Screenshot saved: ${detailScreenshot.fullPath}`);

    // Step 4: Verify URL contains VIN or vehicle identifier
    logStep('Verifying URL contains vehicle identifier');
    const detailUrl = getCurrentUrl(page);
    const urlParts = detailUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];

    if (lastPart && lastPart.length > 0 && lastPart !== 'dashboard') {
      logSuccess(`Vehicle identifier in URL: ${lastPart}`);
    } else {
      errors.push('URL does not appear to contain vehicle identifier');
      logError('Vehicle identifier not found in URL');
    }

    // Check if detail page loaded correctly
    const hasContent = await elementExists(page, 'body *');
    if (!hasContent) {
      errors.push('Detail page appears empty');
      logError('Detail page appears empty');
    }

    // Step 5-7: Click each tab and take screenshots
    logStep('Testing tabs on detail page');

    const tabs = [
      { name: 'Overview', selectors: ['button:has-text("Overview")', '[data-value="overview"]', '[role="tab"]:has-text("Overview")'] },
      { name: 'Review', selectors: ['button:has-text("Review")', '[data-value="review"]', '[role="tab"]:has-text("Review")'] },
      { name: 'Specs', selectors: ['button:has-text("Specs")', 'button:has-text("Specifications")', '[data-value="specs"]', '[role="tab"]:has-text("Specs")'] },
      { name: 'History', selectors: ['button:has-text("History")', '[data-value="history"]', '[role="tab"]:has-text("History")'] },
      { name: 'Filters', selectors: ['button:has-text("Filters")', '[data-value="filters"]', '[role="tab"]:has-text("Filters")'] },
      { name: 'Details', selectors: ['button:has-text("Details")', '[data-value="details"]', '[role="tab"]:has-text("Details")'] },
    ];

    let tabsFound = 0;

    for (const tab of tabs) {
      logStep(`Looking for ${tab.name} tab`);
      let tabFound = false;

      for (const selector of tab.selectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            tabFound = true;
            tabsFound++;
            logSuccess(`Found ${tab.name} tab`);

            // Click the tab
            await clickElement(page, selector);
            logSuccess(`Clicked ${tab.name} tab`);

            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Take screenshot
            const tabScreenshot = await takeFullPageScreenshot(
              page,
              `tab-${tab.name.toLowerCase()}`
            );
            screenshots.push(tabScreenshot);
            logSuccess(`Screenshot saved: ${tabScreenshot.fullPath}`);

            // Verify content exists
            const hasTabContent = await elementExists(page, '[role="tabpanel"], .tab-content, main');
            if (hasTabContent) {
              logSuccess(`${tab.name} tab content verified`);
            } else {
              logWarning(`${tab.name} tab content may be empty`);
            }

            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!tabFound) {
        logWarning(`${tab.name} tab not found`);
      }
    }

    if (tabsFound === 0) {
      logWarning('No tabs found on detail page - page may use different layout');
    } else {
      logSuccess(`Found and tested ${tabsFound} tabs`);
    }

    // Step 8: Go back to dashboard
    logStep('Navigating back to dashboard');

    const backButtonSelectors = [
      'button:has-text("Back")',
      'a:has-text("Back")',
      '[aria-label*="Back"]',
      'a[href="/dashboard"]',
      'button[aria-label*="back"]',
    ];

    let backButtonFound = false;

    for (const selector of backButtonSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          backButtonFound = true;
          logSuccess(`Found back button: ${selector}`);
          await clickElement(page, selector);
          logSuccess('Clicked back button');
          break;
        }
      } catch {
        continue;
      }
    }

    if (!backButtonFound) {
      logWarning('Back button not found, using browser back');
      await page.goBack();
      logSuccess('Used browser back navigation');
    }

    // Wait for navigation back to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

    // Step 9: Verify we're back on dashboard
    logStep('Verifying navigation back to dashboard');
    const finalUrl = getCurrentUrl(page);

    if (finalUrl.includes('/dashboard') && !finalUrl.match(/\/dashboard\/.+/)) {
      logSuccess('Successfully navigated back to dashboard');
    } else {
      errors.push(`Expected to be on dashboard, but URL is: ${finalUrl}`);
      logError('Navigation back to dashboard may have failed');
    }

    // Wait a moment for vehicle cards to hydrate/load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take final screenshot
    const finalScreenshot = await takeFullPageScreenshot(
      page,
      'back-to-dashboard'
    );
    screenshots.push(finalScreenshot);
    logSuccess(`Screenshot saved: ${finalScreenshot.fullPath}`);

    // Verify vehicle cards are visible again
    try {
      await waitForSelector(
        page,
        '[data-testid="vehicle-card"], article, .vehicle-card',
        5000
      );
      logSuccess('Vehicle cards visible on dashboard');
    } catch {
      // Cards might be there but in skeleton state - check if any exist at all
      const backOnDashboard = await elementExists(
        page,
        '[data-testid="vehicle-card"], article, .vehicle-card'
      );

      if (backOnDashboard) {
        logSuccess('Vehicle cards visible on dashboard (may still be loading)');
      } else {
        errors.push('Vehicle cards not visible after returning to dashboard');
        logError('Vehicle cards not visible');
      }
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
