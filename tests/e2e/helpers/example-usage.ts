/**
 * Example Usage of E2E Test Helpers
 *
 * This file demonstrates how to use all the test utilities together.
 * Run with: ts-node tests/e2e/helpers/example-usage.ts
 */

import {
  launchBrowser,
  closeBrowser,
  resetSession,
  ErrorDetector,
  waitForDashboardLoad,
  getVehicleCards,
  clickVehicleCard,
  waitForVehicleDetail,
  takeScreenshot,
  takeFullPageScreenshot,
  SELECTORS,
  retry,
  type BrowserContext,
} from './index';

/**
 * Example 1: Basic Dashboard Test
 */
async function exampleBasicDashboardTest() {
  console.log('\n=== Example 1: Basic Dashboard Test ===\n');

  // Start new screenshot session
  await resetSession();

  // Launch browser
  const context: BrowserContext = await launchBrowser();
  const { browser, page } = context;

  // Start error detection
  const detector = new ErrorDetector(page, 'basic-dashboard-test');
  await detector.start();

  try {
    // Navigate to dashboard
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for dashboard to load
    console.log('Waiting for dashboard to load...');
    const dashboardState = await waitForDashboardLoad(page);

    if (!dashboardState.loaded) {
      throw new Error(`Dashboard failed to load: ${dashboardState.error}`);
    }

    console.log(`Dashboard loaded with ${dashboardState.vehicleCount} vehicles`);

    // Take screenshot
    console.log('Taking screenshot...');
    const screenshot = await takeFullPageScreenshot(page, 'dashboard-loaded');
    detector.addScreenshot(screenshot);

    // Stop error detection
    const report = await detector.stop();
    detector.printSummary();

    if (report.totalErrors > 0) {
      await detector.exportToJSON();
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'test-failure', { fullPage: true });
    throw error;
  } finally {
    await closeBrowser(context);
  }
}

/**
 * Example 2: Vehicle Card Interaction
 */
async function exampleVehicleCardInteraction() {
  console.log('\n=== Example 2: Vehicle Card Interaction ===\n');

  await resetSession();

  const context = await launchBrowser();
  const { browser, page } = context;

  const detector = new ErrorDetector(page, 'vehicle-card-interaction');
  await detector.start();

  try {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle2',
    });

    // Wait for dashboard
    await waitForDashboardLoad(page);

    // Get all vehicle cards
    console.log('Getting vehicle cards...');
    const cards = await getVehicleCards(page);
    console.log(`Found ${cards.length} vehicles`);

    // Print details of each card
    cards.forEach((card, index) => {
      console.log(
        `  ${index + 1}. ${card.year} ${card.make} ${card.model} - ${card.price}`
      );
    });

    // Click the first vehicle card
    if (cards.length > 0) {
      console.log('\nClicking first vehicle card...');
      await clickVehicleCard(page, 0);

      // Wait for detail page
      console.log('Waiting for detail page...');
      const detailState = await waitForVehicleDetail(page);

      if (detailState.loaded) {
        console.log(`Viewing vehicle: ${detailState.vin}`);
        console.log(`  Has images: ${detailState.hasImages}`);
        console.log(`  Has details: ${detailState.hasDetails}`);
        console.log(`  Has history: ${detailState.hasHistory}`);

        // Take screenshot of detail page
        const screenshot = await takeFullPageScreenshot(page, 'vehicle-detail');
        detector.addScreenshot(screenshot);
      }
    }

    const report = await detector.stop();
    detector.printSummary();

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    await closeBrowser(context);
  }
}

/**
 * Example 3: Error Detection and Retry
 */
