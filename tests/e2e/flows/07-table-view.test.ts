import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  clickElement,
  waitForSelector,
  getElementCount,
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

const TEST_NAME = '07-table-view';
const BASE_URL = `${getBaseUrl()}/dashboard/table`;

/**
 * Test: Table view page functionality
 *
 * Steps:
 * 1. Navigate to table view page
 * 2. Verify table loads with vehicles
 * 3. Test column sorting
 * 4. Test search functionality
 * 5. Test filters (sidebar)
 * 6. Test multi-select checkboxes
 * 7. Test pagination
 * 8. Test view toggle navigation
 * 9. Verify stat cards display
 * 10. Check for console errors
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

    // Step 1: Navigate to table view
    logStep('Navigating to table view');
    await navigateTo(page, BASE_URL);
    logSuccess(`Loaded: ${BASE_URL}`);

    // Step 2: Wait for loading to complete and table to load
    logStep('Waiting for table to load');
    try {
      // Take screenshot of loading state
      const loadingScreenshot = await takeFullPageScreenshot(page, 'loading-state');
      screenshots.push(loadingScreenshot);
      logSuccess(`Loading state screenshot: ${loadingScreenshot.fullPath}`);

      // Wait for loading state to disappear (or either table or empty state to appear)
      await Promise.race([
        page.waitForFunction(
          () => !document.body.textContent?.includes('Loading vehicles'),
          { timeout: 15000 }
        ),
        page.waitForSelector('table', { timeout: 15000 }),
        page.waitForSelector('[class*="EmptyState"]', { timeout: 15000 }),
      ]);
      logSuccess('Loading completed');

      // Check what actually loaded
      const hasTable = await page.$('table');
      const hasEmptyState = await page.$('[class*="EmptyState"]');

      if (hasTable) {
        logSuccess('Table loaded');
      } else if (hasEmptyState) {
        logWarning('Empty state appeared - no vehicles to display');
        errors.push('No vehicles in table - empty state shown');
        throw new Error('Empty state - no vehicles to test');
      } else {
        errors.push('Table element not found after loading');
        logError('Table element not found after loading');
        throw new Error('Table not found - cannot continue test');
      }
    } catch (error) {
      const errorScreenshot = await takeFullPageScreenshot(page, 'error-state');
      screenshots.push(errorScreenshot);
      errors.push('Table loading failed or timeout');
      logError(`Table loading failed: ${error}`);
      throw new Error('Table not found - cannot continue test');
    }

    // Screenshot initial table state
    const initialScreenshot = await takeFullPageScreenshot(page, 'table-initial');
    screenshots.push(initialScreenshot);
    logSuccess(`Screenshot saved: ${initialScreenshot.fullPath}`);

    // Step 3: Verify stat cards
    logStep('Checking for stat cards');
    const statCardsExist = await page.$('[class*="StatCards"], .grid > .bg-white');
    if (statCardsExist) {
      logSuccess('Stat cards found');
    } else {
      logWarning('Stat cards not found - may not be implemented yet');
    }

    // Step 4: Count table rows
    logStep('Counting table rows');
    const rowCount = await getElementCount(page, 'tbody tr');
    if (rowCount > 0) {
      logSuccess(`Found ${rowCount} vehicle rows in table`);
    } else {
      errors.push('No vehicle rows found in table');
      logError('No vehicle rows found');
    }

    // Step 5: Test column sorting
    logStep('Testing column sorting');
    const sortableHeaders = await page.$$('th button, th[role="button"]');
    if (sortableHeaders.length > 0) {
      logSuccess(`Found ${sortableHeaders.length} sortable column headers`);

      // Click first sortable header
      await sortableHeaders[0].click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const afterSortScreenshot = await takeFullPageScreenshot(page, 'after-sort');
      screenshots.push(afterSortScreenshot);
      logSuccess('Column sort clicked');
    } else {
      logWarning('No sortable column headers found');
    }

    // Step 6: Test search functionality
    logStep('Testing search functionality');
    const searchInput = await page.$('input[type="text"]');
    if (searchInput) {
      await searchInput.type('Toyota');
      await new Promise(resolve => setTimeout(resolve, 1500));

      const afterSearchCount = await getElementCount(page, 'tbody tr');
      logSuccess(`Search applied - ${afterSearchCount} rows visible`);

      const searchScreenshot = await takeFullPageScreenshot(page, 'after-search');
      screenshots.push(searchScreenshot);

      // Clear search
      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      logWarning('Search input not found');
    }

    // Step 7: Test filter sidebar
    logStep('Testing filter sidebar');
    const filterSidebar = await page.$('aside');
    if (filterSidebar) {
      logSuccess('Filter sidebar found');

      // Look for filter controls
      const filterSelects = await page.$$('aside select');
      if (filterSelects.length > 0) {
        logSuccess(`Found ${filterSelects.length} filter dropdowns`);
      }
    } else {
      logWarning('Filter sidebar not found');
    }

    // Step 8: Test multi-select checkboxes
    logStep('Testing multi-select checkboxes');
    const headerCheckbox = await page.$('thead input[type="checkbox"]');
    if (headerCheckbox) {
      logSuccess('Header checkbox found');

      // Click to select all
      await headerCheckbox.click();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if bulk action bar appears
      const bulkActionBar = await page.$('[class*="BulkAction"], [class*="bulk-action"]');
      if (bulkActionBar) {
        logSuccess('Bulk action bar appeared after selection');

        const bulkScreenshot = await takeFullPageScreenshot(page, 'bulk-select');
        screenshots.push(bulkScreenshot);

        // Deselect all
        await headerCheckbox.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        logWarning('Bulk action bar not found after selection');
      }
    } else {
      logWarning('Multi-select checkboxes not found');
    }

    // Step 9: Test pagination
    logStep('Testing pagination');
    // Look for pagination buttons (page numbers, next/prev)
    const paginationButtons = await page.$$('button');
    const paginationButtonTexts = await Promise.all(
      paginationButtons.map(btn => btn.evaluate(el => el.textContent))
    );
    const paginationButtonsFound = paginationButtonTexts.filter(
      text => text && (text.match(/\d+/) || text.includes('Next') || text.includes('Previous'))
    );

    if (paginationButtonsFound.length > 0) {
      logSuccess(`Found ${paginationButtonsFound.length} pagination buttons`);

      // Look for page size selector
      const selectElements = await page.$$('select');
      if (selectElements.length > 0) {
        logSuccess(`Found ${selectElements.length} select elements (may include page size)`);
      }
    } else {
      logWarning('Pagination controls not found');
    }

    // Step 10: Test view toggle
    logStep('Testing view toggle navigation');
    const cardViewButton = await page.$('a[href="/dashboard"]');
    if (cardViewButton) {
      logSuccess('View toggle to card view found');
    } else {
      logWarning('View toggle button not found');
    }

    // Step 11: Test product images in table
    logStep('Checking for product images in table');
    const productImages = await page.$$('tbody img, tbody [class*="ProductImage"]');
    if (productImages.length > 0) {
      logSuccess(`Found ${productImages.length} product images in table`);
    } else {
      logWarning('Product images not found in table cells');
    }

    // Final screenshot
    const finalScreenshot = await takeFullPageScreenshot(page, 'table-final');
    screenshots.push(finalScreenshot);

    // Step 12: Check for console errors
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
