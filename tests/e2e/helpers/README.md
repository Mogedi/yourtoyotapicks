# E2E Test Helpers

Comprehensive test utilities for the YourToyotaPicks UI testing system.

## Files Overview

### 1. `types.ts`
TypeScript type definitions for all test utilities.

**Key Types:**
- `ScreenshotOptions` - Options for screenshot capture
- `ScreenshotMetadata` - Screenshot metadata with path and timestamp
- `ConsoleError`, `NetworkError`, `VisualError`, `JavaScriptError` - Error types
- `ErrorReport` - Aggregated error report
- `DashboardLoadState`, `VehicleDetailState` - Page state types

### 2. `screenshot.ts`
Screenshot capture and management utilities.

**Key Functions:**
- `takeScreenshot(page, name, options)` - Take a screenshot with options
- `takeFullPageScreenshot(page, name)` - Full page screenshot
- `takeElementScreenshot(page, selector, name)` - Element-specific screenshot
- `takeMultipleScreenshots(page, configs)` - Batch screenshot capture
- `resetSession()` - Start a new screenshot session
- `ensureScreenshotsDir()` - Create screenshots directory

**Features:**
- Timestamp-based folder organization (YYYY-MM-DD_HH-MM-SS)
- Automatic folder creation
- Sanitized filenames
- Support for full page and element screenshots
- Screenshot metadata tracking

### 3. `error-detector.ts`
Error detection and monitoring system.

**Key Class: `ErrorDetector`**

**Methods:**
- `start()` - Start monitoring page for errors
- `stop()` - Stop monitoring and generate report
- `addVisualError(description, selector, screenshotPath)` - Add manual visual error
- `addScreenshot(metadata)` - Add screenshot to report
- `getAllErrors()` - Get all detected errors
- `hasErrors()` - Check if any errors detected
- `exportToJSON(outputDir)` - Export report to JSON
- `printSummary()` - Print error summary to console

**Monitors:**
- Console errors and warnings
- Network failures (4xx, 5xx)
- JavaScript errors
- Request failures
- Response times

### 4. `test-utils.ts`
Common test helper functions and selectors.

**Key Constants:**
- `SELECTORS` - CSS selectors for all page elements
  - `SELECTORS.DASHBOARD.*` - Dashboard page selectors
  - `SELECTORS.VEHICLE_CARD.*` - Vehicle card selectors
  - `SELECTORS.VEHICLE_DETAIL.*` - Detail page selectors
  - `SELECTORS.FILTER_BAR.*` - Filter bar selectors

**Key Functions:**

**Page Waiting:**
- `waitForDashboardLoad(page, options)` - Wait for dashboard to load
- `waitForVehicleDetail(page, options)` - Wait for detail page to load
- `waitForNetworkIdle(page, timeout)` - Wait for network activity to stop

**Element Interaction:**
- `getVehicleCards(page)` - Get all vehicle cards with data
- `clickVehicleCard(page, index)` - Click specific vehicle card
- `waitForElement(page, selector, timeout)` - Wait for single element
- `waitForElements(page, selectors, timeout)` - Wait for multiple elements
- `elementExists(page, selector)` - Check if element exists

**Text Operations:**
- `getTextContent(page, selector)` - Get element text
- `getAttribute(page, selector, attribute)` - Get element attribute
- `typeText(page, selector, text, delay)` - Type with realistic delay
- `clearAndType(page, selector, text)` - Clear and type new text

**Utility:**
- `retry(fn, options)` - Retry function with exponential backoff
- `scrollToElement(page, selector)` - Scroll to element
- `setViewport(page, width, height)` - Set viewport size

## Usage Examples

### Basic Test with All Utilities