async function exampleErrorDetectionAndRetry() {
  console.log('\n=== Example 3: Error Detection and Retry ===\n');

  await resetSession();

  const context = await launchBrowser();
  const { browser, page } = context;

  const detector = new ErrorDetector(page, 'error-detection-test');
  await detector.start();

  try {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle2',
    });

    // Use retry for potentially flaky operations
    console.log('Attempting to find vehicle cards with retry...');
    const cards = await retry(
      async () => {
        const vehicleCards = await getVehicleCards(page);
        if (vehicleCards.length === 0) {
          throw new Error('No vehicle cards found');
        }
        return vehicleCards;
      },
      {
        retries: 3,
        delay: 1000,
        onRetry: (attempt, error) => {
          console.log(`  Retry attempt ${attempt}: ${error.message}`);
        },
      }
    );

    console.log(`Found ${cards.length} cards after retry`);

    // Manually add a visual error for demonstration
    detector.addVisualError(
      'Example visual error - button alignment issue',
      SELECTORS.VEHICLE_CARD.VIEW_DETAILS_BUTTON
    );

    // Stop and generate report
    const report = await detector.stop();

    console.log('\nError Report Summary:');
    console.log(`  Total errors: ${report.totalErrors}`);
    console.log(`  Console errors: ${report.errors.console.length}`);
    console.log(`  Network errors: ${report.errors.network.length}`);
    console.log(`  Visual errors: ${report.errors.visual.length}`);
    console.log(`  JavaScript errors: ${report.errors.javascript.length}`);

    // Export report if errors found
    if (report.totalErrors > 0) {
      const reportPath = await detector.exportToJSON();
      console.log(`\nReport exported to: ${reportPath}`);
    }

    detector.printSummary();
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    await closeBrowser(context);
  }
}

/**
 * Example 4: Complete Test Flow with All Features
 */
async function exampleCompleteFlow() {
  console.log('\n=== Example 4: Complete Test Flow ===\n');

  await resetSession();

  const context = await launchBrowser();
  const { browser, page } = context;

  const detector = new ErrorDetector(page, 'complete-flow-test');
  await detector.start();

  try {
    // Step 1: Dashboard
    console.log('Step 1: Loading dashboard...');
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle2',
    });

    const dashboardState = await waitForDashboardLoad(page, { timeout: 30000 });
    if (!dashboardState.loaded) {
      throw new Error('Dashboard failed to load');
    }

    console.log(`  Loaded: ${dashboardState.vehicleCount} vehicles`);

    const dashScreenshot = await takeScreenshot(page, 'step-1-dashboard', {
      fullPage: true,
    });
    detector.addScreenshot(dashScreenshot);

    // Step 2: Get vehicles
    console.log('\nStep 2: Getting vehicle cards...');
    const cards = await getVehicleCards(page);
    console.log(`  Found ${cards.length} vehicles`);

    if (cards.length === 0) {
      detector.addVisualError('No vehicles found on dashboard');
    }

    // Step 3: Click vehicle
    console.log('\nStep 3: Opening vehicle detail...');
    await retry(
      async () => {
        await clickVehicleCard(page, 0);
      },
      { retries: 3 }
    );

    // Step 4: Detail page
    console.log('\nStep 4: Validating detail page...');
    const detailState = await waitForVehicleDetail(page);

    if (!detailState.loaded) {
      throw new Error('Detail page failed to load');
    }

    console.log(`  VIN: ${detailState.vin}`);
    console.log(`  Images: ${detailState.hasImages ? 'Yes' : 'No'}`);
    console.log(`  Details: ${detailState.hasDetails ? 'Yes' : 'No'}`);
    console.log(`  History: ${detailState.hasHistory ? 'Yes' : 'No'}`);

    if (!detailState.hasImages) {
      detector.addVisualError('No vehicle images found');
    }

    const detailScreenshot = await takeScreenshot(page, 'step-2-detail', {
      fullPage: true,
    });
    detector.addScreenshot(detailScreenshot);

    // Step 5: Generate report
    console.log('\nStep 5: Generating report...');
    const report = await detector.stop();

    console.log('\n=== Test Results ===');
    console.log(`Duration: ${report.duration}ms`);
    console.log(`Screenshots: ${report.screenshots.length}`);
    console.log(`Errors: ${report.totalErrors}`);

    if (report.totalErrors > 0) {
      const reportPath = await detector.exportToJSON();
      console.log(`Report saved: ${reportPath}`);
      detector.printSummary();
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'test-failure', { fullPage: true });
    throw error;
  } finally {
    await closeBrowser(context);
  }
}

/**
 * Main function - run all examples
 */
async function main() {
  console.log('\n====================================');
  console.log('E2E Test Helpers - Usage Examples');
  console.log('====================================');

  try {
    // Uncomment the example you want to run:

    await exampleBasicDashboardTest();
    // await exampleVehicleCardInteraction();
    // await exampleErrorDetectionAndRetry();
    // await exampleCompleteFlow();

    console.log('\n✓ All examples completed successfully!\n');
  } catch (error) {
    console.error('\n✗ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}