```typescript
import {
  createBrowser,
  takeScreenshot,
  ErrorDetector,
  waitForDashboardLoad,
  getVehicleCards,
  clickVehicleCard,
  waitForVehicleDetail,
  SELECTORS,
} from './helpers';

async function runTest() {
  // 1. Setup browser
  const { browser, page } = await createBrowser({
    headless: false,
    slowMo: 50,
  });

  // 2. Start error detection
  const errorDetector = new ErrorDetector(page, 'dashboard-test');
  await errorDetector.start();

  try {
    // 3. Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');

    // 4. Wait for dashboard to load
    const dashboardState = await waitForDashboardLoad(page);
    console.log(`Dashboard loaded with ${dashboardState.vehicleCount} vehicles`);

    // 5. Take screenshot
    const screenshot = await takeScreenshot(page, 'dashboard-loaded', {
      fullPage: true,
    });
    errorDetector.addScreenshot(screenshot);

    // 6. Get vehicle cards
    const cards = await getVehicleCards(page);
    console.log(`Found ${cards.length} vehicle cards`);

    // 7. Click first vehicle
    if (cards.length > 0) {
      await clickVehicleCard(page, 0);

      // 8. Wait for detail page
      const detailState = await waitForVehicleDetail(page);
      console.log(`Viewing vehicle: ${detailState.vin}`);

      // 9. Take detail screenshot
      const detailScreenshot = await takeScreenshot(page, 'vehicle-detail', {
        fullPage: true,
      });
      errorDetector.addScreenshot(detailScreenshot);
    }

    // 10. Stop error detection and get report
    const errorReport = await errorDetector.stop();

    // 11. Print summary
    errorDetector.printSummary();

    // 12. Export report
    if (errorReport.totalErrors > 0) {
      const reportPath = await errorDetector.exportToJSON();
      console.log(`Error report saved to: ${reportPath}`);
    }
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'error-state', { fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

runTest().catch(console.error);
```

### Screenshot Examples

```typescript
import { takeScreenshot, takeElementScreenshot, takeMultipleScreenshots } from './helpers';

// Full page screenshot
const fullPage = await takeScreenshot(page, 'full-dashboard', {
  fullPage: true,
});

// Element screenshot
const cardScreenshot = await takeElementScreenshot(
  page,
  SELECTORS.VEHICLE_CARD.CONTAINER,
  'first-vehicle-card'
);

// Multiple screenshots
const screenshots = await takeMultipleScreenshots(page, [
  { name: 'header', selector: 'header' },
  { name: 'filter-bar', selector: SELECTORS.FILTER_BAR.SEARCH_INPUT },
  { name: 'vehicle-list', options: { fullPage: false } },
]);

console.log(`Captured ${screenshots.length} screenshots`);
```

### Error Detection Examples

```typescript
import { ErrorDetector } from './helpers';

const detector = new ErrorDetector(page, 'my-test');
await detector.start();

// Navigate and interact with page...
await page.goto('http://localhost:3000/dashboard');

// Manually add visual error
detector.addVisualError(
  'Button appears misaligned',
  SELECTORS.VEHICLE_CARD.VIEW_DETAILS_BUTTON
);

// Stop and get report
const report = await detector.stop();

console.log(`Detected ${report.totalErrors} errors:`);
console.log(`- Console: ${report.errors.console.length}`);
console.log(`- Network: ${report.errors.network.length}`);
console.log(`- Visual: ${report.errors.visual.length}`);
console.log(`- JavaScript: ${report.errors.javascript.length}`);

// Export to JSON
await detector.exportToJSON('./test-reports');
```

### Test Utils Examples

```typescript
import {
  waitForDashboardLoad,
  getVehicleCards,
  retry,
  typeText,
  SELECTORS,
} from './helpers';

// Wait for dashboard with custom timeout
const state = await waitForDashboardLoad(page, {
  timeout: 60000,
  waitUntil: 'networkidle0',
});

// Get vehicle cards and iterate
const cards = await getVehicleCards(page);
for (const card of cards) {
  console.log(`${card.year} ${card.make} ${card.model} - ${card.price}`);
}

// Retry with custom options
const element = await retry(
  async () => {
    const el = await page.$(SELECTORS.VEHICLE_CARD.CONTAINER);
    if (!el) throw new Error('Card not found');
    return el;
  },
  {
    retries: 5,
    delay: 500,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`);
    },
  }
);

// Type in search box
await typeText(page, SELECTORS.FILTER_BAR.SEARCH_INPUT, 'Toyota Camry', 100);
```

### Complete Test Flow Example

```typescript
import {
  createBrowser,
  resetSession,
  ErrorDetector,
  waitForDashboardLoad,
  getVehicleCards,
  clickVehicleCard,
  waitForVehicleDetail,
  takeScreenshot,
  SELECTORS,
  retry,
} from './helpers';

async function completeTestFlow() {
  // Start new screenshot session
  await resetSession();

  const { browser, page } = await createBrowser({ headless: true });
  const detector = new ErrorDetector(page, 'complete-flow-test');

  try {
    await detector.start();

    // Step 1: Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle2',
    });

    // Step 2: Wait for dashboard load
    const dashboardState = await waitForDashboardLoad(page);
    if (!dashboardState.loaded) {
      throw new Error(`Dashboard failed to load: ${dashboardState.error}`);
    }

    // Step 3: Screenshot dashboard
    const dashScreenshot = await takeScreenshot(page, 'step-1-dashboard', {
      fullPage: true,
    });
    detector.addScreenshot(dashScreenshot);

    // Step 4: Get and validate cards
    const cards = await getVehicleCards(page);
    if (cards.length === 0) {
      detector.addVisualError('No vehicle cards found on dashboard');
    }

    // Step 5: Click first vehicle with retry
    await retry(
      async () => {
        await clickVehicleCard(page, 0);
      },
      { retries: 3, delay: 1000 }
    );

    // Step 6: Wait for detail page
    const detailState = await waitForVehicleDetail(page);
    if (!detailState.loaded) {
      throw new Error(`Detail page failed to load: ${detailState.error}`);
    }

    // Step 7: Screenshot detail page
    const detailScreenshot = await takeScreenshot(page, 'step-2-detail', {
      fullPage: true,
    });
    detector.addScreenshot(detailScreenshot);

    // Step 8: Validate detail page
    if (!detailState.hasImages) {
      detector.addVisualError('No images found on detail page');
    }
    if (!detailState.hasDetails) {
      detector.addVisualError('No vehicle details found');
    }

    // Step 9: Generate report
    const report = await detector.stop();
    detector.printSummary();

    if (report.totalErrors > 0) {
      await detector.exportToJSON('./test-reports');
      throw new Error(`Test completed with ${report.totalErrors} errors`);
    }

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'test-failure', { fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

completeTestFlow().catch(console.error);
```

## Screenshot Organization

Screenshots are automatically organized in timestamp-based folders:

```
tests/screenshots/
├── 2025-10-12_14-30-45/
│   ├── dashboard-loaded.png
│   ├── vehicle-detail.png
│   └── error-state.png
├── 2025-10-12_15-22-18/
│   ├── step-1-dashboard.png
│   └── step-2-detail.png
└── ...
```

## Error Reports

Error reports are saved as JSON files in the `tests/reports` directory:

```json
{
  "testName": "dashboard-test",
  "startTime": "2025-10-12T14:30:45.123Z",
  "endTime": "2025-10-12T14:31:12.456Z",
  "duration": 27333,
  "totalErrors": 2,
  "errors": {
    "console": [
      {
        "type": "console",
        "level": "error",
        "message": "Failed to load resource: 404",
        "timestamp": "2025-10-12T14:30:50.123Z",
        "url": "http://localhost:3000/api/vehicles"
      }
    ],
    "network": [
      {
        "type": "network",
        "url": "http://localhost:3000/api/vehicles/123",
        "status": 404,
        "statusText": "Not Found",
        "method": "GET",
        "timestamp": "2025-10-12T14:30:55.789Z",
        "responseTime": 125
      }
    ],
    "visual": [],
    "javascript": []
  },
  "screenshots": [
    {
      "name": "dashboard-loaded",
      "path": "dashboard-loaded.png",
      "timestamp": "2025-10-12T14:30:48.000Z",
      "folder": "2025-10-12_14-30-45",
      "fullPath": "/path/to/tests/screenshots/2025-10-12_14-30-45/dashboard-loaded.png",
      "url": "http://localhost:3000/dashboard",
      "viewport": { "width": 1920, "height": 1080 }
    }
  ],
  "url": "http://localhost:3000/dashboard"
}
```

## Best Practices

1. **Always use error detection** - Catch issues early
2. **Take screenshots at key points** - Visual debugging is invaluable
3. **Use retry for flaky operations** - Network requests, element visibility
4. **Leverage selectors constants** - Centralized maintenance
5. **Wait for proper page states** - Use `waitForDashboardLoad`, etc.
6. **Export error reports** - Keep history for analysis
7. **Reset session per test suite** - Organized screenshot folders

## Tips

- Use `headless: false` during development to watch tests run
- Use `slowMo` option to slow down operations for debugging
- Always clean up browser instances in `finally` blocks
- Check error detector reports even for "passing" tests
- Take screenshots before and after critical actions
